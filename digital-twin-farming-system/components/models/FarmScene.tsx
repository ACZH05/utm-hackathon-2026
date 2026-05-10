// components/models/FarmScene.tsx
"use client";

import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Bounds,
  useBounds,
  Sky, // <-- Imported Sky
} from "@react-three/drei";
import * as THREE from "three";
import { ProceduralFarm } from "./ProceduralFarm";
import { DigitalTwinState, SelectedComponent } from "@/lib/types";

function WebGLCleanup() {
  const { gl } = useThree();
  useEffect(() => {
    return () => {
      setTimeout(() => {
        gl.dispose();
      }, 0);
    };
  }, [gl]);
  return null;
}

function SelectToZoom({
  children,
  onReset,
}: {
  children: React.ReactNode;
  onReset: () => void;
}) {
  const api = useBounds();
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        api.refresh(e.object).fit();
      }}
      onPointerMissed={(e) => {
        if (e.button === 0) {
          api.refresh().fit();
          onReset();
        }
      }}
    >
      {children}
    </group>
  );
}

export default function FarmScene({
  onSelectPart,
  zonesData,
}: {
  // STRICT TYPE CHECKING HERE
  onSelectPart: (part: SelectedComponent | null) => void;
  zonesData: Record<string, DigitalTwinState>;
}) {
  return (
    <Canvas
      camera={{ position: [6, 5, 7], fov: 45 }}
      shadows
      // Removed alpha: true so the background renders solidly
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
    >
      <WebGLCleanup />

      {/* --- OUTDOOR FARM ENVIRONMENT --- */}
      {/* 1. Dynamic Outdoor Sky */}
      <Sky sunPosition={[10, 20, 5]} turbidity={0.3} rayleigh={0.5} />

      {/* 2. Atmospheric Fog (Blends the harsh horizon line into the sky) */}
      <fog attach="fog" args={["#e0f2fe", 15, 35]} />

      {/* 3. Infinite Grassy Floor */}
      <mesh
        position={[0, -2.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#166534" roughness={1} />
      </mesh>
      {/* -------------------------------- */}

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Bounds fit clip observe margin={1.2}>
        <SelectToZoom onReset={() => onSelectPart(null)}>
          <ProceduralFarm onSelectPart={onSelectPart} zonesData={zonesData} />
        </SelectToZoom>
      </Bounds>

      {/* Keeps the realistic lighting reflections on the metal framing */}
      <Environment preset="warehouse" />

      <ContactShadows
        position={[0, -2.0, 0]}
        opacity={0.8}
        scale={25}
        blur={1.5}
        color="#000000"
      />

      {/* maxPolarAngle restricted to Math.PI / 2.1 to keep the camera above ground */}
      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3}
        maxDistance={25}
        enableDamping
      />
    </Canvas>
  );
}
