import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Shield() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 3]} />
        <MeshDistortMaterial
          color="#C9A84C"
          emissive="#C9A84C"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.8}
          distort={0.15}
          speed={2}
          wireframe
        />
      </mesh>
      {/* Inner sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#0B1628" emissive="#00BCD4" emissiveIntensity={0.1} opacity={0.4} transparent />
      </mesh>
    </Float>
  );
}

export default function ShieldGlobe({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 5]} intensity={1.5} color="#C9A84C" />
        <pointLight position={[-3, -2, 3]} intensity={0.7} color="#00BCD4" />
        <Shield />
      </Canvas>
    </div>
  );
}
