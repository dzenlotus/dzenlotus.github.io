import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const PROJECTS = ["vajra", "mudra", "magik", "abyss", "worklife"];
const MODES = {
  intelligence: {
    color: 0xd7ff75,
    p: 2,
    q: 3,
    radius: 1.12,
    wave: 0.42,
    depth: 0.54,
  },
  magic: { color: 0xbeb0ff, p: 2, q: 5, radius: 1.03, wave: 0.36, depth: 0.58 },
  physics: {
    color: 0x8de7d1,
    p: 1,
    q: 3,
    radius: 1.2,
    wave: 0.27,
    depth: 0.48,
  },
};

// A flattened tube follows a closed knot: its broad faces catch the light like folded titanium.
function makeRibbon(mode) {
  const samples = 320;
  const sides = 24;
  const points = [];
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * Math.PI * 2;
    const r = mode.radius + mode.wave * Math.cos(mode.q * t);
    points.push(
      new THREE.Vector3(
        r * Math.cos(mode.p * t),
        r * Math.sin(mode.p * t),
        mode.depth * Math.sin(mode.q * t),
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
  const frames = curve.computeFrenetFrames(samples, true);
  const positions = [];
  const indices = [];
  const point = new THREE.Vector3();
  const edgeCurves = [[], [], []];

  for (let i = 0; i <= samples; i++) {
    curve.getPointAt(i / samples, point);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];
    const twist = (i / samples) * Math.PI * 2;
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      const rib = 1 + 0.022 * Math.cos(a * 6);
      const x = Math.cos(a) * 0.285 * rib;
      const y = Math.sin(a) * 0.112 * rib;
      const n = x * Math.cos(twist) - y * Math.sin(twist);
      const b = x * Math.sin(twist) + y * Math.cos(twist);
      positions.push(
        point.x + n * normal.x + b * binormal.x,
        point.y + n * normal.y + b * binormal.y,
        point.z + n * normal.z + b * binormal.z,
      );
      if (i < samples && j < sides) {
        const k = i * (sides + 1) + j;
        indices.push(
          k,
          k + 1,
          k + sides + 1,
          k + 1,
          k + sides + 2,
          k + sides + 1,
        );
      }
    }
    for (let j = 0; j < edgeCurves.length; j++) {
      const a = j === 0 ? 0 : j === 1 ? Math.PI : Math.PI / 2;
      const x = Math.cos(a) * 0.289;
      const y = Math.sin(a) * 0.116;
      const n = x * Math.cos(twist) - y * Math.sin(twist);
      const b = x * Math.sin(twist) + y * Math.cos(twist);
      edgeCurves[j].push(
        point.clone().addScaledVector(normal, n).addScaledVector(binormal, b),
      );
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return {
    geometry,
    seams: edgeCurves.map(
      (p, i) =>
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(p),
          320,
          i === 2 ? 0.004 : 0.008,
          5,
          false,
        ),
    ),
  };
}

function lineLoop(radius, material, segments = 192, arc = Math.PI * 2) {
  const points = Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * arc;
    return new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  });
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    material,
  );
}

export async function createScene(
  host,
  { onDiscover, reducedMotion = false } = {},
) {
  const noop = { setMode() {}, setPaused() {}, pulse() {}, dispose() {} };
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    host.dataset.scene = "fallback";
    return noop;
  }

  const canvas = renderer.domElement;
  canvas.className = "artifact-canvas";
  canvas.setAttribute(
    "aria-label",
    "Interactive orbital sculpture. Drag to rotate. Use left and right arrows to select a project, then Enter to explore.",
  );
  canvas.setAttribute("role", "img");
  canvas.tabIndex = 0;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.touchAction = "pan-y";
  host.appendChild(canvas);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
  camera.position.set(0, 0, 8.8);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.95;

  scene.add(new THREE.AmbientLight(0xd3e2d9, 0.8));
  const key = new THREE.DirectionalLight(0xf5f6de, 4.4);
  key.position.set(-3, 4, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd7ff75, 4.2);
  rim.position.set(3, -1, -2);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9eccc6, 1.6);
  fill.position.set(-4, -2, 1);
  scene.add(fill);

  const world = new THREE.Group();
  scene.add(world);
  const sculpture = new THREE.Group();
  sculpture.rotation.set(0.24, -0.36, -0.3);
  world.add(sculpture);

  const titanium = new THREE.MeshPhysicalMaterial({
    color: 0x68705e,
    metalness: 1,
    roughness: 0.23,
    clearcoat: 0.8,
    clearcoatRoughness: 0.19,
    envMapIntensity: 1.3,
    side: THREE.DoubleSide,
  });
  const seamMaterial = new THREE.MeshStandardMaterial({
    color: 0xd7ff75,
    emissive: 0xd7ff75,
    emissiveIntensity: 1.1,
    metalness: 0.35,
    roughness: 0.3,
  });
  const whiteSeam = new THREE.MeshStandardMaterial({
    color: 0xe1e5cf,
    metalness: 0.85,
    roughness: 0.22,
  });
  const shapes = Object.fromEntries(
    Object.entries(MODES).map(([name, config]) => [name, makeRibbon(config)]),
  );
  const body = new THREE.Mesh(shapes.intelligence.geometry, titanium);
  sculpture.add(body);
  const seams = shapes.intelligence.seams.map((geometry, i) => {
    const mesh = new THREE.Mesh(geometry, i === 2 ? whiteSeam : seamMaterial);
    sculpture.add(mesh);
    return mesh;
  });

  const orbit = new THREE.Group();
  orbit.rotation.set(-0.62, 0.27, -0.33);
  world.add(orbit);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x637759,
    transparent: true,
    opacity: 0.38,
  });
  const faintMaterial = new THREE.LineBasicMaterial({
    color: 0x67776a,
    transparent: true,
    opacity: 0.16,
  });
  const brightLine = new THREE.LineBasicMaterial({
    color: 0xd7ff75,
    transparent: true,
    opacity: 0.7,
  });
  orbit.add(lineLoop(2.32, lineMaterial));
  orbit.add(lineLoop(2.38, faintMaterial));
  const arc = lineLoop(2.32, brightLine, 70, Math.PI * 0.45);
  arc.rotation.z = 0.3;
  orbit.add(arc);
  const secondaryOrbit = lineLoop(2.08, faintMaterial);
  secondaryOrbit.rotation.set(1.15, 0.28, 0.4);
  world.add(secondaryOrbit);

  const ticks = [];
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const inner = i % 8 === 0 ? 2.4 : 2.41;
    const outer = i % 8 === 0 ? 2.49 : 2.445;
    ticks.push(
      Math.cos(a) * inner,
      Math.sin(a) * inner,
      0,
      Math.cos(a) * outer,
      Math.sin(a) * outer,
      0,
    );
  }
  const tickGeometry = new THREE.BufferGeometry();
  tickGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(ticks, 3),
  );
  orbit.add(new THREE.LineSegments(tickGeometry, lineMaterial));

  const satelliteMaterial = new THREE.MeshStandardMaterial({
    color: 0xe4f2c7,
    emissive: 0xd7ff75,
    emissiveIntensity: 0.65,
    metalness: 0.8,
    roughness: 0.2,
  });
  const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
  const satellites = [];
  const targets = [];
  PROJECTS.forEach((id, index) => {
    const group = new THREE.Group();
    const angle = -0.19 + (index / PROJECTS.length) * Math.PI * 2;
    group.position.set(Math.cos(angle) * 2.32, Math.sin(angle) * 2.32, 0);
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.065, 0),
      satelliteMaterial,
    );
    gem.rotation.z = Math.PI / 4;
    group.add(gem);
    const halo = lineLoop(0.13, brightLine, 40);
    group.add(halo);
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      hitMaterial,
    );
    hit.userData.id = id;
    group.add(hit);
    orbit.add(group);
    satellites.push({ group, gem, halo, angle });
    targets.push(hit);
  });

  // Sparse deterministic points preserve the same composition between visits.
  const dustPositions = [];
  for (let i = 0; i < 90; i++) {
    const a = i * 2.399963;
    const radius = 2.4 + ((i * 37) % 100) / 60;
    dustPositions.push(
      Math.cos(a) * radius,
      Math.sin(a) * radius * 0.75,
      -1 - (i % 9) * 0.28,
    );
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(dustPositions, 3),
  );
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      color: 0xb7c7a3,
      size: 0.018,
      transparent: true,
      opacity: 0.46,
      sizeAttenuation: true,
    }),
  );
  world.add(dust);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(4, 4);
  const parallax = new THREE.Vector2();
  const drag = new THREE.Vector2();
  let activeMode = "intelligence";
  let hovered = -1;
  let keyboardSelected = 0;
  let pointerDown = null;
  let didDrag = false;
  let elapsed = 0;
  let burst = 0;
  let frame = 0;
  let lastTime = 0;
  let paused = false;
  let motionReduced = reducedMotion;
  let inView = true;
  let disposed = false;
  let contextLost = false;

  function render() {
    if (disposed || contextLost) return;
    renderer.render(scene, camera);
  }

  function updateScene(delta = 0) {
    elapsed += delta;
    burst = Math.max(0, burst - delta * 1.6);
    sculpture.rotation.x =
      0.24 +
      drag.y +
      parallax.y * 0.12 +
      (motionReduced ? 0 : Math.sin(elapsed * 0.25) * 0.045);
    sculpture.rotation.y = -0.36 + drag.x + parallax.x * 0.16 + elapsed * 0.075;
    sculpture.rotation.z =
      -0.3 +
      (activeMode === "physics" ? 0.24 : activeMode === "magic" ? -0.12 : 0);
    sculpture.scale.setScalar(1 + Math.sin(burst * Math.PI) * 0.035);
    world.position.y = motionReduced ? 0 : Math.sin(elapsed * 0.45) * 0.04;
    orbit.rotation.z = -0.33 + elapsed * 0.018;
    arc.rotation.z = 0.3 - elapsed * 0.035;
    dust.rotation.z = elapsed * -0.007;
    satellites.forEach(({ group, gem, halo }, index) => {
      const selected = index === hovered;
      const scale = selected ? 1.4 : 1;
      gem.rotation.y = elapsed * 0.5 + index;
      gem.scale.setScalar(scale);
      halo.scale.setScalar(selected ? 1.2 : 1);
      group.position.z = selected ? 0.09 : 0;
    });
    seamMaterial.emissiveIntensity = 1.1 + burst * 1.4;
    render();
  }

  function shouldAnimate() {
    return (
      !disposed &&
      !contextLost &&
      !paused &&
      !motionReduced &&
      inView &&
      !document.hidden
    );
  }

  function animate(time) {
    frame = 0;
    if (!shouldAnimate()) return;
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    updateScene(delta);
    frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    if (shouldAnimate()) {
      if (!frame) {
        lastTime = 0;
        frame = requestAnimationFrame(animate);
      }
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = Math.max(8.8, 7.9 / camera.aspect);
    camera.updateProjectionMatrix();
    updateScene();
  }

  function findTarget(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(targets, false)[0];
    return hit ? PROJECTS.indexOf(hit.object.userData.id) : -1;
  }

  function onPointerMove(event) {
    const bounds = canvas.getBoundingClientRect();
    parallax.set(
      (event.clientX - bounds.left) / bounds.width - 0.5,
      (event.clientY - bounds.top) / bounds.height - 0.5,
    );
    if (pointerDown) {
      const dx = event.clientX - pointerDown.x;
      const dy = event.clientY - pointerDown.y;
      if (Math.hypot(dx, dy) > 5) didDrag = true;
      drag.set(pointerDown.dragX + dx * 0.006, pointerDown.dragY + dy * 0.004);
      canvas.style.cursor = "grabbing";
    } else {
      hovered = findTarget(event);
      canvas.style.cursor = hovered >= 0 ? "pointer" : "grab";
    }
    if (!shouldAnimate()) updateScene();
  }

  function onPointerDown(event) {
    if (event.button !== 0) return;
    pointerDown = {
      x: event.clientX,
      y: event.clientY,
      dragX: drag.x,
      dragY: drag.y,
    };
    didDrag = false;
    canvas.setPointerCapture(event.pointerId);
  }

  function onPointerUp(event) {
    if (!pointerDown) return;
    if (!didDrag && event.type !== "pointercancel") {
      const target = findTarget(event);
      if (target >= 0) onDiscover?.(PROJECTS[target]);
    }
    pointerDown = null;
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = hovered >= 0 ? "pointer" : "grab";
  }

  function onPointerLeave() {
    if (pointerDown) return;
    hovered = -1;
    parallax.set(0, 0);
    canvas.style.cursor = "grab";
    if (!shouldAnimate()) updateScene();
  }

  function onKeyDown(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      keyboardSelected =
        (keyboardSelected +
          (event.key === "ArrowRight" ? 1 : -1) +
          PROJECTS.length) %
        PROJECTS.length;
      hovered = keyboardSelected;
      canvas.setAttribute(
        "aria-label",
        `${PROJECTS[hovered]} selected. Press Enter to explore. Left and right arrows select another project.`,
      );
      updateScene();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onDiscover?.(PROJECTS[keyboardSelected]);
    }
  }

  function onContextLost(event) {
    event.preventDefault();
    contextLost = true;
    host.dataset.scene = "fallback";
    syncAnimation();
  }

  const listeners = [
    ["pointermove", onPointerMove],
    ["pointerdown", onPointerDown],
    ["pointerup", onPointerUp],
    ["pointercancel", onPointerUp],
    ["pointerleave", onPointerLeave],
    ["keydown", onKeyDown],
    ["webglcontextlost", onContextLost],
  ];
  listeners.forEach(([type, handler]) =>
    canvas.addEventListener(type, handler),
  );
  document.addEventListener("visibilitychange", syncAnimation);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      syncAnimation();
    },
    { rootMargin: "100px" },
  );
  intersectionObserver.observe(host);
  canvas.style.cursor = "grab";
  resize();
  host.dataset.scene = "ready";
  syncAnimation();

  return {
    setMode(mode) {
      if (!MODES[mode] || disposed) return;
      activeMode = mode;
      body.geometry = shapes[mode].geometry;
      seams.forEach((mesh, i) => {
        mesh.geometry = shapes[mode].seams[i];
      });
      const color = MODES[mode].color;
      seamMaterial.color.setHex(color);
      seamMaterial.emissive.setHex(color);
      satelliteMaterial.emissive.setHex(color);
      brightLine.color.setHex(color);
      rim.color.setHex(color);
      burst = motionReduced ? 0 : 1;
      updateScene();
    },
    setPaused(value) {
      paused = Boolean(value);
      if (!paused) motionReduced = false;
      syncAnimation();
    },
    pulse() {
      if (!disposed) {
        burst = motionReduced ? 0 : 1;
        updateScene();
      }
    },
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      listeners.forEach(([type, handler]) =>
        canvas.removeEventListener(type, handler),
      );
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material)
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((material) => materials.add(material));
      });
      Object.values(shapes).forEach((shape) => {
        geometries.add(shape.geometry);
        shape.seams.forEach((geometry) => geometries.add(geometry));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      environment.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
