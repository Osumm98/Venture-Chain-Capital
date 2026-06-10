"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useInView } from "@/hooks/use-in-view";

// ---------------------------------------------------------------------------
// Shader: Topographical Mesh with Neon-Green Emission
// ---------------------------------------------------------------------------

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying float vElevation;
  varying float vDistToMouse;

  // Simplex-like noise for organic terrain
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x2_ = x_ * ns.x + ns.yyyy;
    vec4 y2_ = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x2_) - abs(y2_);
    vec4 b0 = vec4(x2_.xy, y2_.xy);
    vec4 b1 = vec4(x2_.zw, y2_.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;

    // Multi-octave terrain
    float slowTime = uTime * 0.15;
    float elevation =
      snoise(vec3(position.x * 0.6, position.y * 0.6, slowTime)) * 0.4 +
      snoise(vec3(position.x * 1.2, position.y * 1.2, slowTime * 1.5)) * 0.2 +
      snoise(vec3(position.x * 2.4, position.y * 2.4, slowTime * 2.0)) * 0.1;

    // Mouse interaction — push terrain up near cursor
    vec2 mousePos = uMouse * 3.5;
    float distToMouse = length(position.xy - mousePos);
    float mouseInfluence = smoothstep(2.0, 0.0, distToMouse) * 0.35;
    elevation += mouseInfluence;

    vElevation = elevation;
    vDistToMouse = distToMouse;

    vec3 newPos = position;
    newPos.z = elevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;
  varying float vDistToMouse;

  void main() {
    // VCC neon green palette
    vec3 deepGreen = vec3(0.0, 0.35, 0.18);
    vec3 brightGreen = vec3(0.0, 1.0, 0.53);
    vec3 white = vec3(0.85, 0.95, 0.90);

    // Elevation-based coloring
    float normalizedElev = smoothstep(-0.3, 0.6, vElevation);
    vec3 terrainColor = mix(deepGreen, brightGreen, normalizedElev);

    // Peaks glow white-green
    float peakGlow = smoothstep(0.4, 0.7, vElevation);
    terrainColor = mix(terrainColor, white, peakGlow * 0.3);

    // Mouse proximity glow
    float mouseGlow = smoothstep(2.0, 0.0, vDistToMouse);
    terrainColor = mix(terrainColor, brightGreen, mouseGlow * 0.4);

    // Grid lines (topographical contours)
    float gridX = abs(fract(vUv.x * 40.0 - 0.5) - 0.5);
    float gridY = abs(fract(vUv.y * 40.0 - 0.5) - 0.5);
    float grid = min(gridX, gridY);
    float gridLine = 1.0 - smoothstep(0.0, 0.03, grid);
    terrainColor += brightGreen * gridLine * 0.12;

    // Edge fade
    float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x) *
                     smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

    // Atmospheric pulse
    float pulse = sin(uTime * 0.5) * 0.05 + 0.95;

    float alpha = (0.35 + normalizedElev * 0.5 + mouseGlow * 0.3) * edgeFade * pulse;

    gl_FragColor = vec4(terrainColor, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Topographical Mesh Component
// ---------------------------------------------------------------------------

function TerrainMesh(): React.JSX.Element {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  const handlePointerMove = useCallback(
    (event: THREE.Event & { point: THREE.Vector3 }) => {
      mouseRef.current.set(
        event.point.x / (viewport.width / 2),
        event.point.y / (viewport.height / 2)
      );
    },
    [viewport.width, viewport.height]
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI * 0.35, 0, Math.PI * 0.05]}
      position={[0.3, -0.5, 0]}
      onPointerMove={handlePointerMove}
    >
      <planeGeometry args={[8, 8, 200, 200]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        wireframe={false}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Floating Particles
// ---------------------------------------------------------------------------

function Particles({ count = 120 }: { count?: number }): React.JSX.Element {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#00FF88"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Scene Composition
// ---------------------------------------------------------------------------

function Scene(): React.JSX.Element {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.3}
        color="#00FF88"
      />
      <pointLight
        position={[-3, 2, 3]}
        intensity={0.5}
        color="#00CC6A"
        distance={10}
        decay={2}
      />

      <Float
        speed={0.8}
        rotationIntensity={0.1}
        floatIntensity={0.2}
      >
        <TerrainMesh />
      </Float>

      <Particles />
    </>
  );
}

// ---------------------------------------------------------------------------
// Hero3D — Exported Component with IntersectionObserver
// ---------------------------------------------------------------------------

export function Hero3D(): React.JSX.Element {
  const [containerRef, isInView] = useInView(0.0);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      aria-hidden="true"
    >
      <Canvas
        frameloop={isInView ? "always" : "never"}
        camera={{ position: [0, 0, 4], fov: 55 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
