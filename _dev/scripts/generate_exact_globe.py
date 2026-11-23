import bpy
import os
import math

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)

def setup_studio():
    world = bpy.data.worlds.new("Studio")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get('Background')
    if bg:
        bg.inputs['Color'].default_value = (0.85, 0.88, 0.95, 1.0)
        bg.inputs['Strength'].default_value = 0.85
        
    # Key light
    bpy.ops.object.light_add(type='AREA', location=(3.5, -4.5, 4.0))
    l1 = bpy.context.active_object
    l1.data.energy = 750
    l1.data.size = 3.5
    l1.data.color = (1.0, 0.97, 0.90)

    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-3.5, -3.5, 2.5))
    l2 = bpy.context.active_object
    l2.data.energy = 450
    l2.data.size = 4.0
    l2.data.color = (0.75, 0.88, 1.0)
    
    # Back rim
    bpy.ops.object.light_add(type='POINT', location=(0.0, 4.5, 2.5))
    l3 = bpy.context.active_object
    l3.data.energy = 750
    l3.data.color = (1.0, 0.85, 0.5)

def create_gold_mat():
    mat = bpy.data.materials.new(name="Gold_KW_Luxury")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (1.0, 0.60, 0.04, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.92
    bsdf.inputs['Roughness'].default_value = 0.16
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 1.0
    return mat

def build_cutter():
    svg_path = os.path.abspath("assets/logos/emblem_vector.svg")
    bpy.ops.import_curve.svg(filepath=svg_path)
    curves = [o for o in bpy.context.scene.objects if o.type == 'CURVE']
    bpy.ops.object.select_all(action='DESELECT')
    for c in curves:
        c.select_set(True)
    bpy.context.view_layer.objects.active = curves[0]
    if len(curves) > 1:
        bpy.ops.object.join()
        
    cutter = bpy.context.active_object
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    cutter.location = (0, 0, 0)
    
    # Outer circle diameter is exactly 2.000m
    max_d = max(cutter.dimensions.x, cutter.dimensions.y)
    scale_fac = 2.000 / max_d
    cutter.scale = (scale_fac, scale_fac, scale_fac)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    bpy.ops.object.convert(target='MESH')
    # Normal is +Z
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.extrude_region_move(TRANSFORM_OT_translate={"value": (0, 0, 3.2)})
    bpy.ops.object.mode_set(mode='OBJECT')
    
    cutter.location.z = -1.6
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    return cutter

def generate_exact_globe():
    clean_scene()
    setup_studio()
    gold_mat = create_gold_mat()
    
    cutter = build_cutter()
    
    # UV Sphere of radius 1.0 (diameter 2.0) with high density for pristine curvature
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.00, segments=256, ring_count=128, location=(0, 0, 0)
    )
    globe = bpy.context.active_object
    globe.name = "SinhalaKW_3D_Globe"
    
    # Boolean intersect
    mod = globe.modifiers.new(name="Intersect", type='BOOLEAN')
    mod.operation = 'INTERSECT'
    mod.object = cutter
    mod.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    
    # Smooth shading
    bpy.ops.object.shade_smooth()
    
    globe.data.materials.clear()
    globe.data.materials.append(gold_mat)
    for poly in globe.data.polygons:
        poly.material_index = 0
        
    out_dir = os.path.abspath("assets/3d")
    
    # 1. Exact Face View (Frontal view, orthographic - 100% identical to logo)
    bpy.ops.object.camera_add(location=(0, 0, 5.0), rotation=(0, 0, 0))
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 2.22
    
    scene = bpy.context.scene
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.film_transparent = True
    scene.render.filepath = os.path.join(out_dir, "render_globe_face.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_globe_face.png (100% exact logo face view)")
    
    # 2. 3D Globe Perspective View (35 deg perspective angle showing spherical volume)
    cam.data.type = 'PERSP'
    cam.data.lens = 85
    dist = 5.8
    rad_a = math.radians(35)
    rad_e = math.radians(20)
    cam.location.x = dist * math.sin(rad_a) * math.cos(rad_e)
    cam.location.y = -dist * math.cos(rad_a) * math.cos(rad_e)
    cam.location.z = dist * math.sin(rad_e)
    
    track = cam.constraints.new(type='TRACK_TO')
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    track.target = bpy.context.active_object
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    
    scene.render.filepath = os.path.join(out_dir, "render_globe_angle.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_globe_angle.png (Spherical 3D globe angle)")
    
    # 3. Export GLB
    bpy.ops.object.select_all(action='DESELECT')
    globe.select_set(True)
    bpy.context.view_layer.objects.active = globe
    
    glb_path = os.path.join(out_dir, "sinhala_kw_globe_exact.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True
    )
    print(f"Exported {glb_path}")
    
    # Export OBJ
    obj_path = os.path.join(out_dir, "sinhala_kw_globe_exact.obj")
    bpy.ops.wm.obj_export(filepath=obj_path, export_selected_objects=True)
    print(f"Exported {obj_path}")
    
    # Export STL (for 3D printing)
    stl_path = os.path.join(out_dir, "sinhala_kw_globe_exact.stl")
    bpy.ops.wm.stl_export(filepath=stl_path, export_selected_objects=True)
    print(f"Exported {stl_path}")
    
    # Save Blend file
    blend_path = os.path.join(out_dir, "sinhala_kw_globe_exact.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved {blend_path}")

generate_exact_globe()
