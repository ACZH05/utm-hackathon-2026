"use client";

import React, { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Bounds,
  useBounds,
} from "@react-three/drei";
import * as THREE from "three";
import { suppressDeprecationWarnings } from "@/lib/suppress-warnings";
import { ProceduralFarm } from "./ProceduralFarm";

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
}: {
  onSelectPart: (part: string) => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      suppressDeprecationWarnings();
    }
  }, []);

  return (
    <Canvas
      className="w-full h-full"
      style={{ height: "100%", width: "100%" }}
      camera={{ position: [6, 5, 7], fov: 45 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFShadowMap;
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Bounds fit clip observe margin={1.2}>
        <SelectToZoom onReset={() => onSelectPart("overall")}>
          <ProceduralFarm onSelectPart={onSelectPart} />
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
