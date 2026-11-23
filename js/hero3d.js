// Sinhala KW · Hero 3D emblem.
// The brand mark is extruded live from the designer's vector (assets/logos/emblem_designer.svg),
// so it stays exact to the logo at any size. Four looks, chosen with the switch under it:
//   solid     – polished gold with a travelling glint
//   particles – the emblem as gold dust; hover it and it scatters, move away and it re-forms
//   glass     – clear crystal with gold flakes inside; hover stirs the flakes
//   layers    – a navy-to-gold stack of slices; hover fans them open
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

const stage = document.getElementById('emblemStage');
const hint = document.getElementById('emblemHint');
const switcher = document.getElementById('emblemSwitch');
const STYLES = ['solid', 'particles', 'glass', 'layers'];
const STORE_KEY = 'kw-emblem';

const C = {
  gold: new THREE.Color('#FFC20E'),
  goldDeep: new THREE.Color('#D99A00'),
  navy: new THREE.Color('#235E83'),
  navyDeep: new THREE.Color('#0E2E43'),
  ice: new THREE.Color('#EEF5FA'),
  white: new THREE.Color('#FFFFFF'),
};

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

function disableUI() {
  switcher?.setAttribute('hidden', '');
  hint?.setAttribute('hidden', '');
}

if (stage && webglOK()) init().catch(err => { console.warn('[hero3d]', err); disableUI(); });
else disableUI();

function initialStyle() {
  const q = new URLSearchParams(location.search).get('emblem');
  if (STYLES.includes(q)) return q;
  try { const s = localStorage.getItem(STORE_KEY); if (STYLES.includes(s)) return s; } catch { /* private mode */ }
  return 'solid';
}

async function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 640px)').matches;

  // ---------- renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  stage.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.45, 6.4);
  camera.lookAt(0, -0.05, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xfff1d6, 2.4);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0x9fc7ff, 1.4);
  rim.position.set(-4, 1, -3);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.3));

  const shadow = makeShadow();
  scene.add(shadow);
  const rig = new THREE.Group();
  scene.add(rig);

  // shared by every point-sprite material: pixels per world unit at distance 1
  const shared = { uScale: { value: 1 } };
  const shapes = await loadShapes('assets/logos/emblem_designer.svg');

  const builders = {
    solid: () => makeSolid(shapes),
    particles: () => makeParticles(shapes, isMobile, shared),
    glass: () => makeGlass(shapes, isMobile, shared),
    layers: () => makeLayers(shapes),
  };
  const built = {};
  const getStyle = name => {
    if (!built[name]) {
      built[name] = builders[name]();
      built[name].group.visible = false;
      rig.add(built[name].group);
    }
    return built[name];
  };

  // ---------- style switching ----------
  const buttons = switcher ? [...switcher.querySelectorAll('[data-style]')] : [];
  let current = null, leaving = null, tIn = 1, tOut = 1;

  function setStyle(name) {
    if (!STYLES.includes(name)) return;
    const next = getStyle(name);
    if (next === current) return;
    if (leaving) leaving.group.visible = false;
    leaving = current;
    tOut = 0;
    current = next;
    current.group.visible = true;
    tIn = 0;
    current.setPresence(0);
    stage.dataset.style = name;
    buttons.forEach(b => {
      const on = b.dataset.style === name;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    try { localStorage.setItem(STORE_KEY, name); } catch { /* private mode */ }
  }

  buttons.forEach(b => b.addEventListener('click', () => { setStyle(b.dataset.style); markInteracted(); }));
  switcher?.addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = buttons.findIndex(b => b.getAttribute('aria-checked') === 'true');
    const n = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
    n.focus();
    n.click();
  });

  // ---------- interaction ----------
  const ndc = new THREE.Vector2(-10, -10);
  const mouseLocal = new THREE.Vector3(99, 99, 0);
  let hovering = false, dragging = false, moved = 0, lastX = 0, lastY = 0, tapUntil = -1, interacted = false;
  let rotY = 0, rotX = 0, velY = 0, viewX = 0, viewY = 0, wasOver = false;

  function markInteracted() {
    if (interacted) return;
    interacted = true;
    hint?.classList.add('is-hidden');
  }
  const setNdc = e => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };

  canvas.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hovering = true; });
  canvas.addEventListener('pointerleave', () => { hovering = false; dragging = false; ndc.set(-10, -10); });
  canvas.addEventListener('pointerdown', e => {
    dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
    setNdc(e);
    canvas.setPointerCapture?.(e.pointerId);
    markInteracted();
  });
  canvas.addEventListener('pointermove', e => {
    setNdc(e);
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    velY = dx * 0.008;
    rotY += velY;
    rotX = THREE.MathUtils.clamp(rotX + dy * 0.005, -0.6, 0.6);
  });
  canvas.addEventListener('pointerup', e => {
    // on touch there is no hover, so a tap plays the hover effect for a moment
    if (dragging && e.pointerType !== 'mouse' && moved < 8) tapUntil = clock.elapsedTime + 2.6;
    dragging = false;
  });
  canvas.addEventListener('pointercancel', () => { dragging = false; });

  // ---------- sizing / visibility ----------
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    shared.uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(stage);

  setStyle(initialStyle());
  window.sinhalaEmblem = { setStyle, styles: STYLES };

  // build the other looks while the browser is idle so switching never stalls
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 400));
  const queue = STYLES.filter(n => !built[n]);
  const warm = () => {
    const name = queue.shift();
    if (!name) return;
    const s = getStyle(name);
    s.group.visible = true;
    renderer.compile(scene, camera);
    if (s !== current) s.group.visible = false;
    idle(warm);
  };
  idle(warm);

  // ---------- loop ----------
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const inv = new THREE.Matrix4();
  const localRay = new THREE.Ray();
  const ctx = { over: false, hover: false, mouse: mouseLocal, reduceMotion };
  let first = true;

  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // pointer on the emblem plane, in emblem space
    rig.updateMatrixWorld();
    if (ndc.x > -5) {
      raycaster.setFromCamera(ndc, camera);
      inv.copy(rig.matrixWorld).invert();
      localRay.copy(raycaster.ray).applyMatrix4(inv);
      if (!localRay.intersectPlane(plane, mouseLocal)) mouseLocal.set(99, 99, 0);
    } else {
      mouseLocal.set(99, 99, 0);
    }
    const r = Math.hypot(mouseLocal.x, mouseLocal.y);
    const over = (hovering && r < (wasOver ? 1.3 : 1.05)) || t < tapUntil;
    if (over && !wasOver) markInteracted();
    wasOver = over;
    ctx.over = over;
    ctx.hover = hovering;

    // transitions: the old look leaves, the new one arrives just after
    if (leaving) {
      tOut = Math.min(1, tOut + dt / (reduceMotion ? 0.15 : 0.45));
      leaving.setPresence(1 - tOut * tOut * tOut);
      leaving.update(dt, t, { ...ctx, over: false });
      if (tOut >= 1) { leaving.group.visible = false; leaving = null; }
    }
    tIn = Math.min(1, tIn + dt / (reduceMotion ? 0.2 : 0.85));
    current.setPresence(THREE.MathUtils.clamp(tIn * 1.25 - 0.25, 0, 1));
    current.update(dt, t, ctx);

    // rig: idle sway, pointer tilt, drag spin that settles back to the front
    const sway = reduceMotion ? 0 : Math.sin(t * 0.45) * 0.32;
    const px = hovering ? ndc.x : 0, py = hovering ? ndc.y : 0;
    const view = current.viewOffset ? current.viewOffset() : null;
    viewX += ((view ? view.x : 0) - viewX) * Math.min(1, dt * 3);
    viewY += ((view ? view.y : 0) - viewY) * Math.min(1, dt * 3);
    if (!dragging) {
      velY *= Math.pow(0.05, dt);
      rotY += velY;
      const base = sway + px * 0.35;
      const target = base + Math.round((rotY - base) / (Math.PI * 2)) * Math.PI * 2;
      if (Math.abs(velY) < 0.02) rotY += (target - rotY) * Math.min(1, dt * 1.6);
      rotX += (-py * 0.22 - rotX) * Math.min(1, dt * 3);
    }
    rig.rotation.set(rotX + viewX, rotY + viewY, 0);
    const bob = reduceMotion ? 0 : Math.sin(t * 1.1) * 0.05;
    rig.position.y = bob;
    shadow.scale.setScalar(1 - bob * 1.5);
    shadow.material.opacity = 0.9 - bob * 3;

    renderer.render(scene, camera);
    if (first) { first = false; stage.classList.add('is-ready'); }
  });
}

/* =========================================================
   Geometry
   ========================================================= */

// Read the designer SVG and return its shapes centred and scaled to fit a 2-unit circle, y up.
async function loadShapes(url) {
  const data = await new SVGLoader().loadAsync(url);
  const rings = [];
  for (const path of data.paths) {
    for (const shape of SVGLoader.createShapes(path)) {
      const pts = shape.getPoints(16).map(p => new THREE.Vector2(p.x, -p.y));
      if (pts.length > 2 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-6) pts.pop();
      rings.push(pts);
    }
  }
  const box = new THREE.Box2();
  rings.forEach(r => r.forEach(p => box.expandByPoint(p)));
  const c = box.getCenter(new THREE.Vector2());
  const size = box.getSize(new THREE.Vector2());
  const k = 2 / Math.max(size.x, size.y);
  return rings.map(r => new THREE.Shape(r.map(p => p.sub(c).multiplyScalar(k))));
}

function extrude(shapes, depth, bevel = 0, bevelSegments = 5, smooth = true) {
  const g = new THREE.ExtrudeGeometry(shapes, {
    depth, steps: 1, curveSegments: 1,
    bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments,
  });
  g.translate(0, 0, -depth / 2);
  if (bevel > 0 && smooth) smoothSides(g);
  return g;
}

// ExtrudeGeometry gives faceted side walls; average the side normals so bevels read as polished.
// Caps keep their flat normals so the face stays crisp.
function smoothSides(geo) {
  const side = geo.groups.find(g => g.materialIndex === 1);
  if (!side) return;
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const acc = new Map(), n = new THREE.Vector3();
  const end = side.start + side.count;
  const keys = new Array(side.count);
  for (let i = side.start; i < end; i++) {
    const k = `${Math.round(pos.getX(i) * 2e4)}|${Math.round(pos.getY(i) * 2e4)}|${Math.round(pos.getZ(i) * 2e4)}`;
    keys[i - side.start] = k;
    n.fromBufferAttribute(nor, i);
    const a = acc.get(k);
    if (a) a.add(n); else acc.set(k, n.clone());
  }
  for (let i = side.start; i < end; i++) {
    n.copy(acc.get(keys[i - side.start])).normalize();
    nor.setXYZ(i, n.x, n.y, n.z);
  }
  nor.needsUpdate = true;
}

function samplePoints(geo, count, fn) {
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();
  const p = new THREE.Vector3();
  for (let i = 0; i < count; i++) { sampler.sample(p); fn(p, i); }
}

const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

// default arrive/leave for mesh looks: grow with a little overshoot while spinning into place
function meshPresence(group, v) {
  group.scale.setScalar(Math.max(0.001, v >= 1 ? 1 : easeOutBack(v)));
  group.rotation.y = (1 - v) * -2.2;
}

function makeShadow() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(14,46,67,0.38)');
  gr.addColorStop(0.5, 'rgba(14,46,67,0.12)');
  gr.addColorStop(1, 'rgba(14,46,67,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = -1.38;
  return m;
}

/* =========================================================
   Style 1 · Solid gold
   ========================================================= */
function makeSolid(shapes) {
  const group = new THREE.Group();
  const face = new THREE.MeshPhysicalMaterial({
    color: C.gold, metalness: 1, roughness: 0.16,
    clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.45,
  });
  const side = new THREE.MeshPhysicalMaterial({ color: C.goldDeep, metalness: 1, roughness: 0.22, envMapIntensity: 1.3 });
  group.add(new THREE.Mesh(extrude(shapes, 0.24, 0.04, 6), [face, side]));

  const glint = new THREE.PointLight(0xfff4d6, 0, 3.5, 1.5);
  group.add(glint);
  let lift = 0, sweep = 0;
  return {
    group,
    setPresence: v => meshPresence(group, v),
    update(dt, t, ctx) {
      lift += ((ctx.over ? 1 : 0) - lift) * Math.min(1, dt * 4);
      sweep = (sweep + dt * (0.22 + lift * 0.5)) % 1;
      glint.position.set(-1.6 + sweep * 3.2, 0.9 - sweep * 1.8, 0.75);
      glint.intensity = Math.sin(sweep * Math.PI) * (5 + lift * 10);
      group.position.z = lift * 0.15;
    },
  };
}

/* =========================================================
   Style 2 · Particles
   ========================================================= */
const PARTICLE_VS = /* glsl */`
  uniform float uTime, uScatter, uMouseOn, uScale, uSize;
  uniform vec3 uMouse;
  attribute vec4 aRnd;
  attribute float aTone;
  varying float vTone, vShade, vA;
  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  void main() {
    vec3 p = position;
    // cursor wake: grains slide away from the pointer
    vec2 dm = p.xy - uMouse.xy;
    float dist = length(dm);
    float wake = uMouseOn * (1.0 - smoothstep(0.0, 0.45, dist));
    p.xy += (dm / max(dist, 1e-3)) * wake * 0.22;
    p.z += wake * (aRnd.z - 0.5) * 0.5;
    // staggered scatter into a drifting cloud
    float s = clamp(uScatter * 1.5 - aRnd.w * 0.5, 0.0, 1.0);
    s = s * s * (3.0 - 2.0 * s);
    vec3 dir = normalize(vec3(aRnd.x - 0.5, aRnd.y - 0.5, aRnd.z - 0.5) + 1e-4);
    float reach = 0.35 + aRnd.w * 0.75;
    p = mix(p, rotY(p, (aRnd.x - 0.5) * 2.4) * (1.0 + 0.25 * aRnd.z) + dir * reach, s);
    p += s * 0.07 * vec3(sin(uTime * 0.7 + aRnd.y * 40.0), cos(uTime * 0.6 + aRnd.x * 40.0), sin(uTime * 0.5 + aRnd.z * 40.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uScale * (0.65 + aRnd.y * 0.7) * (1.0 - s * 0.3) / -mv.z;
    gl_Position = projectionMatrix * mv;
    vTone = aTone;
    vShade = clamp(position.z * 4.0 + 0.5, 0.0, 1.0) * 0.6 + aRnd.x * 0.4;
    // grains thin out as they drift, and fade well before the canvas edge
    vA = (1.0 - s * 0.4) * (1.0 - smoothstep(1.25, 1.75, length(p.xy)));
  }`;
const PARTICLE_FS = /* glsl */`
  uniform vec3 uGold, uGoldDeep, uNavy, uWhite;
  uniform float uAlpha;
  varying float vTone, vShade, vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.18, d);
    vec3 col = vTone > 1.5 ? uWhite : (vTone > 0.5 ? uNavy : mix(uGoldDeep, uGold, vShade));
    gl_FragColor = vec4(col, a * vA * uAlpha);
    #include <colorspace_fragment>
  }`;

function makeParticles(shapes, isMobile, shared) {
  const group = new THREE.Group();
  const N = isMobile ? 9000 : 20000;
  const home = new Float32Array(N * 3), rnd = new Float32Array(N * 4), tone = new Float32Array(N);
  samplePoints(extrude(shapes, 0.26, 0.035, 3, false), N, (p, i) => {
    home.set([p.x, p.y, p.z], i * 3);
    rnd.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    const r = Math.random();
    tone[i] = r < 0.04 ? 1 : r < 0.06 ? 2 : 0; // mostly gold, a few navy and white sparks
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(home, 3));
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
  geo.setAttribute('aTone', new THREE.BufferAttribute(tone, 1));
  const u = {
    uTime: { value: 0 }, uScatter: { value: 1 }, uMouseOn: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uScale: shared.uScale, uSize: { value: isMobile ? 0.028 : 0.022 }, uAlpha: { value: 0 },
    uGold: { value: C.gold }, uGoldDeep: { value: C.goldDeep }, uNavy: { value: C.navy }, uWhite: { value: C.white },
  };
  const pts = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: u, vertexShader: PARTICLE_VS, fragmentShader: PARTICLE_FS,
    transparent: true, depthWrite: false, toneMapped: false,
  }));
  pts.frustumCulled = false;
  group.add(pts);

  let presence = 0, scatter = 1;
  return {
    group,
    // arriving = gathering from a cloud, leaving = blowing apart
    setPresence(v) { presence = v; u.uAlpha.value = Math.min(1, v * 1.6); },
    update(dt, t, ctx) {
      const target = Math.max(ctx.over ? 1 : 0, 1 - presence);
      const rate = ctx.reduceMotion ? 20 : (target > scatter ? 3.2 : 2.4);
      scatter += (target - scatter) * Math.min(1, dt * rate);
      u.uScatter.value = scatter;
      u.uTime.value = t;
      u.uMouse.value.copy(ctx.mouse);
      u.uMouseOn.value += ((ctx.hover ? 1 : 0) - u.uMouseOn.value) * Math.min(1, dt * 6);
    },
  };
}

/* =========================================================
   Style 3 · Glass with gold flakes
   ========================================================= */
const GLASS_VS = /* glsl */`
  varying vec3 vN, vV, vPos;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vPos = position;
    gl_Position = projectionMatrix * mv;
  }`;
const GLASS_FS = /* glsl */`
  uniform vec3 uTint, uDeep, uHi, uGold;
  uniform float uTime, uAlpha, uShine;
  varying vec3 vN, vV, vPos;
  void main() {
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    vec3 v = normalize(vV);
    float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.5);
    vec3 r = reflect(-v, n);
    // a small studio: soft box overhead, one to the left, dark floor
    float top = smoothstep(0.35, 0.8, r.y) * (1.0 - smoothstep(0.35, 0.95, abs(r.x)));
    float side = smoothstep(0.82, 0.98, dot(r, normalize(vec3(-0.9, 0.2, 0.4))));
    float floorD = smoothstep(-0.05, -0.55, r.y);
    float band = 1.0 - smoothstep(0.0, 0.05 + 0.04 * uShine, abs(vPos.x + vPos.y * 0.6 - (fract(uTime * 0.16) * 5.0 - 2.5)));
    float hi = clamp(top + side + band * (0.55 + 0.45 * uShine), 0.0, 1.0);
    vec3 col = mix(uTint, uDeep, clamp(floorD * 0.85 + fres * 0.6, 0.0, 1.0));
    col = mix(col, uGold, smoothstep(0.75, 1.0, fres) * 0.25);
    col = mix(col, uHi, hi);
    float a = 0.05 + fres * 0.7 + floorD * 0.3 + hi * 0.75;
    if (!gl_FrontFacing) a *= 0.55;
    gl_FragColor = vec4(col, clamp(a, 0.0, 0.92) * uAlpha);
    #include <colorspace_fragment>
  }`;
const FLAKE_VS = /* glsl */`
  uniform float uTime, uStir, uScale;
  attribute vec4 aRnd;
  varying float vTw;
  void main() {
    vec3 p = position;
    float a = uTime * (0.4 + uStir * 2.2) * (0.5 + aRnd.x) + aRnd.y * 6.2832;
    float amp = 0.02 + uStir * 0.07 * aRnd.z;
    p.x += cos(a) * amp;
    p.y += sin(a * 1.3) * amp;
    p.z += sin(a * 0.7) * 0.03 * (0.5 + uStir);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 0.05 * uScale * (0.35 + aRnd.w) / -mv.z;
    gl_Position = projectionMatrix * mv;
    vTw = 0.55 + 0.45 * sin(uTime * (2.0 + aRnd.x * 3.0) + aRnd.w * 20.0);
  }`;
const FLAKE_FS = /* glsl */`
  uniform vec3 uGold, uWhite;
  uniform float uAlpha;
  varying float vTw;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = abs(c.x) + abs(c.y);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uGold, uWhite, pow(a, 4.0) * vTw * 0.7);
    gl_FragColor = vec4(col, a * (0.55 + 0.45 * vTw) * uAlpha);
    #include <colorspace_fragment>
  }`;

function makeGlass(shapes, isMobile, shared) {
  const group = new THREE.Group();
  const geo = extrude(shapes, 0.3, 0.06, 6);
  const gu = {
    uTime: { value: 0 }, uAlpha: { value: 0 }, uShine: { value: 0 },
    uTint: { value: C.ice }, uDeep: { value: C.navy }, uHi: { value: C.white }, uGold: { value: C.gold },
  };
  const glassMat = side => new THREE.ShaderMaterial({
    uniforms: gu, vertexShader: GLASS_VS, fragmentShader: GLASS_FS,
    transparent: true, depthWrite: false, toneMapped: false, side,
  });
  const back = new THREE.Mesh(geo, glassMat(THREE.BackSide));
  back.renderOrder = 1;
  const front = new THREE.Mesh(geo, glassMat(THREE.FrontSide));
  front.renderOrder = 3;

  const N = isMobile ? 1200 : 2400;
  const fp = new Float32Array(N * 3), fr = new Float32Array(N * 4);
  samplePoints(extrude(shapes, 0.18, 0, 1, false), N, (p, i) => {
    fp.set([p.x * 0.96, p.y * 0.96, (Math.random() - 0.5) * 0.2], i * 3);
    fr.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  });
  const fgeo = new THREE.BufferGeometry();
  fgeo.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  fgeo.setAttribute('aRnd', new THREE.BufferAttribute(fr, 4));
  const fu = { uTime: gu.uTime, uAlpha: gu.uAlpha, uStir: { value: 0 }, uScale: shared.uScale, uGold: { value: C.gold }, uWhite: { value: C.white } };
  const flakes = new THREE.Points(fgeo, new THREE.ShaderMaterial({
    uniforms: fu, vertexShader: FLAKE_VS, fragmentShader: FLAKE_FS,
    transparent: true, depthWrite: false, toneMapped: false,
  }));
  flakes.renderOrder = 2;
  flakes.frustumCulled = false;
  group.add(back, flakes, front);

  let stir = 0;
  return {
    group,
    setPresence(v) { meshPresence(group, v); gu.uAlpha.value = v; },
    update(dt, t, ctx) {
      stir += ((ctx.over ? 1 : 0) - stir) * Math.min(1, dt * 2.5);
      gu.uTime.value = t;
      gu.uShine.value = stir;
      fu.uStir.value = stir;
    },
  };
}

/* =========================================================
   Style 4 · Layers
   ========================================================= */
function makeLayers(shapes) {
  const group = new THREE.Group();
  const K = 14;
  const geo = extrude(shapes, 0.016, 0, 1, false);
  const stops = ['#0E2E43', '#235E83', '#7FB0CF', '#FFE6A0', '#FFC20E'].map(c => new THREE.Color(c));
  const colorAt = k => {
    const f = k * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f));
    return stops[i].clone().lerp(stops[i + 1], f - i);
  };
  const layers = [];
  for (let i = 0; i < K; i++) {
    const top = i === K - 1;
    const mat = top
      ? new THREE.MeshPhysicalMaterial({ color: C.gold, metalness: 0.9, roughness: 0.25, clearcoat: 0.6, envMapIntensity: 1.1 })
      : new THREE.MeshStandardMaterial({ color: colorAt(i / (K - 1)), roughness: 0.55, metalness: 0.05 });
    const m = new THREE.Mesh(geo, mat);
    group.add(m);
    layers.push(m);
  }
  // at rest the stack is slightly fanned and turned so the navy-to-gold edge always shows
  const REST = 0.18;
  let open = REST;
  return {
    group,
    setPresence: v => meshPresence(group, v),
    viewOffset: () => ({ x: -0.2 * open, y: 0.25 + 0.4 * open }),
    update(dt, t, ctx) {
      open += ((ctx.over ? 1 : REST) - open) * Math.min(1, dt * 3.2);
      const gap = 0.02 + open * 0.1;
      const wave = ctx.reduceMotion ? 0 : 0.012 * (0.25 + open);
      layers.forEach((m, i) => {
        const c = i - (K - 1) / 2;
        m.position.z = c * gap + Math.sin(t * 2.2 - i * 0.5) * wave;
        m.rotation.z = c * open * 0.035;
        m.scale.setScalar(1 - (K - 1 - i) * open * 0.012);
      });
    },
  };
}
