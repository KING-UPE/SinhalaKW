import bpy
import os
import math

def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)

def setup_studio_environment():
    world = bpy.data.worlds.new("Studio_World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get('Background')
    if bg:
        bg.inputs['Color'].default_value = (0.75, 0.80, 0.90, 1.0)
        bg.inputs['Strength'].default_value = 0.85
    
    # Key Light
    bpy.ops.object.light_add(type='AREA', location=(3.8, -4.5, 4.0))
    key = bpy.context.active_object
    key.name = "Key_Light"
    key.data.energy = 800
    key.data.size = 3.5
    key.data.color = (1.0, 0.96, 0.88)
    
    # Fill Light
    bpy.ops.object.light_add(type='AREA', location=(-3.8, -3.5, 2.2))
    fill = bpy.context.active_object
    fill.name = "Fill_Light"
    fill.data.energy = 450
    fill.data.size = 4.0
    fill.data.color = (0.75, 0.88, 1.0)
    
    # Top Softbox
    bpy.ops.object.light_add(type='AREA', location=(0.0, -1.0, 4.8))
    top = bpy.context.active_object
    top.name = "Top_Softbox"
    top.data.energy = 550
    top.data.size = 4.0
    top.data.color = (1.0, 0.98, 0.92)
    
    # Rim Light
    bpy.ops.object.light_add(type='POINT', location=(0.0, 4.5, 3.0))
    rim = bpy.context.active_object
    rim.name = "Rim_Light"
    rim.data.energy = 900
    rim.data.color = (1.0, 0.85, 0.45)

def create_gold_material():
    mat = bpy.data.materials.new(name="Gold_Luxury")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (1.0, 0.62, 0.06, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.90
        bsdf.inputs['Roughness'].default_value = 0.16
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = 1.0
    return mat

def create_obsidian_material():
    mat = bpy.data.materials.new(name="Obsidian_Globe")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.010, 0.022, 0.048, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.85
        bsdf.inputs['Roughness'].default_value = 0.12
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = 1.0
    return mat

def create_brass_material():
    mat = bpy.data.materials.new(name="Stand_Brass")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.92, 0.65, 0.15, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.95
        bsdf.inputs['Roughness'].default_value = 0.20
    return mat

def build_emblem_cutter():
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
    cutter.name = "Emblem_Cutter"
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    cutter.location = (0, 0, 0)
    
    scale_fac = 1.96 / max(cutter.dimensions.x, cutter.dimensions.y)
    cutter.scale = (scale_fac, scale_fac, scale_fac)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    bpy.ops.object.convert(target='MESH')
    # Rotate -90 deg around X so upright flame is at +Z and faces -Y
    cutter.rotation_euler = (math.radians(-90), 0, 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.extrude_region_move(
        TRANSFORM_OT_translate={"value": (0, 3.4, 0)}
    )
    bpy.ops.object.mode_set(mode='OBJECT')
    
    cutter.location.y = -1.7
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    return cutter

def setup_camera(distance=5.8, angle_deg=30, elevation_deg=16, target_z=0.0):
    bpy.ops.object.camera_add()
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam
    cam.data.lens = 85
    
    rad_a = math.radians(angle_deg)
    rad_e = math.radians(elevation_deg)
    
    cam.location.x = distance * math.sin(rad_a) * math.cos(rad_e)
    cam.location.y = -distance * math.cos(rad_a) * math.cos(rad_e)
    cam.location.z = target_z + distance * math.sin(rad_e)
    
    track = cam.constraints.new(type='TRACK_TO')
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, target_z))
    target = bpy.context.active_object
    track.target = target
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    return cam

def main():
    out_dir = os.path.abspath("assets/3d")
    os.makedirs(out_dir, exist_ok=True)
    
    # ==========================================================
    # 1. BUILD MODEL 1: SPHERICAL GLOBE ORB (Floating Globe)
    # ==========================================================
    print("=== 1. Building Spherical Globe Orb ===")
    clean_scene()
    setup_studio_environment()
    gold_mat = create_gold_material()
    obsidian_mat = create_obsidian_material()
    
    # Cutter
    cutter = build_emblem_cutter()
    
    # Outer UV Sphere (256x128 for buttery curves)
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.00, segments=256, ring_count=128, location=(0, 0, 0)
    )
    sphere = bpy.context.active_object
    sphere.name = "Globe_Emblem_Ribbons"
    
    mod = sphere.modifiers.new(name="Emblem_Intersect", type='BOOLEAN')
    mod.operation = 'INTERSECT'
    mod.object = cutter
    mod.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    
    # Solidify inwards
    solid = sphere.modifiers.new(name="Solidify", type='SOLIDIFY')
    solid.thickness = 0.08
    solid.offset = -1.0
    solid.use_even_offset = True
    solid.use_quality_normals = True
    bpy.ops.object.modifier_apply(modifier=solid.name)
    
    bpy.ops.object.shade_smooth()
    sphere.data.materials.clear()
    sphere.data.materials.append(gold_mat)
    for poly in sphere.data.polygons:
        poly.material_index = 0
        
    # Obsidian Core Sphere
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.94, segments=128, ring_count=64, location=(0, 0, 0)
    )
    core = bpy.context.active_object
    core.name = "Globe_Obsidian_Core"
    bpy.ops.object.shade_smooth()
    core.data.materials.clear()
    core.data.materials.append(obsidian_mat)
    for poly in core.data.polygons:
        poly.material_index = 0
        
    # Parent Globe Orb
    orb_parent = bpy.data.objects.new("SinhalaKW_Globe_Orb", None)
    bpy.context.scene.collection.objects.link(orb_parent)
    sphere.parent = orb_parent
    core.parent = orb_parent
    
    # Render Globe Orb Angle (30 deg perspective)
    cam_angle = setup_camera(distance=5.8, angle_deg=30, elevation_deg=16)
    scene = bpy.context.scene
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.film_transparent = True
    scene.render.filepath = os.path.join(out_dir, "render_globe_orb_angle.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_globe_orb_angle.png")
    
    # Render Globe Orb Frontal
    cam_angle.location = (0, -5.8, 0)
    scene.render.filepath = os.path.join(out_dir, "render_globe_orb_front.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_globe_orb_front.png")
    
    # Export Model 1 Formats
    bpy.ops.object.select_all(action='DESELECT')
    sphere.select_set(True)
    core.select_set(True)
    
    glb_path = os.path.join(out_dir, "sinhala_kw_globe_orb.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_path, export_format='GLB', use_selection=True, export_apply=True
    )
    print(f"Exported {glb_path}")
    
    obj_path = os.path.join(out_dir, "sinhala_kw_globe_orb.obj")
    bpy.ops.wm.obj_export(filepath=obj_path, export_selected_objects=True)
    print(f"Exported {obj_path}")
    
    stl_path = os.path.join(out_dir, "sinhala_kw_globe_orb.stl")
    bpy.ops.wm.stl_export(filepath=stl_path, export_selected_objects=True)
    print(f"Exported {stl_path}")
    
    # ==========================================================
    # 2. BUILD MODEL 2: ACADEMIC WORLD GLOBE (With Stand & Meridian)
    # ==========================================================
    print("=== 2. Building Academic World Globe ===")
    clean_scene()
    setup_studio_environment()
    gold_mat = create_gold_material()
    obsidian_mat = create_obsidian_material()
    brass_mat = create_brass_material()
    
    # Cutter
    cutter2 = build_emblem_cutter()
    
    # Sphere Ribbons
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.00, segments=256, ring_count=128, location=(0, 0, 0)
    )
    wg_sphere = bpy.context.active_object
    wg_sphere.name = "WG_Emblem_Ribbons"
    
    mod2 = wg_sphere.modifiers.new(name="Emblem_Intersect", type='BOOLEAN')
    mod2.operation = 'INTERSECT'
    mod2.object = cutter2
    mod2.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod2.name)
    bpy.data.objects.remove(cutter2, do_unlink=True)
    
    solid2 = wg_sphere.modifiers.new(name="Solidify", type='SOLIDIFY')
    solid2.thickness = 0.08
    solid2.offset = -1.0
    solid2.use_even_offset = True
    solid2.use_quality_normals = True
    bpy.ops.object.modifier_apply(modifier=solid2.name)
    
    bpy.ops.object.shade_smooth()
    wg_sphere.data.materials.clear()
    wg_sphere.data.materials.append(gold_mat)
    for poly in wg_sphere.data.polygons:
        poly.material_index = 0
        
    # Obsidian Core
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.94, segments=128, ring_count=64, location=(0, 0, 0)
    )
    wg_core = bpy.context.active_object
    wg_core.name = "WG_Obsidian_Core"
    bpy.ops.object.shade_smooth()
    wg_core.data.materials.clear()
    wg_core.data.materials.append(obsidian_mat)
    for poly in wg_core.data.polygons:
        poly.material_index = 0
        
    # Coordinate Rings: Equator & Tropics
    bpy.ops.mesh.primitive_torus_add(
        align='WORLD', location=(0, 0, 0),
        major_radius=0.97, minor_radius=0.007,
        major_segments=96, minor_segments=16
    )
    wg_eq = bpy.context.active_object
    wg_eq.name = "WG_Equator"
    wg_eq.data.materials.clear()
    wg_eq.data.materials.append(gold_mat)
    bpy.ops.object.shade_smooth()
    
    tropic_objs = []
    for lat_deg in [23.5, -23.5]:
        z_pos = math.sin(math.radians(lat_deg)) * 0.97
        r_lat = math.cos(math.radians(lat_deg)) * 0.97
        bpy.ops.mesh.primitive_torus_add(
            align='WORLD', location=(0, 0, z_pos),
            major_radius=r_lat, minor_radius=0.005,
            major_segments=96, minor_segments=16
        )
        tr = bpy.context.active_object
        tr.name = f"WG_Tropic_{lat_deg}"
        tr.data.materials.clear()
        tr.data.materials.append(gold_mat)
        bpy.ops.object.shade_smooth()
        tropic_objs.append(tr)
        
    # Group Globe Body and apply axial tilt of 23.5 degrees
    globe_body = bpy.data.objects.new("Globe_Body", None)
    bpy.context.scene.collection.objects.link(globe_body)
    wg_sphere.parent = globe_body
    wg_core.parent = globe_body
    wg_eq.parent = globe_body
    for tr in tropic_objs:
        tr.parent = globe_body
        
    globe_body.rotation_euler = (0, math.radians(23.5), 0)
    
    # Stand Elements:
    # Axis Pin through poles (tilted with globe)
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.016, depth=2.42, location=(0, 0, 0),
        rotation=(0, math.radians(23.5), 0)
    )
    pin = bpy.context.active_object
    pin.name = "WG_Axis_Pin"
    pin.data.materials.clear()
    pin.data.materials.append(brass_mat)
    bpy.ops.object.shade_smooth()
    
    # Semi-Meridian Arm (Curved golden bracket outside the globe)
    bpy.ops.mesh.primitive_torus_add(
        align='WORLD', location=(0, 0, 0),
        rotation=(0, math.radians(23.5), 0),
        major_radius=1.18, minor_radius=0.022,
        major_segments=96, minor_segments=16
    )
    bracket = bpy.context.active_object
    bracket.name = "WG_Meridian_Arm"
    bracket.data.materials.clear()
    bracket.data.materials.append(brass_mat)
    bpy.ops.object.shade_smooth()
    
    # Pedestal Stem
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.045, depth=0.45, location=(0, 0, -1.30)
    )
    stem = bpy.context.active_object
    stem.name = "WG_Stem"
    stem.data.materials.clear()
    stem.data.materials.append(brass_mat)
    bpy.ops.object.shade_smooth()
    
    # Pedestal Mid
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.55, depth=0.06, location=(0, 0, -1.52)
    )
    ped_mid = bpy.context.active_object
    ped_mid.name = "WG_Pedestal_Mid"
    ped_mid.data.materials.clear()
    ped_mid.data.materials.append(obsidian_mat)
    bpy.ops.object.shade_smooth()
    
    # Pedestal Base
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.75, depth=0.08, location=(0, 0, -1.58)
    )
    ped_base = bpy.context.active_object
    ped_base.name = "WG_Pedestal_Base"
    ped_base.data.materials.clear()
    ped_base.data.materials.append(brass_mat)
    bpy.ops.object.shade_smooth()
    
    # Render World Globe Frontal
    cam_wg = setup_camera(distance=6.8, angle_deg=0, elevation_deg=6, target_z=-0.15)
    scene = bpy.context.scene
    scene.render.filepath = os.path.join(out_dir, "render_world_globe_front.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_world_globe_front.png")
    
    # Render World Globe Angle (30 deg perspective)
    bpy.data.objects.remove(cam_wg, do_unlink=True)
    cam_wg_angle = setup_camera(distance=6.8, angle_deg=28, elevation_deg=14, target_z=-0.15)
    scene.render.filepath = os.path.join(out_dir, "render_world_globe_angle.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_world_globe_angle.png")
    
    # Export World Globe Formats
    bpy.ops.object.select_all(action='SELECT')
    for obj in bpy.context.scene.objects:
        if obj.type in ['LIGHT', 'CAMERA', 'EMPTY']:
            obj.select_set(False)
            
    glb_wg_path = os.path.join(out_dir, "sinhala_kw_world_globe.glb")
    bpy.ops.export_scene.gltf(
        filepath=glb_wg_path, export_format='GLB', use_selection=True, export_apply=True
    )
    print(f"Exported {glb_wg_path}")
    
    obj_wg_path = os.path.join(out_dir, "sinhala_kw_world_globe.obj")
    bpy.ops.wm.obj_export(filepath=obj_wg_path, export_selected_objects=True)
    print(f"Exported {obj_wg_path}")
    
    stl_wg_path = os.path.join(out_dir, "sinhala_kw_world_globe.stl")
    bpy.ops.wm.stl_export(filepath=stl_wg_path, export_selected_objects=True)
    print(f"Exported {stl_wg_path}")
    
    blend_path = os.path.join(out_dir, "sinhala_kw_globe.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved {blend_path}")

if __name__ == "__main__":
    main()
