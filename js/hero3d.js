// Sinhala KW · Hero 3D: interactive dotted globe with the gold KW emblem at its core.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.getElementById('globeStage');
const hint = document.getElementById('globeHint');

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

if (stage && webglOK()) init().catch(err => console.warn('[hero3d]', err));

async function init() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NAVY = new THREE.Color('#235E83');
  const NAVY_SOFT = new THREE.Color('#9FB9CB');
  const GOLD = new THREE.Color('#FFC20E');

  // ---------- renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 7.1);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xfff1d6, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0x9fc7ff, 1.2);
  rim.position.set(-4, -1, -3);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.35));

  const R = 1.75;
  const root = new THREE.Group();       // whole composition (intro scale, tilt)
  const globe = new THREE.Group();      // rotates with drag
  root.add(globe);
  scene.add(root);
  root.rotation.z = THREE.MathUtils.degToRad(-10);

  // lat/lon (deg) -> position on sphere. lon 0 faces the camera (+Z).
  const toVec = (latDeg, lonDeg, r = R) => {
    const lat = THREE.MathUtils.degToRad(latDeg), lon = THREE.MathUtils.degToRad(lonDeg);
    return new THREE.Vector3(r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lon));
  };

  // ---------- dotted continents ----------
  const mask = await loadMask('assets/3d/earth-mask.png');
  const isMobile = window.innerWidth < 640;
  const N = isMobile ? 9000 : 16000;
  const land = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    const x = Math.cos(t) * r, z = Math.sin(t) * r;
    const lat = Math.asin(y), lon = Math.atan2(x, z);
    const u = (lon + Math.PI) / (2 * Math.PI), v = (Math.PI / 2 - lat) / Math.PI;
    if (mask(u, v)) land.push(x * R, y * R, z * R);
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(land, 3));
  const dotMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: {
      uSize: { value: isMobile ? 3.4 : 4.2 },
      uPR: { value: renderer.getPixelRatio() },
      uFront: { value: NAVY },
      uBack: { value: NAVY_SOFT },
    },
    vertexShader: /* glsl */`
      uniform float uSize; uniform float uPR;
      varying float vFacing;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normalize(position));
        vFacing = n.z;
        gl_PointSize = uSize * uPR * (8.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uFront; uniform vec3 uBack;
      varying float vFacing;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.32, d);
        float f = smoothstep(-0.2, 0.6, vFacing);
        gl_FragColor = vec4(mix(uBack, uFront, f), a * mix(0.22, 0.95, f));
        #include <colorspace_fragment>
      }`,
  });
  globe.add(new THREE.Points(dotGeo, dotMat));

  // ---------- faint grid lines ----------
  const lineMat = new THREE.LineBasicMaterial({ color: NAVY, transparent: true, opacity: 0.1, depthWrite: false });
  const circle = (pts) => new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
  for (let lon = 0; lon < 180; lon += 30) {
    const pts = [];
    for (let a = 0; a < 360; a += 4) pts.push(toVec(a <= 180 ? 90 - a : a - 270, a <= 180 ? lon : lon + 180, R * 1.002));
    globe.add(circle(pts));
  }
  for (const lat of [-60, -30, 0, 30, 60]) {
    const pts = [];
    for (let lon = 0; lon < 360; lon += 4) pts.push(toVec(lat, lon, R * 1.002));
    globe.add(circle(pts));
  }

  // ---------- fresnel rim ----------
  const rimMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uColor: { value: NAVY } },
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.0);
        gl_FragColor = vec4(uColor, f * 0.35);
        #include <colorspace_fragment>
      }`,
  });
  root.add(new THREE.Mesh(new THREE.SphereGeometry(R * 1.01, 64, 64), rimMat));

  // ---------- Sri Lanka marker ----------
  const SL = toVec(7.87, 80.77, R * 1.01);
  const marker = new THREE.Group();
  marker.position.copy(SL);
  marker.lookAt(SL.clone().multiplyScalar(2));
  const goldFlat = new THREE.MeshBasicMaterial({ color: GOLD, toneMapped: false });
  marker.add(new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), goldFlat));
  const pulseMat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false });
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.08, 40), pulseMat);
  marker.add(pulse);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.35, 8).translate(0, 0.175, 0).rotateX(Math.PI / 2),
    goldFlat
  );
  marker.add(beam);
  globe.add(marker);

  // HTML label that follows the marker
  const label = document.createElement('div');
  label.className = 'globe-label';
  label.textContent = 'ශ්‍රී ලංකාව';
  Object.assign(label.style, {
    position: 'absolute', left: '0', top: '0', pointerEvents: 'none',
    font: '700 12px "Noto Sans Sinhala", sans-serif', color: '#0E1C27',
    background: '#fff', padding: '4px 10px', borderRadius: '999px',
    boxShadow: '0 6px 16px -6px rgba(14,46,67,.35)', whiteSpace: 'nowrap',
    transition: 'opacity .3s', opacity: '0', willChange: 'transform',
  });
  stage.appendChild(label);

  // ---------- orbit ring + satellite ----------
  const orbit = new THREE.Group();
  orbit.rotation.set(THREE.MathUtils.degToRad(72), THREE.MathUtils.degToRad(-18), 0);
  const ringMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.3 });
  orbit.add(new THREE.Mesh(new THREE.TorusGeometry(R * 1.2, 0.007, 8, 200), ringMat));
  const sat = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 24), new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.8, roughness: 0.25, emissive: GOLD, emissiveIntensity: 0.25 }));
  orbit.add(sat);
  root.add(orbit);

  // ---------- emblem ----------
  // drawn in a second pass so the dots never cut through it
  const emblemScene = new THREE.Scene();
  emblemScene.environment = scene.environment;
  emblemScene.add(key.clone(), rim.clone(), new THREE.AmbientLight(0xffffff, 0.35));
  const emblemRoot = new THREE.Group();
  emblemRoot.rotation.z = root.rotation.z;
  emblemScene.add(emblemRoot);
  const emblemPivot = new THREE.Group();
  emblemRoot.add(emblemPivot);
  try {
    const gltf = await new GLTFLoader().loadAsync('assets/3d/sinhala_kw_globe_exact.glb');
    const emblem = gltf.scene;
    const box = new THREE.Box3().setFromObject(emblem);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    emblem.position.sub(center);
    const s = (R * 1.15) / Math.max(size.x, size.y);
    const wrap = new THREE.Group();
    wrap.add(emblem);
    wrap.scale.set(s, s, s);
    emblem.traverse(o => {
      if (o.isMesh) {
        o.castShadow = false;
        const name = o.name.toLowerCase();
        if (name.includes('core') || name.includes('obsidian')) {
          o.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#0A1424'),
            metalness: 0.85,
            roughness: 0.12,
            clearcoat: 0.3
          });
        } else {
          o.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#FFC20E'),
            metalness: 0.92,
            roughness: 0.16,
            clearcoat: 0.4,
            clearcoatRoughness: 0.2,
            envMapIntensity: 1.25,
            side: THREE.DoubleSide,
          });
        }
      }
    });
    emblemPivot.add(wrap);
  } catch (e) {
    console.warn('[hero3d] emblem failed to load', e);
  }

  // ---------- interaction ----------
  let rotY = -THREE.MathUtils.degToRad(80), rotX = 0.18; // start with Sri Lanka near front
  let velY = 0, velX = 0;
  let dragging = false, lastX = 0, lastY = 0, interacted = false;
  const pointer = new THREE.Vector2();
  const el = renderer.domElement;

  el.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    el.setPointerCapture?.(e.pointerId);
    if (!interacted) { interacted = true; hint?.classList.add('is-hidden'); }
  });
  const end = () => { dragging = false; };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', end);
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    velY = dx * 0.006;
    velX = dy * 0.004;
    rotY += velY;
    rotX = THREE.MathUtils.clamp(rotX + velX, -0.7, 0.7);
  });
  el.addEventListener('dblclick', () => { velY += 0.25; });

  // ---------- sizing / visibility ----------
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(stage);

  stage.parentElement.classList.add('globe-ready');

  // ---------- loop ----------
  const clock = new THREE.Clock();
  const v = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  let intro = reduceMotion ? 1 : 0;
  const autoSpeed = reduceMotion ? 0.02 : 0.12;

  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    if (intro < 1) intro = Math.min(1, intro + dt * 0.7);
    const ease = 1 - Math.pow(1 - intro, 4);
    root.scale.setScalar(0.72 + 0.28 * ease);
    emblemRoot.scale.copy(root.scale);

    if (!dragging) {
      velY *= 0.94; velX *= 0.9;
      rotY += velY + autoSpeed * dt;
      rotX += (0.18 - rotX) * 0.02;
    }
    globe.rotation.y = rotY;
    globe.rotation.x = rotX;

    // emblem: gentle sway + follows pointer, spins in during intro
    emblemPivot.rotation.y += ((Math.sin(t * 0.6) * 0.22 + pointer.x * 0.3 + (1 - ease) * Math.PI * 2) - emblemPivot.rotation.y) * 0.08;
    emblemPivot.rotation.x += ((-pointer.y * 0.2) - emblemPivot.rotation.x) * 0.08;
    emblemPivot.position.y = Math.sin(t * 1.1) * 0.04;

    sat.position.set(Math.cos(t * 0.5) * R * 1.2, Math.sin(t * 0.5) * R * 1.2, 0);

    const p = (t * 0.8) % 1;
    pulse.scale.setScalar(1 + p * 2.4);
    pulseMat.opacity = 1 - p;

    // label
    marker.getWorldPosition(v);
    nrm.copy(v).normalize();
    const facing = nrm.dot(camera.position.clone().sub(v).normalize());
    v.project(camera);
    const lx = (v.x * 0.5 + 0.5) * stage.clientWidth;
    const ly = (-v.y * 0.5 + 0.5) * stage.clientHeight;
    label.style.transform = `translate(${lx + 12}px, ${ly - 34}px)`;
    label.style.opacity = facing > 0.25 && intro > 0.9 ? '1' : '0';

    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(emblemScene, camera);
  });
}

function loadMask(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
      resolve((u, v) => {
        const x = Math.min(width - 1, Math.floor(u * width));
        const y = Math.min(height - 1, Math.floor(v * height));
        return data[(y * width + x) * 4] > 128;
      });
    };
    img.onerror = reject;
    img.src = src;
  });
}
