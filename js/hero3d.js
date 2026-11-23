// Sinhala KW · Hero 3D logo.
// The full "සිංහල KW" logo is extruded live from assets/logos/logo_full_vector.svg (traced from the
// brand PDF), with the letters and the middle emblem as separate parts. A side panel (#cfg) lets the
// visitor configure it; choices are saved in localStorage.
//   styles:  solid (polished enamel + gold) · particles (scatters on hover) · glass (gold flakes inside)
//            · layers (navy-to-gold slices that fan open on hover)
//   colours: brand (ink letters) · navy (navy letters) · gold (all gold)
//   also:    depth, motion speed, idle sway, emblem spin, hover effect
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

const stage = document.getElementById('logoStage');
const hint = document.getElementById('logoHint');
const panel = document.getElementById('cfg');

const STYLES = ['solid', 'particles', 'glass', 'layers'];
const SCHEMES = {
  brand: { letters: '#08080a', edge: '#141416', speck: '#202024', stack: ['#FFE6A0', '#888888', '#333333', '#08080a'] },
  navy: { letters: '#235E83', edge: '#1B4D6D', speck: '#7FB0CF', stack: ['#FFE6A0', '#9FC3DA', '#235E83'] },
  gold: { letters: '#FFC20E', edge: '#D99A00', speck: '#D99A00', stack: ['#0E2E43', '#235E83', '#7FB0CF', '#FFE6A0', '#FFC20E'], metal: true },
};
const EMBLEM_STACK = ['#0E2E43', '#235E83', '#7FB0CF', '#FFE6A0', '#FFC20E'];
const DEFAULTS = { style: 'solid', scheme: 'brand', depth: 1, speed: 1, sway: true, spin: false, hover: true };
const STORE_KEY = 'kw-hero3d';

const C = {
  gold: new THREE.Color('#FFC20E'),
  goldDeep: new THREE.Color('#D99A00'),
  navy: new THREE.Color('#235E83'),
  ice: new THREE.Color('#EEF5FA'),
  cream: new THREE.Color('#FFF3CC'),
  white: new THREE.Color('#FFFFFF'),
};

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

function disableUI() {
  panel?.setAttribute('hidden', '');
  hint?.setAttribute('hidden', '');
}

if (stage && webglOK()) init().catch(err => { console.warn('[hero3d]', err); disableUI(); });
else disableUI();

/* =========================================================
   Settings
   ========================================================= */
function sanitize(o) {
  const out = {};
  if (!o || typeof o !== 'object') return out;
  if (STYLES.includes(o.style)) out.style = o.style;
  if (SCHEMES[o.scheme]) out.scheme = o.scheme;
  for (const [k, lo, hi] of [['depth', 0.4, 2], ['speed', 0, 2]]) {
    if (Number.isFinite(o[k])) out[k] = Math.min(hi, Math.max(lo, o[k]));
  }
  for (const k of ['sway', 'spin', 'hover']) if (typeof o[k] === 'boolean') out[k] = o[k];
  return out;
}

function defaults(reduceMotion) {
  return { ...DEFAULTS, sway: !reduceMotion, speed: reduceMotion ? 0.3 : 1 };
}

function loadSettings(reduceMotion) {
  const s = defaults(reduceMotion);
  try { Object.assign(s, sanitize(JSON.parse(localStorage.getItem(STORE_KEY) || '{}'))); } catch { /* ignore */ }
  const q = new URLSearchParams(location.search);
  const style = q.get('style') || q.get('emblem');
  if (STYLES.includes(style)) s.style = style;
  if (SCHEMES[q.get('colour')]) s.scheme = q.get('colour');
  return s;
}

/* =========================================================
   Scene
   ========================================================= */
async function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const settings = loadSettings(reduceMotion);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  stage.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1.6, 0.1, 100);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xfff1d6, 2.4);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0x9fc7ff, 1.4);
  rim.position.set(-4, 1, -3);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.3));

  const logo = await loadLogo('assets/logos/logo_full_vector.svg');

  const shadow = makeShadow(logo.size);
  scene.add(shadow);
  const rig = new THREE.Group();        // sway, tilt, drag
  const content = new THREE.Group();    // depth (z scale)
  rig.add(content);
  scene.add(rig);

  // shared by point-sprite materials
  const shared = {
    uScale: { value: 1 },                         // pixels per world unit at distance 1
    uFade: { value: new THREE.Vector2(3, 1.6) },  // particles fade out before the canvas edge
  };

  const builders = {
    solid: () => makeSolid(logo),
    particles: () => makeParticles(logo, isMobile, shared),
    glass: () => makeGlass(logo, isMobile, shared),
    layers: () => makeLayers(logo),
  };
  const built = {};
  const getStyle = name => {
    if (!built[name]) {
      const s = builders[name]();
      s.setScheme(settings.scheme);
      s.group.visible = false;
      content.add(s.group);
      built[name] = s;
    }
    return built[name];
  };

  // ---------- style switching ----------
  let current = null, leaving = null, tIn = 1, tOut = 1;
  function setStyle(name) {
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
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(settings)); } catch { /* private mode */ }
  }
  function apply(patch) {
    Object.assign(settings, sanitize(patch));
    if (patch.style) setStyle(settings.style);
    if (patch.scheme) Object.values(built).forEach(s => s.setScheme(settings.scheme));
    save();
  }

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
    velY = dx * 0.007;
    rotY += velY;
    rotX = THREE.MathUtils.clamp(rotX + dy * 0.004, -0.5, 0.5);
  });
  canvas.addEventListener('pointerup', e => {
    // touch has no hover, so a tap plays the hover effect for a moment
    if (dragging && e.pointerType !== 'mouse' && moved < 8) tapUntil = clock.elapsedTime + 2.6;
    dragging = false;
  });
  canvas.addEventListener('pointercancel', () => { dragging = false; });

  // ---------- sizing / visibility ----------
  const HALF_W = 2.45, HALF_H = 1.15;   // world-space box the camera keeps in view
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(HALF_H / t, HALF_W / (t * camera.aspect));
    camera.position.set(0, dist * 0.07, dist);
    camera.lookAt(0, -0.04, 0);
    camera.updateProjectionMatrix();
    shared.uScale.value = (h * renderer.getPixelRatio()) / (2 * t);
    shared.uFade.value.set(t * dist * camera.aspect * 0.92, t * dist * 0.92);
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(stage);

  setStyle(settings.style);
  setupPanel(settings, apply, defaults(reduceMotion));
  window.sinhalaLogo3D = { settings, apply };

  // build the other looks while the browser is idle so switching never stalls
  const idle = window.requestIdleCallback || (fn => setTimeout(fn, 400));
  const queue = STYLES.filter(n => !built[n]);
  const warm = () => {
    const name = queue.shift();
    if (!name) return;
    const s = getStyle(name);
    s.group.visible = true;
    renderer.compile(scene, camera);
    if (s !== current && s !== leaving) s.group.visible = false;
    idle(warm);
  };
  idle(warm);

  // ---------- loop ----------
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const inv = new THREE.Matrix4();
  const localRay = new THREE.Ray();
  const ctx = { over: false, hover: false, mouse: mouseLocal, reduceMotion, speed: 1 };
  const TAU = Math.PI * 2;
  let ts = 0, first = true;

  const spinEmblem = (s, dt) => {
    const p = s.emblemPivot;
    if (settings.spin) p.rotation.y += dt * (0.4 + 1.1 * settings.speed);
    else {
      const target = Math.round(p.rotation.y / TAU) * TAU;
      p.rotation.y += (target - p.rotation.y) * Math.min(1, dt * 2.5);
    }
  };

  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    ts += dt * settings.speed;          // "motion speed" time

    // pointer on the logo plane, in logo space
    content.updateMatrixWorld();
    if (ndc.x > -5) {
      raycaster.setFromCamera(ndc, camera);
      inv.copy(content.matrixWorld).invert();
      localRay.copy(raycaster.ray).applyMatrix4(inv);
      if (!localRay.intersectPlane(plane, mouseLocal)) mouseLocal.set(99, 99, 0);
    } else {
      mouseLocal.set(99, 99, 0);
    }
    const pad = wasOver ? 0.3 : 0;
    const onLogo = Math.abs(mouseLocal.x) < logo.size.x / 2 + 0.05 + pad && Math.abs(mouseLocal.y) < logo.size.y / 2 + 0.05 + pad;
    const over = settings.hover && ((hovering && onLogo) || t < tapUntil);
    if (over && !wasOver) markInteracted();
    wasOver = over;
    ctx.over = over;
    ctx.hover = hovering && settings.hover;
    ctx.speed = settings.speed;

    if (leaving) {
      tOut = Math.min(1, tOut + dt / (reduceMotion ? 0.15 : 0.45));
      leaving.setPresence(1 - tOut * tOut * tOut);
      leaving.update(dt, ts, { ...ctx, over: false });
      spinEmblem(leaving, dt);
      if (tOut >= 1) { leaving.group.visible = false; leaving = null; }
    }
    tIn = Math.min(1, tIn + dt / (reduceMotion ? 0.2 : 0.85));
    current.setPresence(THREE.MathUtils.clamp(tIn * 1.25 - 0.25, 0, 1));
    current.update(dt, ts, ctx);
    spinEmblem(current, dt);

    // depth
    content.scale.z += (settings.depth - content.scale.z) * Math.min(1, dt * 6);

    // rig: idle sway, pointer tilt, drag spin that settles back to the front
    const sway = settings.sway ? Math.sin(ts * 0.45) * 0.28 : 0;
    const px = hovering ? ndc.x : 0, py = hovering ? ndc.y : 0;
    const view = current.viewOffset ? current.viewOffset() : null;
    viewX += ((view ? view.x : 0) - viewX) * Math.min(1, dt * 3);
    viewY += ((view ? view.y : 0) - viewY) * Math.min(1, dt * 3);
    if (!dragging) {
      velY *= Math.pow(0.05, dt);
      rotY += velY;
      const base = sway + px * 0.25;
      const target = base + Math.round((rotY - base) / TAU) * TAU;
      if (Math.abs(velY) < 0.02) rotY += (target - rotY) * Math.min(1, dt * 1.6);
      rotX += (-py * 0.16 - rotX) * Math.min(1, dt * 3);
    }
    rig.rotation.set(rotX + viewX, rotY + viewY, 0);
    const bob = settings.sway ? Math.sin(ts * 1.1) * 0.04 : 0;
    rig.position.y = bob;
    shadow.scale.setScalar(1 - bob * 1.5);
    shadow.material.opacity = 0.9 - bob * 3;

    renderer.render(scene, camera);
    if (first) { first = false; stage.classList.add('is-ready'); }
  });
}

/* =========================================================
   Side panel
   ========================================================= */
function setupPanel(settings, apply, resetTo) {
  if (!panel) return;
  const tab = panel.querySelector('.cfg-tab');
  const body = panel.querySelector('.cfg-body');
  const hero = panel.closest('.hero');
  const syncers = [];

  const setOpen = open => {
    panel.classList.toggle('is-open', open);
    hero?.classList.toggle('cfg-open', open);
    tab.setAttribute('aria-expanded', String(open));
    body.inert = !open;
    if (open) body.querySelector('[role="radio"][aria-checked="true"]')?.focus({ preventScroll: true });
  };
  body.inert = true;
  tab.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
  panel.querySelector('.cfg-close')?.addEventListener('click', () => { setOpen(false); tab.focus(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) { setOpen(false); tab.focus(); }
  });

  // single-choice groups: style, colour
  panel.querySelectorAll('[role="radiogroup"][data-setting]').forEach(group => {
    const key = group.dataset.setting;
    const radios = [...group.querySelectorAll('[role="radio"]')];
    const sync = () => radios.forEach(r => {
      const on = r.dataset.value === settings[key];
      r.setAttribute('aria-checked', String(on));
      r.tabIndex = on ? 0 : -1;
    });
    radios.forEach(r => r.addEventListener('click', () => { apply({ [key]: r.dataset.value }); sync(); }));
    group.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const i = radios.findIndex(r => r.getAttribute('aria-checked') === 'true');
      const n = radios[(i + step + radios.length) % radios.length];
      n.focus();
      n.click();
    });
    syncers.push(sync);
  });

  // sliders
  panel.querySelectorAll('input[type="range"][data-setting]').forEach(input => {
    const key = input.dataset.setting;
    const out = panel.querySelector(`output[for="${input.id}"]`);
    const sync = () => {
      input.value = settings[key];
      if (out) out.textContent = `${Math.round(settings[key] * 100)}%`;
    };
    input.addEventListener('input', () => { apply({ [key]: parseFloat(input.value) }); sync(); });
    syncers.push(sync);
  });

  // switches
  panel.querySelectorAll('input[type="checkbox"][data-setting]').forEach(input => {
    const key = input.dataset.setting;
    const sync = () => { input.checked = settings[key]; };
    input.addEventListener('change', () => apply({ [key]: input.checked }));
    syncers.push(sync);
  });

  panel.querySelector('.cfg-reset')?.addEventListener('click', () => {
    apply({ ...resetTo });
    syncers.forEach(s => s());
  });

  syncers.forEach(s => s());

  // on phones the tab floats at the screen edge; hide it once the hero is scrolled away
  if (hero) {
    new IntersectionObserver(([en]) => {
      panel.classList.toggle('is-away', !en.isIntersecting);
      if (!en.isIntersecting && panel.classList.contains('is-open')) setOpen(false);
    }, { threshold: 0.15 }).observe(hero);
  }
}

/* =========================================================
   Geometry
   ========================================================= */

// Read the logo SVG; return letter and emblem shapes in world units (logo 4 units wide, y up,
// centred). Emblem shapes are relative to the emblem's own centre so it can spin in place.
async function loadLogo(url) {
  const data = await new SVGLoader().loadAsync(url);
  const toPts = p => {
    const pts = p.getPoints(12).map(v => new THREE.Vector2(v.x, -v.y));
    if (pts.length > 2 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-6) pts.pop();
    return pts;
  };
  const raw = { letters: [], emblem: [] };
  for (const path of data.paths) {
    const node = path.userData && path.userData.node;
    const inEmblem = node && node.closest ? !!node.closest('#emblem') : path.color.getHexString() === 'ffc20e';
    const part = inEmblem ? 'emblem' : 'letters';
    for (const shape of SVGLoader.createShapes(path)) {
      raw[part].push({ outer: toPts(shape), holes: shape.holes.map(toPts) });
    }
  }
  const box = new THREE.Box2();
  for (const part of Object.values(raw)) for (const s of part) s.outer.forEach(p => box.expandByPoint(p));
  const c = box.getCenter(new THREE.Vector2());
  const k = 4 / box.getSize(new THREE.Vector2()).x;
  const norm = s => { s.outer.forEach(p => p.sub(c).multiplyScalar(k)); s.holes.forEach(h => h.forEach(p => p.sub(c).multiplyScalar(k))); };
  raw.letters.forEach(norm);
  raw.emblem.forEach(norm);

  const eb = new THREE.Box2();
  raw.emblem.forEach(s => s.outer.forEach(p => eb.expandByPoint(p)));
  const ec = eb.getCenter(new THREE.Vector2());
  raw.emblem.forEach(s => { s.outer.forEach(p => p.sub(ec)); s.holes.forEach(h => h.forEach(p => p.sub(ec))); });

  const toShape = s => {
    const shape = new THREE.Shape(s.outer);
    shape.holes = s.holes.map(h => new THREE.Path(h));
    return shape;
  };
  return {
    letters: raw.letters.map(toShape),
    emblem: raw.emblem.map(toShape),
    emblemCenter: ec,
    size: box.getSize(new THREE.Vector2()).multiplyScalar(k),
  };
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
// Caps keep their flat normals so faces stay crisp.
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

function areaOf(geo) {
  const p = geo.attributes.position;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let s = 0;
  for (let i = 0; i + 2 < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    s += b.sub(a).cross(c.sub(a)).length() / 2;
  }
  return s;
}

function samplePoints(geo, count, fn) {
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build();
  const p = new THREE.Vector3();
  for (let i = 0; i < count; i++) { sampler.sample(p); fn(p, i); }
}

const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

// default arrive/leave for mesh looks: grow with a little overshoot while turning into place
function meshPresence(group, v) {
  group.scale.setScalar(Math.max(0.001, v >= 1 ? 1 : easeOutBack(v)));
  group.rotation.y = (1 - v) * -1.6;
}

// every style: a group holding the letters and an emblem pivot placed at the emblem's centre
function scaffold(logo) {
  const group = new THREE.Group();
  const letters = new THREE.Group();
  const emblemPivot = new THREE.Group();
  emblemPivot.position.set(logo.emblemCenter.x, logo.emblemCenter.y, 0);
  group.add(letters, emblemPivot);
  return { group, letters, emblemPivot };
}

function makeShadow(size) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(14,46,67,0.34)');
  gr.addColorStop(0.5, 'rgba(14,46,67,0.1)');
  gr.addColorStop(1, 'rgba(14,46,67,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x * 1.25, 1.6),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = -size.y / 2 - 0.32;
  return m;
}

/* =========================================================
   Style 1 · Solid
   ========================================================= */
function makeSolid(logo) {
  const { group, letters, emblemPivot } = scaffold(logo);
  const gold = new THREE.MeshPhysicalMaterial({
    color: C.gold, metalness: 1, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.45,
  });
  const goldSide = new THREE.MeshPhysicalMaterial({ color: C.goldDeep, metalness: 1, roughness: 0.22, envMapIntensity: 1.3 });
  const face = new THREE.MeshPhysicalMaterial({ clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 });
  const side = new THREE.MeshPhysicalMaterial({ roughness: 0.3, envMapIntensity: 1.2 });
  letters.add(new THREE.Mesh(extrude(logo.letters, 0.2, 0.03, 5), [face, side]));
  emblemPivot.add(new THREE.Mesh(extrude(logo.emblem, 0.26, 0.04, 6), [gold, goldSide]));

  const glint = new THREE.PointLight(0xfff4d6, 0, 4, 1.5);
  group.add(glint);
  let lift = 0, sweep = 0;
  return {
    group, emblemPivot,
    setPresence: v => meshPresence(group, v),
    setScheme(name) {
      const s = SCHEMES[name];
      if (s.metal) {
        face.color.copy(C.gold); face.metalness = 1; face.roughness = 0.16;
        side.color.copy(C.goldDeep); side.metalness = 1;
      } else {
        face.color.set(s.letters);
        face.metalness = name === 'brand' ? 0.15 : 0.35;
        face.roughness = name === 'brand' ? 0.22 : 0.3;
        face.clearcoat = 1;
        face.clearcoatRoughness = 0.05;
        side.color.set(s.edge);
        side.metalness = name === 'brand' ? 0.25 : 0.5;
      }
    },
    update(dt, t, ctx) {
      lift += ((ctx.over ? 1 : 0) - lift) * Math.min(1, dt * 4);
      sweep = (sweep + dt * (0.12 + 0.12 * ctx.speed + lift * 0.4)) % 1;
      glint.position.set(-2.8 + sweep * 5.6, 0.7 - sweep * 1.4, 0.8);
      glint.intensity = Math.sin(sweep * Math.PI) * (6 + lift * 10);
      emblemPivot.position.z = lift * 0.22;
      letters.position.z = lift * 0.06;
    },
  };
}

/* =========================================================
   Style 2 · Particles
   ========================================================= */
const PARTICLE_VS = /* glsl */`
  uniform float uTime, uScatter, uMouseOn, uScale, uSize;
  uniform vec3 uMouse;
  uniform vec2 uOffset, uFade;
  attribute vec4 aRnd;
  attribute float aTone;
  varying float vTone, vShade, vA;
  vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
  void main() {
    vec3 p = position;
    // cursor wake: grains slide away from the pointer
    vec2 dm = p.xy + uOffset - uMouse.xy;
    float dist = length(dm);
    float wake = uMouseOn * (1.0 - smoothstep(0.0, 0.4, dist));
    p.xy += (dm / max(dist, 1e-3)) * wake * 0.2;
    p.z += wake * (aRnd.z - 0.5) * 0.5;
    // staggered scatter into a drifting cloud
    float s = clamp(uScatter * 1.5 - aRnd.w * 0.5, 0.0, 1.0);
    s = s * s * (3.0 - 2.0 * s);
    vec3 dir = normalize(vec3((aRnd.x - 0.5) * 1.6, aRnd.y - 0.5, aRnd.z - 0.5) + 1e-4);
    float reach = 0.3 + aRnd.w * 0.8;
    p = mix(p, rotY(p, (aRnd.x - 0.5) * 1.2) + dir * reach, s);
    p += s * 0.07 * vec3(sin(uTime * 0.7 + aRnd.y * 40.0), cos(uTime * 0.6 + aRnd.x * 40.0), sin(uTime * 0.5 + aRnd.z * 40.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uScale * (0.65 + aRnd.y * 0.7) * (1.0 - s * 0.3) / -mv.z;
    gl_Position = projectionMatrix * mv;
    vTone = aTone;
    vShade = clamp(position.z * 4.0 + 0.5, 0.0, 1.0) * 0.6 + aRnd.x * 0.4;
    float e = length((p.xy + uOffset) / uFade);
    vA = (1.0 - s * 0.4) * (1.0 - smoothstep(0.8, 1.0, e));
  }`;
const PARTICLE_FS = /* glsl */`
  uniform vec3 uCol, uColDeep, uAccent, uWhite;
  uniform float uAlpha;
  varying float vTone, vShade, vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.18, d);
    vec3 col = vTone > 1.5 ? uWhite : (vTone > 0.5 ? uAccent : mix(uColDeep, uCol, vShade));
    gl_FragColor = vec4(col, a * vA * uAlpha);
    #include <colorspace_fragment>
  }`;

function makeParticles(logo, isMobile, shared) {
  const { group, letters, emblemPivot } = scaffold(logo);
  const lGeo = extrude(logo.letters, 0.2, 0.03, 3, false);
  const eGeo = extrude(logo.emblem, 0.26, 0.035, 3, false);
  const total = isMobile ? 14000 : 34000;
  const la = areaOf(lGeo), ea = areaOf(eGeo);
  const common = {
    uTime: { value: 0 }, uScatter: { value: 1 }, uMouseOn: { value: 0 }, uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uScale: shared.uScale, uFade: shared.uFade, uSize: { value: isMobile ? 0.026 : 0.02 }, uAlpha: { value: 0 },
    uWhite: { value: C.white },
  };
  const cloud = (geo, count, offset) => {
    const home = new Float32Array(count * 3), rnd = new Float32Array(count * 4), tone = new Float32Array(count);
    samplePoints(geo, count, (p, i) => {
      home.set([p.x, p.y, p.z], i * 3);
      rnd.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const r = Math.random();
      tone[i] = r < 0.05 ? 1 : r < 0.07 ? 2 : 0;   // mostly main colour, a few accent and white sparks
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(home, 3));
    g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 4));
    g.setAttribute('aTone', new THREE.BufferAttribute(tone, 1));
    const u = {
      ...common, uOffset: { value: offset },
      uCol: { value: new THREE.Color() }, uColDeep: { value: new THREE.Color() }, uAccent: { value: new THREE.Color() },
    };
    const pts = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: u, vertexShader: PARTICLE_VS, fragmentShader: PARTICLE_FS,
      transparent: true, depthWrite: false, toneMapped: false,
    }));
    pts.frustumCulled = false;
    return { pts, u };
  };
  const L = cloud(lGeo, Math.round(total * la / (la + ea)), new THREE.Vector2(0, 0));
  const E = cloud(eGeo, Math.round(total * ea / (la + ea)), logo.emblemCenter.clone());
  E.u.uCol.value.copy(C.gold); E.u.uColDeep.value.copy(C.goldDeep); E.u.uAccent.value.copy(C.navy);
  letters.add(L.pts);
  emblemPivot.add(E.pts);

  let presence = 0, scatter = 1;
  return {
    group, emblemPivot,
    // arriving = gathering from a cloud, leaving = blowing apart
    setPresence(v) { presence = v; common.uAlpha.value = Math.min(1, v * 1.6); },
    setScheme(name) {
      const s = SCHEMES[name];
      L.u.uCol.value.set(s.letters);
      L.u.uColDeep.value.set(s.metal ? s.edge : s.speck);
      L.u.uAccent.value.copy(s.metal ? C.navy : C.gold);
    },
    update(dt, t, ctx) {
      const target = Math.max(ctx.over ? 1 : 0, 1 - presence);
      const rate = ctx.reduceMotion ? 20 : (target > scatter ? 3.2 : 2.4);
      scatter += (target - scatter) * Math.min(1, dt * rate);
      common.uScatter.value = scatter;
      common.uTime.value = t;
      common.uMouse.value.copy(ctx.mouse);
      common.uMouseOn.value += ((ctx.hover ? 1 : 0) - common.uMouseOn.value) * Math.min(1, dt * 6);
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
    vPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mv;
  }`;
const GLASS_FS = /* glsl */`
  uniform vec3 uTint, uDeep, uHi, uRim;
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
    float band = 1.0 - smoothstep(0.0, 0.05 + 0.04 * uShine, abs(vPos.x * 0.6 + vPos.y * 0.5 - (fract(uTime * 0.12) * 6.0 - 3.0)));
    float hi = clamp(top + side + band * (0.55 + 0.45 * uShine), 0.0, 1.0);
    vec3 col = mix(uTint, uDeep, clamp(floorD * 0.85 + fres * 0.6, 0.0, 1.0));
    col = mix(col, uRim, smoothstep(0.75, 1.0, fres) * 0.25);
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
    float amp = 0.015 + uStir * 0.05 * aRnd.z;
    p.x += cos(a) * amp;
    p.y += sin(a * 1.3) * amp;
    p.z += sin(a * 0.7) * 0.025 * (0.5 + uStir);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 0.04 * uScale * (0.35 + aRnd.w) / -mv.z;
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

function makeGlass(logo, isMobile, shared) {
  const { group, letters, emblemPivot } = scaffold(logo);
  const common = { uTime: { value: 0 }, uAlpha: { value: 0 }, uShine: { value: 0 }, uHi: { value: C.white } };
  const glassPair = (geo, tint, deep, rimCol) => {
    const u = { ...common, uTint: { value: tint }, uDeep: { value: deep }, uRim: { value: rimCol } };
    const mk = side => new THREE.ShaderMaterial({
      uniforms: u, vertexShader: GLASS_VS, fragmentShader: GLASS_FS,
      transparent: true, depthWrite: false, toneMapped: false, side,
    });
    const back = new THREE.Mesh(geo, mk(THREE.BackSide));
    back.renderOrder = 1;
    const front = new THREE.Mesh(geo, mk(THREE.FrontSide));
    front.renderOrder = 3;
    return { back, front, u };
  };
  const L = glassPair(extrude(logo.letters, 0.24, 0.045, 5), new THREE.Color(), new THREE.Color(), C.gold.clone());
  const E = glassPair(extrude(logo.emblem, 0.3, 0.06, 6), C.cream.clone(), C.goldDeep.clone(), C.gold.clone());

  const fu = { uTime: common.uTime, uAlpha: common.uAlpha, uStir: { value: 0 }, uScale: shared.uScale, uGold: { value: C.gold }, uWhite: { value: C.white } };
  const flakes = (shapes, count, depth) => {
    const fp = new Float32Array(count * 3), fr = new Float32Array(count * 4);
    samplePoints(extrude(shapes, depth, 0, 1, false), count, (p, i) => {
      fp.set([p.x, p.y, (Math.random() - 0.5) * depth * 0.9], i * 3);
      fr.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(fp, 3));
    g.setAttribute('aRnd', new THREE.BufferAttribute(fr, 4));
    const pts = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: fu, vertexShader: FLAKE_VS, fragmentShader: FLAKE_FS,
      transparent: true, depthWrite: false, toneMapped: false,
    }));
    pts.renderOrder = 2;
    pts.frustumCulled = false;
    return pts;
  };
  letters.add(L.back, flakes(logo.letters, isMobile ? 900 : 1800, 0.18), L.front);
  emblemPivot.add(E.back, flakes(logo.emblem, isMobile ? 1000 : 2000, 0.22), E.front);

  let stir = 0;
  return {
    group, emblemPivot,
    setPresence(v) { meshPresence(group, v); common.uAlpha.value = v; },
    setScheme(name) {
      const s = SCHEMES[name];
      if (s.metal) { L.u.uTint.value.copy(C.cream); L.u.uDeep.value.copy(C.goldDeep); }
      else { L.u.uTint.value.copy(C.ice); L.u.uDeep.value.set(s.letters); }
    },
    update(dt, t, ctx) {
      stir += ((ctx.over ? 1 : 0) - stir) * Math.min(1, dt * 2.5);
      common.uTime.value = t;
      common.uShine.value = stir;
      fu.uStir.value = stir;
    },
  };
}

/* =========================================================
   Style 4 · Layers
   ========================================================= */
function makeLayers(logo) {
  const { group, letters, emblemPivot } = scaffold(logo);
  const K = 12;
  const lGeo = extrude(logo.letters, 0.016, 0, 1, false);
  const eGeo = extrude(logo.emblem, 0.016, 0, 1, false);
  const colorAt = (stops, k) => {
    const cs = stops.map(c => new THREE.Color(c));
    const f = k * (cs.length - 1), i = Math.min(cs.length - 2, Math.floor(f));
    return cs[i].lerp(cs[i + 1], f - i);
  };
  const stack = (geo, parent) => {
    const out = [];
    for (let i = 0; i < K; i++) {
      const top = i === K - 1;
      const mat = top
        ? new THREE.MeshPhysicalMaterial({ clearcoat: 0.8, clearcoatRoughness: 0.1, envMapIntensity: 1.1 })
        : new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
      const m = new THREE.Mesh(geo, mat);
      parent.add(m);
      out.push(m);
    }
    return out;
  };
  const paint = (meshes, stops, topColor, metal) => {
    meshes.forEach((m, i) => {
      if (i === K - 1) {
        m.material.color.set(topColor);
        m.material.metalness = metal ? 0.9 : 0.3;
        m.material.roughness = metal ? 0.25 : 0.35;
      } else {
        m.material.color.copy(colorAt(stops, i / (K - 2)));
      }
    });
  };
  const L = stack(lGeo, letters);
  const E = stack(eGeo, emblemPivot);
  paint(E, EMBLEM_STACK, C.gold, true);

  // at rest the stack is slightly fanned and turned so the coloured edges always show
  const REST = 0.18;
  let open = REST;
  const arrange = (meshes, t, ctx, gapK) => {
    const gap = (0.02 + open * 0.08) * gapK;
    const wave = ctx.reduceMotion ? 0 : 0.01 * (0.25 + open);
    meshes.forEach((m, i) => {
      const c = i - (K - 1) / 2;
      m.position.z = c * gap + Math.sin(t * 2.2 - i * 0.5) * wave;
      m.rotation.z = c * open * 0.012;
      m.scale.setScalar(1 - (K - 1 - i) * open * 0.008);
    });
  };
  return {
    group, emblemPivot,
    setPresence: v => meshPresence(group, v),
    viewOffset: () => ({ x: -0.15 * open, y: 0.2 + 0.35 * open }),
    setScheme(name) {
      const s = SCHEMES[name];
      paint(L, s.stack, s.letters, !!s.metal);
    },
    update(dt, t, ctx) {
      open += ((ctx.over ? 1 : REST) - open) * Math.min(1, dt * 3.2);
      arrange(L, t, ctx, 1);
      arrange(E, t, ctx, 1.25);
    },
  };
}
