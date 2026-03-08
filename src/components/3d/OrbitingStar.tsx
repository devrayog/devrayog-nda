import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function StarField() {
  const groupRef = useRef<THREE.Group>(null);

  const stars = useMemo(() => {
    const arr: { pos: [number, number, number]; size: number; speed: number; orbit: number }[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push({
        pos: [0, 0, 0],
        size: 0.08 + Math.random() * 0.06,
        speed: 0.5 + Math.random() * 1.5,
        orbit: 0.8 + i * 0.35,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central glowing core */}
      <mesh>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.1} transparent opacity={0.2} />
      </mesh>
      {/* Orbiting stars */}
      {stars.map((star, i) => (
        <OrbitingSphere key={i} orbit={star.orbit} size={star.size} speed={star.speed} index={i} />
      ))}
      {/* Orbit rings */}
      {stars.map((star, i) => (
        <mesh key={`ring-${i}`} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[star.orbit, 0.008, 8, 64]} />
          <meshStandardMaterial color="#C9A84C" transparent opacity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function OrbitingSphere({ orbit, size, speed, index }: { orbit: number; size: number; speed: number; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = index * (Math.PI * 2) / 5;

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + offset;
      ref.current.position.x = Math.cos(t) * orbit;
      ref.current.position.z = Math.sin(t) * orbit;
      ref.current.position.y = Math.sin(t * 2) * 0.15;
    }
  });

  const colors = ["#C9A84C", "#00BCD4", "#4CAF50", "#FF9800", "#E91E63"];

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={colors[index % colors.length]}
        emissive={colors[index % colors.length]}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

export default function OrbitingStar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[3, 3, 5]} intensity={1} color="#C9A84C" />
        <StarField />
      </Canvas>
    </div>
  );
}
