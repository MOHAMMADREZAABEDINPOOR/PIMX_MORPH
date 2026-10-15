import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import brandGeometry from '../../assets/brand/geometry.json';
import { Category } from "../utils/catalog";
import BrandMark from './BrandMark';
export default function MorphScene({
  paused,
  category,
}: {
  paused: boolean;
  category: Category;
}) {
  const host = useRef<HTMLDivElement>(null),
    pause = useRef(paused),
    dirty = useRef(true);
  const material = useRef<THREE.MeshPhysicalMaterial>(null);
  const targetColor = useRef(new THREE.Color('#2349e8'));
  useEffect(() => {
    pause.current = paused;
    dirty.current = true;
  }, [paused]);
  useEffect(() => {
    targetColor.current.set(
      category === "audio"
        ? "#ed642f"
        : category === "video"
          ? "#2f6061"
          : "#2146ed",
    );
    dirty.current = true;
  }, [category]);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      container.classList.add("webgl-unavailable");
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9.8);
    const pmrem = new THREE.PMREMGenerator(renderer),
      room = new RoomEnvironment(),
      environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    const sculpture = new THREE.Group();
    // The same vector source supplies the interface mark and its sculpted version.
    const extrude = (path: string, depth: number) => {
      const source = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill-rule="evenodd"/></svg>`);
      const shapes = source.paths.flatMap(path => SVGLoader.createShapes(path));
      const result = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: .65, bevelThickness: .65, curveSegments: 24 });
      result.translate(-40, -40, -3);
      result.scale(.055, -.055, .055);
      // A mirrored SVG coordinate system reverses triangle winding.
      const positions = result.getAttribute('position');
      for (let i = 0; i < positions.count; i += 3) {
        const a = new THREE.Vector3().fromBufferAttribute(positions, i);
        const b = new THREE.Vector3().fromBufferAttribute(positions, i + 1);
        positions.setXYZ(i, b.x, b.y, b.z);
        positions.setXYZ(i + 1, a.x, a.y, a.z);
      }
      result.computeVertexNormals();
      return result;
    };
    const geometry = extrude(brandGeometry.body, 7);
    const foldGeometry = extrude(brandGeometry.fold, 8.4);
    const blue = new THREE.MeshPhysicalMaterial({
      color: "#2146ed",
      roughness: 0.3,
      metalness: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.16,
    });
    material.current = blue;
    const knot = new THREE.Mesh(geometry, blue);
    knot.rotation.set(-0.18, -0.38, -0.12);
    sculpture.add(knot);
    const satelliteGeometry = new THREE.BoxGeometry(.56, .56, .56, 1, 1, 1),
      orange = new THREE.MeshPhysicalMaterial({
        color: "#f27642",
        roughness: 0.3,
        metalness: 0.2,
        clearcoat: 1,
      });
    const satellite = new THREE.Mesh(satelliteGeometry, orange);
    knot.add(new THREE.Mesh(foldGeometry, orange));
    satellite.position.set(2.25, 1.1, .3);
    satellite.rotation.set(.3, .3, .3);
    sculpture.add(satellite);
    scene.add(sculpture);
    scene.add(new THREE.AmbientLight("#ffffff", .9));
    const key = new THREE.DirectionalLight("#ffffff", 2);
    key.position.set(-3, 5, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#b7caff", 2);
    rim.position.set(4, -1, -2);
    scene.add(rim);
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      dirty.current = true;
    });
    resize.observe(container);
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(container);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let targetX = 0,
      targetY = 0,
      frame = 0,
      phase = 0,
      previous = 0;
    const pointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      targetY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5;
      targetX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.3;
    };
    const reset = () => {
      targetX = 0;
      targetY = 0;
    };
    container.addEventListener("pointermove", pointer);
    container.addEventListener("pointerleave", reset);
    const render = (time: number) => {
      frame = requestAnimationFrame(render);
      const delta = Math.min((time - previous) / 1000, 0.05);
      previous = time;
      if (!visible || document.hidden) return;
      const resting = pause.current || motion.matches;
      if (
        (pause.current || motion.matches) &&
        !dirty.current &&
        Math.abs(blue.color.r - targetColor.current.r) + Math.abs(blue.color.g - targetColor.current.g) + Math.abs(blue.color.b - targetColor.current.b) < .001 &&
        Math.abs((resting ? 0 : targetX) - sculpture.rotation.x) <
          0.001 &&
        Math.abs((resting ? 0 : targetY) - sculpture.rotation.y) < 0.001
      )
        return;
      dirty.current = false;
      if (!pause.current && !motion.matches) phase += delta;
      const easing = 1 - Math.exp(-delta * 4);
      blue.color.lerp(targetColor.current, motion.matches ? 1 : easing);
      sculpture.rotation.x += ((resting ? 0 : targetX) - sculpture.rotation.x) * easing;
      sculpture.rotation.y += ((resting ? 0 : targetY) - sculpture.rotation.y) * easing;
      knot.rotation.y = -.38 + Math.sin(phase * .22) * .22;
      knot.rotation.z = -.12 + Math.sin(phase * .28) * .04;
      sculpture.position.y = motion.matches ? 0 : Math.sin(phase * 0.6) * 0.1;
      satellite.position.set(
        Math.cos(phase * 0.22 + 0.6) * 2.55,
        Math.sin(phase * 0.22 + 0.6) * 1.65,
        Math.sin(phase * 0.35) * 0.4,
      );
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      container.removeEventListener("pointermove", pointer);
      container.removeEventListener("pointerleave", reset);
      geometry.dispose();
      foldGeometry.dispose();
      satelliteGeometry.dispose();
      blue.dispose();
      orange.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      material.current = null;
    };
  }, []);
  return <div className="morph-canvas" ref={host} aria-hidden="true"><div className="sculpture-fallback"><BrandMark/></div></div>;
}
