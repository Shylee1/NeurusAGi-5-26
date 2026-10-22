import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 * The Core: a slow-breathing sphere of neural points that leans toward
 * the cursor and disperses as the hero scrolls away.
 * Loaded only in the browser, only after first paint.
 * ------------------------------------------------------------------ */

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uDisperse;
  uniform float uSize;
  uniform vec2 uPointer;
  attribute float aSeed;
  varying float vSeed;
  varying float vDepth;
  varying vec2 vNdc;

  void main() {
    vec3 origin = position;
    vec3 dir = normalize(origin);
    float seed = aSeed;

    // Breathing shell: each point drifts on its own phase.
    float breath = 0.012 * sin(uTime * 0.55 + seed * 6.2831853);

    // Scroll dispersal: points drift outward along their own normal,
    // farther points travelling farther so the shell opens unevenly.
    vec3 dispersed = origin + dir * uDisperse * (0.35 + seed * 2.1);

    // Cursor lean: the whole shell tips slightly toward the pointer.
    dispersed.x += uPointer.x * 0.16 * (0.4 + seed * 0.6);
    dispersed.y += uPointer.y * 0.10 * (0.4 + seed * 0.6);

    vec3 p = dispersed * (1.0 + breath);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = uSize * (0.45 + seed * 1.1);
    gl_PointSize = size * (11.0 / max(-mv.z, 0.001));

    vSeed = seed;
    vDepth = clamp((-mv.z - 2.2) / 6.0, 0.0, 1.0);
    vNdc = gl_Position.xy / gl_Position.w;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uDisperse;
  varying float vSeed;
  varying float vDepth;
  varying vec2 vNdc;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Soft circular falloff so points read as light, not dots.
    float alpha = smoothstep(0.5, 0.06, d);

    vec3 teal = vec3(0.0, 0.807, 0.819);
    vec3 gold = vec3(1.0, 0.843, 0.0);
    // Teal on the left, gold on the right, echoing the headline gradient.
    float sweep = smoothstep(-0.75, 0.85, vNdc.x);
    float spark = smoothstep(0.86, 1.0, vSeed);
    vec3 color = mix(teal, gold, max(sweep, spark));

    // Back of the sphere dims, front glows.
    alpha *= mix(1.0, 0.22, vDepth);

    // A soft hollow in the middle of the sphere keeps the headline clear
    // without a hard-edged scrim behind it.
    float hole = smoothstep(0.5, 1.22, length(vec2(vNdc.x / 0.6, vNdc.y / 0.38)));
    alpha *= hole;
    alpha *= 1.0 - clamp(uDisperse, 0.0, 1.0) * 0.6;

    gl_FragColor = vec4(color, alpha);
  }
`;

function buildCore(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    // Fibonacci sphere: even coverage without clumping at the poles.
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const shell = radius * (0.94 + Math.random() * 0.12);

    positions[i * 3] = Math.cos(theta) * ring * shell;
    positions[i * 3 + 1] = y * shell;
    positions[i * 3 + 2] = Math.sin(theta) * ring * shell;
    seeds[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

  // Synapses: short links between neighbouring points, kept sparse.
  const linkPositions: number[] = [];
  const maxLinks = Math.round(count * 0.05);
  for (let i = 0; i < count && linkPositions.length < maxLinks * 6; i += 1) {
    const a = Math.floor(Math.random() * count);
    const b = Math.floor(Math.random() * count);
    if (a === b) continue;
    const ax = positions[a * 3];
    const ay = positions[a * 3 + 1];
    const az = positions[a * 3 + 2];
    const bx = positions[b * 3];
    const by = positions[b * 3 + 1];
    const bz = positions[b * 3 + 2];
    const distance = Math.hypot(ax - bx, ay - by, az - bz);
    if (distance > radius * 0.42) continue;
    linkPositions.push(ax, ay, az, bx, by, bz);
  }

  const linkGeometry = new THREE.BufferGeometry();
  linkGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(linkPositions), 3),
  );

  return { geometry, linkGeometry };
}

function glowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(0,206,209,0.55)');
  gradient.addColorStop(0.35, 'rgba(0,160,180,0.18)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

interface CoreProps {
  animate: boolean;
  density: 'low' | 'high';
  scrollRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}

function Core({ animate, density, scrollRef, pointerRef }: CoreProps) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const links = useRef<THREE.LineSegments>(null);
  const { size } = useThree();

  const count = density === 'high' ? 19000 : 5200;
  const { geometry, linkGeometry } = useMemo(() => buildCore(count, 2.05), [count]);
  const texture = useMemo(() => glowTexture(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDisperse: { value: 0 },
      uSize: { value: density === 'high' ? 1.4 : 1.8 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [density],
  );

  useFrame((state, delta) => {
    if (!points.current || !group.current) return;

    const pointer = pointerRef.current;
    const scroll = scrollRef.current;

    uniforms.uTime.value += animate ? Math.min(delta, 0.05) : 0;
    uniforms.uDisperse.value +=
      (Math.min(scroll, 1) * 1.35 - uniforms.uDisperse.value) * 0.08;
    uniforms.uPointer.value.x += (pointer.x - uniforms.uPointer.value.x) * 0.05;
    uniforms.uPointer.value.y += (pointer.y - uniforms.uPointer.value.y) * 0.05;

    if (animate) {
      group.current.rotation.y += delta * 0.055;
      group.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.18) * 0.12 + pointer.y * 0.12;
      group.current.rotation.z = pointer.x * 0.06;
    }

    const scale = Math.min(size.width, size.height) / 900;
    group.current.scale.setScalar(Math.max(0.62, Math.min(scale, 1.25)));

    // The links fade faster than the points so the shell opens cleanly.
    const lineMaterial = links.current?.material as THREE.LineBasicMaterial | undefined;
    if (lineMaterial) {
      lineMaterial.opacity = 0.1 * (1 - Math.min(scroll, 1) * 0.8);
    }
  });

  return (
    <group ref={group}>
      <sprite scale={[7.2, 7.2, 1]}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.5}
        />
      </sprite>

      <points ref={points} geometry={geometry}>
        <shaderMaterial
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={links} geometry={linkGeometry}>
        <lineBasicMaterial
          color="#00CED1"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

export function NeuralCoreScene({
  animate,
  density,
  scrollRef,
  pointerRef,
}: CoreProps) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6.2], fov: 55 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      frameloop={animate ? 'always' : 'demand'}
    >
      <Core
        animate={animate}
        density={density}
        scrollRef={scrollRef}
        pointerRef={pointerRef}
      />
    </Canvas>
  );
}
