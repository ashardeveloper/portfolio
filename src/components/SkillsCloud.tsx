"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const pointer = { x: 0, y: 0, inside: false };

/** Draws a skill label onto a canvas so it can be used as a sprite texture. */
function labelTexture(text: string, color: string) {
  const dpr = 2;
  const font = `600 ${30 * dpr}px ui-sans-serif, system-ui, "Segoe UI", sans-serif`;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  const padX = 22 * dpr;
  const w = Math.ceil(ctx.measureText(text).width) + padX * 2;
  const h = 58 * dpr;
  canvas.width = w;
  canvas.height = h;

  ctx.fillStyle = "rgba(13, 15, 24, 0.82)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.roundRect(dpr, dpr, w - dpr * 2, h - dpr * 2, h / 2);
  ctx.fill();
  ctx.stroke();

  ctx.font = font;
  ctx.fillStyle = "#f2f4fa";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + dpr);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: w / h };
}

function Cloud({ skills }: { skills: string[] }) {
  const group = useRef<THREE.Group>(null);
  const radius = 2.6;

  const items = useMemo(() => {
    const n = skills.length;
    const violet = new THREE.Color("#8b5cf6");
    const cyan = new THREE.Color("#22d3ee");
    return skills.map((name, i) => {
      // Fibonacci sphere: evenly spaced points.
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = i * Math.PI * (3 - Math.sqrt(5));
      const color = `#${violet.clone().lerp(cyan, i / (n - 1)).getHexString()}`;
      const { texture, aspect } = labelTexture(name, color);
      return {
        name,
        texture,
        aspect,
        position: [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius] as const,
      };
    });
  }, [skills]);

  useEffect(() => () => items.forEach((i) => i.texture.dispose()), [items]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const d = Math.min(dt, 0.05);
    const vx = pointer.inside ? pointer.x * 0.9 : 0.22;
    const vy = pointer.inside ? pointer.y * 0.6 : 0.04;
    group.current.rotation.y += d * vx;
    group.current.rotation.x += d * vy;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[radius * 0.92, 2]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.07} />
      </mesh>
      {items.map((it) => (
        <sprite key={it.name} position={it.position} scale={[0.42 * it.aspect, 0.42, 1]}>
          <spriteMaterial map={it.texture} transparent depthWrite={false} fog />
        </sprite>
      ))}
    </group>
  );
}

export default function SkillsCloud({ skills, active }: { skills: string[]; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8.6], fov: 50 }}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        pointer.inside = true;
      }}
      onPointerLeave={() => {
        pointer.inside = false;
      }}
    >
      <fog attach="fog" args={["#07080d", 6.6, 12]} />
      <Cloud skills={skills} />
    </Canvas>
  );
}
