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
} from "@react-three/drei";
import * as THREE from "three";
import { ProceduralFarm } from "./ProceduralFarm";
import { DigitalTwinState, SelectedComponent } from "@/lib/types"; // IMPORT TYPE

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
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
    >
      <WebGLCleanup />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Bounds fit clip observe margin={1.2}>
        <SelectToZoom onReset={() => onSelectPart(null)}>
          <ProceduralFarm onSelectPart={onSelectPart} zonesData={zonesData} />
        </SelectToZoom>
      </Bounds>

      <Environment preset="warehouse" />
      <ContactShadows
        position={[0, -2.0, 0]}
        opacity={0.6}
        scale={15}
        blur={2.5}
      />
      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.6}
        minDistance={3}
        maxDistance={15}
        enableDamping
      />
    </Canvas>
  );
}
