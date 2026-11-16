"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const pointer = { x: 0, y: 0 };

function Field() {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);

  const { positions, colors } = useMemo(() => {
    const count = 1600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const violet = new THREE.Color("#8b5cf6");
    const cyan = new THREE.Color("#22d3ee");
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Points spread through a wide, shallow volume around the camera axis.
      const r = 3 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi) - 4;
      c.copy(violet).lerp(cyan, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    if (points.current) points.current.rotation.y += d * 0.025;
    if (a.current) {
      a.current.rotation.x += d * 0.12;
      a.current.rotation.y += d * 0.16;
    }
    if (b.current) {
      b.current.rotation.x -= d * 0.09;
      b.current.rotation.z += d * 0.13;
    }
    if (group.current) {
      group.current.rotation.y += (pointer.x * 0.18 - group.current.rotation.y) * 0.04;
      group.current.rotation.x += (-pointer.y * 0.12 - group.current.rotation.x) * 0.04;
    }
  });

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.75}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={a} position={[4.6, 1.4, -3]}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.22} />
      </mesh>
      <mesh ref={b} position={[-5.2, -1.8, -4]}>
        <octahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export default function HeroScene({ active }: { active: boolean }) {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 55 }}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Field />
    </Canvas>
  );
}
