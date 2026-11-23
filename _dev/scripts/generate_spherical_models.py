import bpy, os, math

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
        # Dark studio backdrop for dramatic gold reflection
        bg.inputs['Color'].default_value = (0.04, 0.06, 0.10, 1.0)
        bg.inputs['Strength'].default_value = 0.5

    # Main Key Light (Soft Warm Studio Light)
    bpy.ops.object.light_add(type='AREA', location=(3.5, -4.0, 3.5))
    l1 = bpy.context.active_object
    l1.data.energy = 900
    l1.data.size = 3.5
    l1.data.color = (1.0, 0.96, 0.90)

    # Fill Light (Cool Soft)
    bpy.ops.object.light_add(type='AREA', location=(-3.8, -3.2, 2.0))
    l2 = bpy.context.active_object
    l2.data.energy = 550
    l2.data.size = 4.0
    l2.data.color = (0.75, 0.88, 1.0)

    # Rim / Hair Light (Bright Warm Gold Rim)
    bpy.ops.object.light_add(type='AREA', location=(0.0, 4.2, 3.0), rotation=(math.radians(140), 0, 0))
    l3 = bpy.context.active_object
    l3.data.energy = 1100
    l3.data.size = 3.0
    l3.data.color = (1.0, 0.85, 0.4)

    # Bottom Bounce Light
    bpy.ops.object.light_add(type='AREA', location=(0.0, -1.0, -3.5), rotation=(math.radians(-60), 0, 0))
    l4 = bpy.context.active_object
    l4.data.energy = 400
    l4.data.size = 3.5
    l4.data.color = (1.0, 0.75, 0.3)

def create_gold_material():
    mat = bpy.data.materials.new(name="Gold_KW_Luxury")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    # Rich 24K Royal Gold
    bsdf.inputs['Base Color'].default_value = (1.0, 0.65, 0.05, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.95
    bsdf.inputs['Roughness'].default_value = 0.14
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 1.0
    return mat

def create_obsidian_material():
    mat = bpy.data.materials.new(name="Obsidian_Core")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (0.02, 0.025, 0.035, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.1
    bsdf.inputs['Roughness'].default_value = 0.05
    return mat

def build_svg_cutter():
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
    max_d = max(cutter.dimensions.x, cutter.dimensions.y)
    scale_fac = 2.000 / max_d
    cutter.scale = (scale_fac, scale_fac, scale_fac)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    
    bpy.ops.object.convert(target='MESH')
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

def make_spherical_shell(thickness=0.12):
    # Builds a hollow spherical shell intersected with cutter
    cutter = build_svg_cutter()
    
    # Outer sphere
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.00, segments=256, ring_count=128, location=(0,0,0))
    outer_s = bpy.context.active_object
    
    # Inner sphere
    r_in = 1.00 - thickness
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r_in, segments=256, ring_count=128, location=(0,0,0))
    inner_s = bpy.context.active_object
    
    # Shell difference
    bpy.context.view_layer.objects.active = outer_s
    outer_s.select_set(True)
    mod_shell = outer_s.modifiers.new(name="Shell", type='BOOLEAN')
    mod_shell.operation = 'DIFFERENCE'
    mod_shell.object = inner_s
    mod_shell.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod_shell.name)
    bpy.data.objects.remove(inner_s, do_unlink=True)
    
    # Intersect with cutter
    bpy.context.view_layer.objects.active = outer_s
    outer_s.select_set(True)
    mod_cut = outer_s.modifiers.new(name="Cut", type='BOOLEAN')
    mod_cut.operation = 'INTERSECT'
    mod_cut.object = cutter
    mod_cut.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod_cut.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    
    # Apply smooth by angle for crisp edges without shading pinching
    bpy.context.view_layer.objects.active = outer_s
    outer_s.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    
    return outer_s

print("Script module defined.")
def render_and_export():
    out_dir = os.path.abspath("assets/3d")
    os.makedirs(out_dir, exist_ok=True)
    
    # ------------------------------------------------------------------
    # 1. GENERATE HOLLOW SPHERICAL SHELL GLOBE (The Primary 3D Globe Shape)
    # ------------------------------------------------------------------
    clean_scene()
    setup_studio()
    gold_mat = create_gold_material()
    
    shell = make_spherical_shell(thickness=0.12)
    shell.name = "SinhalaKW_Globe_Shell"
    
    shell.data.materials.clear()
    shell.data.materials.append(gold_mat)
    for poly in shell.data.polygons:
        poly.material_index = 0
        
    # Camera
    bpy.ops.object.camera_add(location=(0, 0, 4.5), rotation=(0, 0, 0))
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam
    
    scene = bpy.context.scene
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.film_transparent = True
    
    # Render Front View (Exact 100% match)
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 2.22
    cam.location = (0, 0, 4.5)
    cam.rotation_euler = (0, 0, 0)
    scene.render.filepath = os.path.join(out_dir, "render_globe_shell_face.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_globe_shell_face.png")
    
    # Render Angle View (35 deg yaw, 18 deg pitch)
    cam.data.type = 'PERSP'
    cam.data.lens = 80
    dist = 4.2
    rad_a = math.radians(35)
    rad_e = math.radians(18)
    cam.location.x = dist * math.sin(rad_a) * math.cos(rad_e)
    cam.location.y = -dist * math.cos(rad_a) * math.cos(rad_e)
    cam.location.z = dist * math.sin(rad_e)
    
    track = cam.constraints.new(type='TRACK_TO')
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    track.target = bpy.context.active_object
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'
    
    scene.render.filepath = os.path.join(out_dir, "render_globe_shell_angle.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_globe_shell_angle.png")
    
    # Export Shell Model
    bpy.ops.object.select_all(action='DESELECT')
    shell.select_set(True)
    bpy.context.view_layer.objects.active = shell
    
    glb_shell_path = os.path.join(out_dir, "sinhala_kw_globe_shell.glb")
    bpy.ops.export_scene.gltf(filepath=glb_shell_path, export_format='GLB', use_selection=True, export_apply=True)
    print(f"Exported {glb_shell_path}")
    
    obj_shell_path = os.path.join(out_dir, "sinhala_kw_globe_shell.obj")
    bpy.ops.wm.obj_export(filepath=obj_shell_path, export_selected_objects=True)
    print(f"Exported {obj_shell_path}")

    stl_shell_path = os.path.join(out_dir, "sinhala_kw_globe_shell.stl")
    bpy.ops.wm.stl_export(filepath=stl_shell_path, export_selected_objects=True)
    print(f"Exported {stl_shell_path}")

    # Also save as the primary exact globe model (so it updates default!)
    glb_exact_path = os.path.join(out_dir, "sinhala_kw_globe_exact.glb")
    bpy.ops.export_scene.gltf(filepath=glb_exact_path, export_format='GLB', use_selection=True, export_apply=True)
    print(f"Updated primary exact model: {glb_exact_path}")
    
    # ------------------------------------------------------------------
    # 2. GENERATE LUXURY ORB (Shell with Polished Obsidian Core)
    # ------------------------------------------------------------------
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.86, segments=128, ring_count=64, location=(0,0,0))
    core = bpy.context.active_object
    core.name = "Obsidian_Core"
    obs_mat = create_obsidian_material()
    core.data.materials.append(obs_mat)
    bpy.ops.object.shade_smooth()
    
    scene.render.filepath = os.path.join(out_dir, "render_globe_orb_angle.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_globe_orb_angle.png")
    
    bpy.ops.object.select_all(action='DESELECT')
    shell.select_set(True)
    core.select_set(True)
    bpy.context.view_layer.objects.active = shell
    
    glb_orb_path = os.path.join(out_dir, "sinhala_kw_globe_orb.glb")
    bpy.ops.export_scene.gltf(filepath=glb_orb_path, export_format='GLB', use_selection=True, export_apply=True)
    print(f"Exported {glb_orb_path}")

    # ------------------------------------------------------------------
    # 3. GENERATE SOLID SPHERICAL GLOBE (With Crisp Smooth-By-Angle)
    # ------------------------------------------------------------------
    bpy.data.objects.remove(core, do_unlink=True)
    bpy.data.objects.remove(shell, do_unlink=True)
    
    cutter_solid = build_svg_cutter()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.00, segments=256, ring_count=128, location=(0,0,0))
    solid = bpy.context.active_object
    solid.name = "SinhalaKW_Globe_Solid"
    
    bpy.context.view_layer.objects.active = solid
    solid.select_set(True)
    mod_cut_s = solid.modifiers.new(name="CutSolid", type='BOOLEAN')
    mod_cut_s.operation = 'INTERSECT'
    mod_cut_s.object = cutter_solid
    mod_cut_s.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod_cut_s.name)
    bpy.data.objects.remove(cutter_solid, do_unlink=True)
    
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    solid.data.materials.clear()
    solid.data.materials.append(gold_mat)
    for poly in solid.data.polygons:
        poly.material_index = 0
        
    scene.render.filepath = os.path.join(out_dir, "render_globe_solid_angle.png")
    bpy.ops.render.render(write_still=True)
    print("Rendered render_globe_solid_angle.png")
    
    bpy.ops.object.select_all(action='DESELECT')
    solid.select_set(True)
    bpy.context.view_layer.objects.active = solid
    
    glb_solid_path = os.path.join(out_dir, "sinhala_kw_globe_solid.glb")
    bpy.ops.export_scene.gltf(filepath=glb_solid_path, export_format='GLB', use_selection=True, export_apply=True)
    print(f"Exported {glb_solid_path}")
    
    # Save master blend file
    blend_path = os.path.join(out_dir, "sinhala_kw_globe_master.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved {blend_path}")

render_and_export()
