import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Helix() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const points: [number, number, number][] = [];
  const points2: [number, number, number][] = [];
  const connectors: { from: [number, number, number]; to: [number, number, number] }[] = [];

  for (let i = 0; i < 40; i++) {
    const t = i * 0.3;
    const x1 = Math.cos(t) * 1.2;
    const z1 = Math.sin(t) * 1.2;
    const y = t * 0.15 - 3;
    const x2 = Math.cos(t + Math.PI) * 1.2;
    const z2 = Math.sin(t + Math.PI) * 1.2;
    points.push([x1, y, z1]);
    points2.push([x2, y, z2]);
    if (i % 4 === 0) {
      connectors.push({ from: [x1, y, z1], to: [x2, y, z2] });
    }
  }

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={`a${i}`} position={p}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {points2.map((p, i) => (
        <mesh key={`b${i}`} position={p}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#00BCD4" emissive="#00BCD4" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {connectors.map((c, i) => {
        const mid: [number, number, number] = [
          (c.from[0] + c.to[0]) / 2,
          (c.from[1] + c.to[1]) / 2,
          (c.from[2] + c.to[2]) / 2,
        ];
        const len = Math.sqrt(
          (c.to[0] - c.from[0]) ** 2 + (c.to[1] - c.from[1]) ** 2 + (c.to[2] - c.from[2]) ** 2
        );
        const dir = new THREE.Vector3(c.to[0] - c.from[0], c.to[1] - c.from[1], c.to[2] - c.from[2]).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        return (
          <mesh key={`c${i}`} position={mid} quaternion={quat}>
            <cylinderGeometry args={[0.015, 0.015, len, 4]} />
            <meshStandardMaterial color="#00C853" emissive="#00C853" emissiveIntensity={0.3} opacity={0.6} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

export default function DNAHelix({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#C9A84C" />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#00BCD4" />
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
          <Helix />
        </Float>
      </Canvas>
    </div>
  );
}
