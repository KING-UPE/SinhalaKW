import bpy, os, math, json

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
        bg.inputs['Color'].default_value = (0.015, 0.025, 0.045, 1.0)
        bg.inputs['Strength'].default_value = 0.8

    # Key warm gold light
    bpy.ops.object.light_add(type='AREA', location=(2.8, -3.5, 2.5), rotation=(math.radians(55), 0, math.radians(40)))
    l1 = bpy.context.active_object
    l1.data.energy = 1200
    l1.data.size = 2.5
    l1.data.color = (1.0, 0.86, 0.48)

    # Secondary fill light
    bpy.ops.object.light_add(type='AREA', location=(-3.2, -2.8, 1.6), rotation=(math.radians(65), 0, math.radians(-50)))
    l2 = bpy.context.active_object
    l2.data.energy = 700
    l2.data.size = 3.0
    l2.data.color = (1.0, 0.92, 0.65)

    # Brilliant rim accent light
    bpy.ops.object.light_add(type='AREA', location=(0.0, 3.5, 2.8), rotation=(math.radians(-45), 0, math.radians(180)))
    l3 = bpy.context.active_object
    l3.data.energy = 1400
    l3.data.size = 2.5
    l3.data.color = (1.0, 0.95, 0.80)

    # Front soft golden bounce
    bpy.ops.object.light_add(type='AREA', location=(0.0, -4.2, 0.0), rotation=(math.radians(90), 0, 0))
    l4 = bpy.context.active_object
    l4.data.energy = 600
    l4.data.size = 3.5
    l4.data.color = (1.0, 0.80, 0.35)

def create_gold_mat():
    mat = bpy.data.materials.new(name="Gold_KW_Luxury")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    # Brand golden amber: #FFC20E -> (1.0, 0.76, 0.055)
    bsdf.inputs['Base Color'].default_value = (1.0, 0.76, 0.055, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.85
    bsdf.inputs['Roughness'].default_value = 0.18
    return mat

def create_obsidian_mat():
    mat = bpy.data.materials.new(name="Obsidian_Core")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (0.01, 0.015, 0.025, 1.0)
    bsdf.inputs['Metallic'].default_value = 0.08
    bsdf.inputs['Roughness'].default_value = 0.02
    return mat

def make_quad_sphere(radius, levels=5):
    bpy.ops.mesh.primitive_cube_add(size=2.0, location=(0,0,0))
    cube = bpy.context.active_object
    
    mod_sub = cube.modifiers.new('Subsurf', 'SUBSURF')
    mod_sub.levels = levels
    mod_sub.render_levels = levels
    bpy.ops.object.modifier_apply(modifier=mod_sub.name)

    mod_cast = cube.modifiers.new('Cast', 'CAST')
    mod_cast.cast_type = 'SPHERE'
    mod_cast.factor = 1.0
    mod_cast.radius = radius
    bpy.ops.object.modifier_apply(modifier=mod_cast.name)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return cube

def build_three_piece_cutter():
    pts_file = os.path.abspath('assets/logos/emblem_pts_smooth.json')
    with open(pts_file, 'r') as f:
        data = json.load(f)
    curves = data['curves']

    cutter_objs = []
    for idx, coords in enumerate(curves):
        curve_data = bpy.data.curves.new(f'CutterCurve_{idx}', type='CURVE')
        curve_data.dimensions = '2D'
        curve_data.resolution_u = 2
        curve_data.fill_mode = 'BOTH'
        curve_data.extrude = 1.6  # 3.2m total height along Z

        spline = curve_data.splines.new(type='BEZIER')
        spline.bezier_points.add(len(coords) - 1)
        spline.use_cyclic_u = True
        for i, (x, y) in enumerate(coords):
            bp = spline.bezier_points[i]
            bp.co = (x, y, 0.0)
            bp.handle_left_type = 'AUTO'
            bp.handle_right_type = 'AUTO'

        obj = bpy.data.objects.new(f'CutterObj_{idx}', curve_data)
        bpy.context.scene.collection.objects.link(obj)
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)

        bpy.ops.object.convert(target='MESH')
        cutter_objs.append(obj)

    # Join the 3 meshes into a single multi-island cutter
    bpy.ops.object.select_all(action='DESELECT')
    for obj in cutter_objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = cutter_objs[0]
    bpy.ops.object.join()
    cutter = bpy.context.active_object
    cutter.name = "MultiPieceCutter"

    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(45))
    return cutter

def build_all():
    out_dir = os.path.abspath("assets/3d")
    os.makedirs(out_dir, exist_ok=True)

    # -------------------------------------------------------------
    # 1. 3D SOLID SPHERICAL GLOBE (Primary Default)
    # -------------------------------------------------------------
    clean_scene()
    setup_studio()
    gold_mat = create_gold_mat()

    print("Building 3D Solid Sphere Globe...")
    solid = make_quad_sphere(radius=1.00, levels=5)
    cutter = build_three_piece_cutter()

    bpy.context.view_layer.objects.active = solid
    solid.select_set(True)
    mod_cut = solid.modifiers.new(name='Cut', type='BOOLEAN')
    mod_cut.operation = 'INTERSECT'
    mod_cut.object = cutter
    mod_cut.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod_cut.name)
    bpy.data.objects.remove(cutter, do_unlink=True)

    # Rotate +90 deg around X so front faces -Y in Blender (+Z towards camera in glTF / Three.js)
    bpy.context.view_layer.objects.active = solid
    solid.select_set(True)
    solid.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)

    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(45))

    mod_wn = solid.modifiers.new(name='WeightedNormal', type='WEIGHTED_NORMAL')
    mod_wn.keep_sharp = True
    mod_wn.weight = 100
    bpy.ops.object.modifier_apply(modifier=mod_wn.name)

    solid.name = "SinhalaKW_Globe_Solid"
    solid.data.name = "SinhalaKW_Globe_Solid"
    # Ensure clean material assignment
    solid.data.materials.clear()
    solid.data.materials.append(gold_mat)
    for p in solid.data.polygons:
        p.material_index = 0

    # Camera setup
    bpy.ops.object.camera_add(location=(0, -4.5, 0), rotation=(math.radians(90), 0, 0))
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam

    scene = bpy.context.scene
    scene.render.resolution_x = 1000
    scene.render.resolution_y = 1000
    scene.render.film_transparent = True

    # Render Front Face
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 2.22
    cam.location = (0, -4.5, 0)
    cam.rotation_euler = (math.radians(90), 0, 0)
    render_face = os.path.join(out_dir, "render_globe_face.png")
    scene.render.filepath = render_face
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {render_face}")

    # Render 3/4 Perspective Angle
    cam.data.type = 'PERSP'
    cam.data.lens = 70
    cam.location = (1.6, -3.4, 1.1)
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    target = bpy.context.active_object
    track = cam.constraints.new(type='TRACK_TO')
    track.target = target
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'

    render_solid_angle = os.path.join(out_dir, "render_globe_solid_angle.png")
    scene.render.filepath = render_solid_angle
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {render_solid_angle}")

    render_angle = os.path.join(out_dir, "render_globe_angle.png")
    scene.render.filepath = render_angle
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {render_angle}")

    # Export Solid GLB, OBJ, STL
    bpy.ops.object.select_all(action='DESELECT')
    solid.select_set(True)
    bpy.context.view_layer.objects.active = solid

    glb_solid = os.path.join(out_dir, "sinhala_kw_globe_solid.glb")
    bpy.ops.export_scene.gltf(filepath=glb_solid, export_format='GLB', use_selection=True, export_apply=True)
    print(f"Exported {glb_solid}")

    glb_exact = os.path.join(out_dir, "sinhala_kw_globe_exact.glb")
    bpy.ops.export_scene.gltf(filepath=glb_exact, export_format='GLB', use_selection=True, export_apply=True)
    print(f"Exported {glb_exact}")

    obj_solid = os.path.join(out_dir, "sinhala_kw_globe_solid.obj")
    bpy.ops.wm.obj_export(filepath=obj_solid, export_selected_objects=True)
    print(f"Exported {obj_solid}")

    stl_solid = os.path.join(out_dir, "sinhala_kw_globe_solid.stl")
    bpy.ops.wm.stl_export(filepath=stl_solid, export_selected_objects=True)
    print(f"Exported {stl_solid}")

    # -------------------------------------------------------------
    # 2. 3D HOLLOW SPHERICAL SHELL (0.10m thickness)
    # -------------------------------------------------------------
    print("Building 3D Spherical Shell...")
    bpy.data.objects.remove(solid, do_unlink=True)

    shell_sphere = make_quad_sphere(radius=1.00, levels=5)
    inner_s = make_quad_sphere(radius=0.90, levels=5)

    bpy.context.view_layer.objects.active = shell_sphere
    shell_sphere.select_set(True)
    mod_sh = shell_sphere.modifiers.new(name='ShellDiff', type='BOOLEAN')
    mod_sh.operation = 'DIFFERENCE'
    mod_sh.object = inner_s
    mod_sh.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod_sh.name)
    bpy.data.objects.remove(inner_s, do_unlink=True)

    cutter_shell = build_three_piece_cutter()

    bpy.context.view_layer.objects.active = shell_sphere
    shell_sphere.select_set(True)
    mod_cut_sh = shell_sphere.modifiers.new(name='Cut', type='BOOLEAN')
    mod_cut_sh.operation = 'INTERSECT'
    mod_cut_sh.object = cutter_shell
    mod_cut_sh.solver = 'EXACT'
    bpy.ops.object.modifier_apply(modifier=mod_cut_sh.name)
    bpy.data.objects.remove(cutter_shell, do_unlink=True)

    # Rotate +90 deg around X
    bpy.context.view_layer.objects.active = shell_sphere
    shell_sphere.select_set(True)
    shell_sphere.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)

    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(45))

    mod_wn_sh = shell_sphere.modifiers.new(name='WeightedNormal', type='WEIGHTED_NORMAL')
    mod_wn_sh.keep_sharp = True
    mod_wn_sh.weight = 100
    bpy.ops.object.modifier_apply(modifier=mod_wn_sh.name)

    shell = shell_sphere
    shell.name = "SinhalaKW_Globe_Shell"
    shell.data.name = "SinhalaKW_Globe_Shell"
    shell.data.materials.clear()
    shell.data.materials.append(gold_mat)
    for p in shell.data.polygons:
        p.material_index = 0

    # Render Shell Face
    cam.constraints.remove(track)
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 2.22
    cam.location = (0, -4.5, 0)
    cam.rotation_euler = (math.radians(90), 0, 0)
    render_shell_face = os.path.join(out_dir, "render_globe_shell_face.png")
    scene.render.filepath = render_shell_face
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {render_shell_face}")

    # Render Shell Angle
    cam.data.type = 'PERSP'
    cam.location = (1.6, -3.4, 1.1)
    track_sh = cam.constraints.new(type='TRACK_TO')
    track_sh.target = target
    track_sh.track_axis = 'TRACK_NEGATIVE_Z'
    track_sh.up_axis = 'UP_Y'
    render_shell_angle = os.path.join(out_dir, "render_globe_shell_angle.png")
    scene.render.filepath = render_shell_angle
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {render_shell_angle}")

    # Export Shell
    bpy.ops.object.select_all(action='DESELECT')
    shell.select_set(True)
    bpy.context.view_layer.objects.active = shell

    glb_shell = os.path.join(out_dir, "sinhala_kw_globe_shell.glb")
    bpy.ops.export_scene.gltf(filepath=glb_shell, export_format='GLB', use_selection=True, export_apply=True)
    print(f"Exported {glb_shell}")

    obj_shell = os.path.join(out_dir, "sinhala_kw_globe_shell.obj")
    bpy.ops.wm.obj_export(filepath=obj_shell, export_selected_objects=True)
    print(f"Exported {obj_shell}")

    stl_shell = os.path.join(out_dir, "sinhala_kw_globe_shell.stl")
    bpy.ops.wm.stl_export(filepath=stl_shell, export_selected_objects=True)
    print(f"Exported {stl_shell}")

    # -------------------------------------------------------------
    # 3. LUXURY FLOATING ORB (Shell + Obsidian Core)
    # -------------------------------------------------------------
    print("Building Luxury Floating Orb...")
    obsidian_mat = create_obsidian_mat()
    core = make_quad_sphere(radius=0.86, levels=5)
    core.name = "Obsidian_Core"
    core.data.name = "Obsidian_Core"
    core.data.materials.clear()
    core.data.materials.append(obsidian_mat)
    for p in core.data.polygons:
        p.material_index = 0
    bpy.context.view_layer.objects.active = core
    bpy.ops.object.shade_smooth()

    render_orb_angle = os.path.join(out_dir, "render_globe_orb_angle.png")
    scene.render.filepath = render_orb_angle
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {render_orb_angle}")

    bpy.ops.object.select_all(action='DESELECT')
    shell.select_set(True)
    core.select_set(True)
    bpy.context.view_layer.objects.active = shell

    glb_orb = os.path.join(out_dir, "sinhala_kw_globe_orb.glb")
    bpy.ops.export_scene.gltf(filepath=glb_orb, export_format='GLB', use_selection=True, export_apply=True)
    print(f"Exported {glb_orb}")

    # Save Blend file
    blend_path = os.path.join(out_dir, "sinhala_kw_globe_master.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"Saved {blend_path}")

if __name__ == '__main__':
    build_all()
