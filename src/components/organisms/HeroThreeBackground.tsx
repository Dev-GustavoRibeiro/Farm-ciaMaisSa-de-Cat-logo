'use client';

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// DNA HELIX COMPONENT
// - Positioned diagonally, STATIC in world position
// - Only rotates around its own axis (slow rotation)
// - Uses InstancedMesh for performance
// ============================================================================

interface DNAHelixProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const DNAHelix: React.FC<DNAHelixProps> = ({ 
  position = [0, 0, 0], 
  rotation = [0.4, 0.8, 0.2], // Diagonal tilt
  scale = 1 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const sphereInstancesRef = useRef<THREE.InstancedMesh>(null);
  const rungInstancesRef = useRef<THREE.InstancedMesh>(null);

  // DNA parameters - Extended for full diagonal coverage
  const numPoints = 120;
  const helixRadius = 0.12;
  const helixHeight = 4.5; // Much longer to span corner to corner
  const twists = 4;
  const sphereRadius = 0.025;
  const rungEvery = 4;

  // Pre-calculate helix points and rung positions
  const { strand1Points, strand2Points, rungData } = useMemo(() => {
    const s1: THREE.Vector3[] = [];
    const s2: THREE.Vector3[] = [];
    const rungs: { start: THREE.Vector3; end: THREE.Vector3; midpoint: THREE.Vector3 }[] = [];

    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const y = (t - 0.5) * helixHeight;
      const angle = t * Math.PI * 2 * twists;

      const x1 = Math.cos(angle) * helixRadius;
      const z1 = Math.sin(angle) * helixRadius;
      const x2 = Math.cos(angle + Math.PI) * helixRadius;
      const z2 = Math.sin(angle + Math.PI) * helixRadius;

      s1.push(new THREE.Vector3(x1, y, z1));
      s2.push(new THREE.Vector3(x2, y, z2));

      // Add rungs at intervals
      if (i % rungEvery === 0 && i > 0 && i < numPoints - 1) {
        const start = new THREE.Vector3(x1, y, z1);
        const end = new THREE.Vector3(x2, y, z2);
        const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        rungs.push({ start, end, midpoint });
      }
    }

    return { strand1Points: s1, strand2Points: s2, rungData: rungs };
  }, []);

  // Initialize instanced meshes
  useEffect(() => {
    if (!sphereInstancesRef.current || !rungInstancesRef.current) return;

    const sphereMesh = sphereInstancesRef.current;
    const rungMesh = rungInstancesRef.current;
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3(1, 1, 1);

    // Set sphere instances (both strands)
    const allPoints = [...strand1Points, ...strand2Points];
    allPoints.forEach((point, i) => {
      tempPosition.copy(point);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      sphereMesh.setMatrixAt(i, tempMatrix);
      
      // Color: strand1 = dark chrome, strand2 = slightly lighter
      const color = i < strand1Points.length 
        ? new THREE.Color(0x2a2a2a) 
        : new THREE.Color(0x3a3a3a);
      sphereMesh.setColorAt(i, color);
    });
    sphereMesh.instanceMatrix.needsUpdate = true;
    if (sphereMesh.instanceColor) sphereMesh.instanceColor.needsUpdate = true;

    // Set rung instances
    const rungQuaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    
    rungData.forEach((rung, i) => {
      const direction = new THREE.Vector3().subVectors(rung.end, rung.start);
      const length = direction.length();
      
      tempPosition.copy(rung.midpoint);
      direction.normalize();
      rungQuaternion.setFromUnitVectors(up, direction);
      tempScale.set(0.012, length, 0.012);
      
      tempMatrix.compose(tempPosition, rungQuaternion, tempScale);
      rungMesh.setMatrixAt(i, tempMatrix);
      rungMesh.setColorAt(i, new THREE.Color(0x444444));
    });
    rungMesh.instanceMatrix.needsUpdate = true;
    if (rungMesh.instanceColor) rungMesh.instanceColor.needsUpdate = true;
  }, [strand1Points, strand2Points, rungData]);

  // Animation: ONLY self-rotation around own axis (position stays fixed)
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Slow rotation around Y axis (local axis due to group hierarchy)
    groupRef.current.rotation.y = rotation[1] + time * 0.1;
  });

  const totalSpheres = strand1Points.length + strand2Points.length;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={groupRef}>
        {/* Sphere instances for DNA strands */}
        <instancedMesh
          ref={sphereInstancesRef}
          args={[undefined, undefined, totalSpheres]}
          frustumCulled={false}
        >
          <sphereGeometry args={[sphereRadius, 12, 8]} />
          <meshStandardMaterial
            roughness={0.2}
            metalness={0.9}
            envMapIntensity={2}
          />
        </instancedMesh>

        {/* Cylinder instances for rungs */}
        <instancedMesh
          ref={rungInstancesRef}
          args={[undefined, undefined, rungData.length]}
          frustumCulled={false}
        >
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial
            roughness={0.25}
            metalness={0.85}
            envMapIntensity={1.5}
          />
        </instancedMesh>
      </group>
    </group>
  );
};

// ============================================================================
// PILL/CAPSULE COMPONENT
// - Two-tone: black + light (white/silver)
// - Metallic ring at seam
// - Black half can tilt LEFT or RIGHT based on props
// ============================================================================

interface PillCapsuleProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  blackSideTilt: 'left' | 'right'; // Controls which way black half faces
}

const PillCapsule: React.FC<PillCapsuleProps> = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  blackSideTilt = 'right'
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const initialRotation = useRef(rotation);

  // Capsule dimensions
  const capsuleRadius = 0.16;
  const capsuleLength = 0.45;
  const ringThickness = 0.01;

  // Animation: gentle bobbing + slow rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Gentle floating motion (subtle)
    const bobOffset = Math.sin(time * 0.6 + (blackSideTilt === 'left' ? Math.PI : 0)) * 0.02;
    groupRef.current.position.y = position[1] + bobOffset;
    
    // Very slow rotation
    groupRef.current.rotation.y = initialRotation.current[1] + time * 0.05;
  });

  // Determine rotation to tilt black side left or right
  const tiltAngle = blackSideTilt === 'left' ? -0.4 : 0.4;

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={[rotation[0], rotation[1], rotation[2] + tiltAngle]} 
      scale={scale}
    >
      {/* Top half - BLACK (dark chrome) */}
      <mesh position={[0, capsuleLength / 4, 0]}>
        <capsuleGeometry args={[capsuleRadius, capsuleLength / 2, 32, 64]} />
        <meshPhysicalMaterial
          color={0x0a0a0a}
          metalness={0.95}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2.5}
          reflectivity={1}
        />
      </mesh>

      {/* Bottom half - LIGHT (white/silver glass-like) */}
      <mesh position={[0, -capsuleLength / 4, 0]}>
        <capsuleGeometry args={[capsuleRadius * 0.99, capsuleLength / 2, 32, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.4}
          chromaticAberration={0.2}
          anisotropy={0.2}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.05}
          iridescence={0.8}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[100, 400]}
          color={0xffffff}
          transmission={0.92}
          roughness={0.05}
          ior={1.45}
        />
      </mesh>

      {/* Inner glow effect */}
      <mesh position={[0, -capsuleLength / 6, 0]}>
        <capsuleGeometry args={[capsuleRadius * 0.65, capsuleLength / 3.5, 12, 24]} />
        <meshBasicMaterial
          color={0xffeeff}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Metallic ring at the seam */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[capsuleRadius + 0.003, ringThickness, 12, 48]} />
        <meshStandardMaterial
          color={0x999999}
          metalness={0.95}
          roughness={0.1}
          envMapIntensity={2}
        />
      </mesh>

      {/* Specular highlight on dark half */}
      <mesh position={[capsuleRadius * 0.35, capsuleLength / 3.5, capsuleRadius * 0.35]}>
        <sphereGeometry args={[capsuleRadius * 0.12, 12, 12]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
};

// ============================================================================
// RESPONSIVE DNA WRAPPER
// Calculates scale based on viewport to fill the diagonal
// ============================================================================

const ResponsiveDNA: React.FC = () => {
  const { viewport } = useThree();
  
  // Calculate the diagonal length of the viewport
  // and scale DNA to fill it from corner to corner
  const { dnaScale, dnaPosition, pillAPosition, pillBPosition, pillScale } = useMemo(() => {
    const { width, height } = viewport;
    
    // Calculate diagonal of the viewport
    const diagonal = Math.sqrt(width * width + height * height);
    
    // Base DNA height is 4.5 units, we want it to span the diagonal
    // Add some extra to ensure it goes beyond edges
    const baseHeight = 4.5;
    const scale = (diagonal / baseHeight) * 1.15; // 15% extra to ensure full coverage
    
    // Calculate the angle of the diagonal (for positioning)
    const angle = Math.atan2(height, width);
    
    // Position pills relative to viewport size
    const pillAPos: [number, number, number] = [
      -width * 0.25,
      height * 0.2,
      -0.5
    ];
    
    const pillBPos: [number, number, number] = [
      width * 0.2,
      -height * 0.25,
      0.5
    ];
    
    // Scale pills based on viewport
    const pScale = Math.min(width, height) * 0.4;
    
    return {
      dnaScale: scale,
      dnaPosition: [0, 0, -0.3] as [number, number, number],
      pillAPosition: pillAPos,
      pillBPosition: pillBPos,
      pillScale: Math.max(0.7, Math.min(1.2, pScale)),
    };
  }, [viewport]);

  // Calculate rotation angle to match viewport diagonal
  const diagonalRotation = useMemo(() => {
    const { width, height } = viewport;
    // Angle from horizontal to diagonal (top-left to bottom-right)
    const angle = Math.atan2(height, width);
    // We need to rotate the DNA (which is vertical by default) to lie along the diagonal
    // The DNA's long axis is Y, so we rotate around Z to tilt it
    return Math.PI / 2 - angle; // Convert to rotation needed
  }, [viewport]);

  return (
    <>
      {/* ============================================ */}
      {/* PILL A - BEHIND the DNA (black side LEFT)   */}
      {/* Upper left area, behind DNA                 */}
      {/* ============================================ */}
      <PillCapsule 
        position={pillAPosition}
        rotation={[-0.2, 0.5, 0.1]} 
        scale={pillScale * 0.85}
        blackSideTilt="left"
      />

      {/* ============================================ */}
      {/* DNA HELIX - FULL DIAGONAL (RESPONSIVE)      */}
      {/* From TOP-LEFT corner to BOTTOM-RIGHT corner */}
      {/* Scales automatically to fill viewport       */}
      {/* ============================================ */}
      <DNAHelix 
        position={dnaPosition} 
        rotation={[-0.1, 0, diagonalRotation]}
        scale={dnaScale} 
      />

      {/* ============================================ */}
      {/* PILL B - IN FRONT of DNA (black side RIGHT) */}
      {/* Lower right area, in front of DNA           */}
      {/* ============================================ */}
      <PillCapsule 
        position={pillBPosition}
        rotation={[0.25, -0.4, -0.1]} 
        scale={pillScale}
        blackSideTilt="right"
      />
    </>
  );
};

// ============================================================================
// SCENE CONTENT
// - 1 DNA (diagonal, rotates in place, RESPONSIVE)
// - 2 Pills (one behind DNA, one in front)
// ============================================================================

const SceneContent: React.FC = () => {
  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.35} />
      
      {/* Main key light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color={0xffffff}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-4, 2, -4]}
        intensity={0.4}
        color={0xccddff}
      />
      
      {/* Rim/back light */}
      <pointLight
        position={[0, 4, -6]}
        intensity={0.8}
        color={0xffffff}
      />
      
      {/* Accent light */}
      <pointLight
        position={[-3, -1, 3]}
        intensity={0.5}
        color={0xffeedd}
      />

      {/* Environment for reflections */}
      <Environment preset="studio" />

      {/* Responsive DNA + Pills */}
      <ResponsiveDNA />
    </>
  );
};

// ============================================================================
// MAIN COMPONENT - Canvas with performance optimizations
// ============================================================================

export const HeroThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabActive, setIsTabActive] = useState(true);

  // Determine if we should render
  const shouldRender = isVisible && isTabActive;

  // IntersectionObserver for viewport visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Tab visibility handler
  const handleVisibilityChange = useCallback(() => {
    setIsTabActive(!document.hidden);
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0"
      style={{ pointerEvents: 'none' }}
    >
      <Canvas
        frameloop={shouldRender ? 'always' : 'never'}
        dpr={[1, 1.5]}
        camera={{
          position: [0, 0, 3.5],
          fov: 50, // Wider FOV to capture full diagonal DNA
          near: 0.1,
          far: 100,
        }}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default HeroThreeBackground;
