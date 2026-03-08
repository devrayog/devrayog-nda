import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Badge() {
  const ringRef = useRef<THREE.Mesh>(null);
  const starRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
    if (starRef.current) {
      starRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      starRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <group>
        {/* Outer ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.4, 0.06, 16, 64]} />
          <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.4} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Inner ring */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.1, 0.04, 16, 64]} />
          <meshStandardMaterial color="#00BCD4" emissive="#00BCD4" emissiveIntensity={0.3} metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Star center */}
        <mesh ref={starRef}>
          <octahedronGeometry args={[0.5, 0]} />
          <MeshDistortMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.3} metalness={0.9} roughness={0.1} distort={0.2} speed={3} />
        </mesh>
        {/* Glow sphere */}
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#0B1628" emissive="#C9A84C" emissiveIntensity={0.05} transparent opacity={0.15} />
        </mesh>
      </group>
    </Float>
  );
}

export default function FloatingBadge({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 5]} intensity={1.2} color="#C9A84C" />
        <pointLight position={[-3, -2, 3]} intensity={0.5} color="#00BCD4" />
        <Badge />
      </Canvas>
    </div>
  );
}
