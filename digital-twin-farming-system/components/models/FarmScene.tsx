"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Bounds,
  useBounds,
} from "@react-three/drei";
import * as THREE from "three";
import { Model } from "@/components/models/3d-model";

/**
 * Helper component to handle the "Click to Zoom" logic and resetting state
 */
function SelectToZoom({ children, onReset }) {
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
          onReset(); // Reset the data panel when clicking the background
        }
      }}
    >
      {children}
    </group>
  );
}

export default function FarmScene({ onSelectPart }) {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 45 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFShadowMap;
        gl.shadowMap.enabled = true;
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />

      <Bounds fit clip observe margin={1.2}>
        <SelectToZoom onReset={() => onSelectPart("overall")}>
          <Model position={[0, -1, 0]} scale={1} onSelectPart={onSelectPart} />
        </SelectToZoom>
      </Bounds>

      <Environment preset="city" intensity={0.5} />
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={15}
        blur={2.5}
      />
      <OrbitControls
        makeDefault
        autoRotate={false}
        minDistance={2}
        maxDistance={20}
        enableDamping
      />
    </Canvas>
  );
}
