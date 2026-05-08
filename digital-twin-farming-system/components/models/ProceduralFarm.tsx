"use client";

import React, { useMemo, useState, useRef } from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DigitalTwinState, SelectedComponent } from "@/lib/types"; // IMPORT TYPE

const PlantSprout = ({ position, rotation, scale }: any) => (
  <group position={position} rotation={rotation} scale={scale}>
    <Cylinder args={[0.015, 0.02, 0.2]} position={[0, 0.1, 0]}>
      <meshStandardMaterial color="#68d391" roughness={0.8} />
    </Cylinder>
    <Sphere
      args={[0.08, 16, 16]}
      position={[-0.05, 0.15, 0]}
      rotation={[0, 0, Math.PI / 4]}
      scale={[1, 0.2, 0.6]}
    >
      <meshStandardMaterial color="#38a169" roughness={0.7} />
    </Sphere>
    <Sphere
      args={[0.08, 16, 16]}
      position={[0.05, 0.15, 0]}
      rotation={[0, 0, -Math.PI / 4]}
      scale={[1, 0.2, 0.6]}
    >
      <meshStandardMaterial color="#38a169" roughness={0.7} />
    </Sphere>
  </group>
);

export function ProceduralFarm({
  onSelectPart,
  zonesData,
}: {
  onSelectPart: (part: SelectedComponent | null) => void;
  zonesData: Record<string, DigitalTwinState>;
}) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const fanBladesRef = useRef<THREE.Group>(null);

  const globalFanState = zonesData["overall"]?.deviceState.fanStatus || "off";
  const globalPumpState =
    zonesData["overall"]?.deviceState.pumpStatus || "normal";

  useFrame(() => {
    if (
      (globalFanState === "on" || globalFanState === "normal") &&
      fanBladesRef.current
    ) {
      fanBladesRef.current.rotation.z += 0.3;
    }
  });

  const plants = useMemo(() => {
    const grid = [];
    for (let x = -1.2; x <= 1.2; x += 0.3) {
      for (let z = -0.4; z <= 0.4; z += 0.3) {
        const randomScale = 0.6 + Math.abs(Math.sin(x * z * 100)) * 0.4;
        const randomRotY = Math.abs(Math.cos(x + z)) * Math.PI * 2;
        grid.push(
          <PlantSprout
            key={`p-${x}-${z}`}
            position={[x, 0.08, z]}
            rotation={[0, randomRotY, 0]}
            scale={randomScale}
          />,
        );
      }
    }
    return grid;
  }, []);

  const renderTier = (tierNumber: number, yPosition: number, zone: string) => {
    const zoneLedStatus =
      zonesData[`led_${zone}`]?.deviceState.ledStatus || "off";
    const isLedOn = zoneLedStatus === "on" || zoneLedStatus === "normal";
    const isLedWarning = zoneLedStatus === "warning";

    return (
      <group position={[0, yPosition, 0]} key={`tier-${tierNumber}`}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart(null);
          }}
        >
          <Box
            args={[3.2, 0.05, 1.4]}
            position={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#4a5568"
              metalness={0.7}
              roughness={0.3}
            />
          </Box>
        </group>

        {/* LED LIGHTS -> Returns { type: "led", name: "led_A" } */}
        <group
          position={[0, 1.1, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart({ type: "led", name: `led_${zone}` });
          }}
        >
          <Box args={[2.9, 0.05, 0.3]} castShadow>
            <meshStandardMaterial color="#e2e8f0" />
          </Box>
          <Box args={[2.8, 0.06, 0.2]}>
            <meshStandardMaterial
              color={isLedWarning ? "#fef08a" : "#fffff0"}
              emissive={isLedWarning ? "#eab308" : "#fffff0"}
              emissiveIntensity={isLedOn ? 1.5 : isLedWarning ? 0.8 : 0}
              toneMapped={false}
            />
          </Box>
          {(isLedOn || isLedWarning) && (
            <rectAreaLight
              width={2.8}
              height={0.2}
              color={isLedWarning ? "#eab308" : "#fffff0"}
              intensity={isLedWarning ? 1 : 3}
              position={[0, -0.05, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          )}
        </group>

        {/* PLANT TRAYS -> Returns { type: "plant", name: "plants_A" } */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart({ type: "plant", name: `plants_${zone}` });
          }}
        >
          <Box
            args={[2.9, 0.15, 1.2]}
            position={[0, 0.075, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#1a202c" roughness={0.9} />
          </Box>
          <Box args={[2.8, 0.16, 1.1]} position={[0, 0.08, 0]} receiveShadow>
            <meshStandardMaterial color="#3e2723" roughness={1} />
          </Box>
          {plants}
        </group>
      </group>
    );
  };

  return (
    <group position={[0, -1.8, 0]}>
      <Cylinder
        args={[0.05, 0.05, 5]}
        position={[-1.5, 2.5, -0.6]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#cbd5e0" metalness={0.8} />
      </Cylinder>
      <Cylinder
        args={[0.05, 0.05, 5]}
        position={[1.5, 2.5, -0.6]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#cbd5e0" metalness={0.8} />
      </Cylinder>
      <Cylinder
        args={[0.05, 0.05, 5]}
        position={[-1.5, 2.5, 0.6]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#cbd5e0" metalness={0.8} />
      </Cylinder>
      <Cylinder
        args={[0.05, 0.05, 5]}
        position={[1.5, 2.5, 0.6]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#cbd5e0" metalness={0.8} />
      </Cylinder>

      {renderTier(3, 3.6, "A")}
      {renderTier(2, 2.4, "B")}
      {renderTier(1, 1.2, "C")}

      {/* RESERVOIR */}
      <group
        position={[0, 0.3, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart({ type: "reservoir", name: "reservoir" });
        }}
      >
        <Box args={[2.8, 0.6, 1.2]} receiveShadow castShadow>
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.2}
            transparent
            opacity={0.8}
          />
        </Box>
        <Box args={[2.7, 0.4, 1.1]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#3182ce" roughness={0.1} />
        </Box>
      </group>

      {/* PUMP */}
      <group
        position={[1.6, 0.3, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart({ type: "pump", name: "pump" });
        }}
      >
        <Cylinder
          args={[0.2, 0.2, 0.5]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <meshStandardMaterial color="#2d3748" metalness={0.8} />
        </Cylinder>
        <Sphere args={[0.05]} position={[0.25, 0.15, 0]}>
          <meshStandardMaterial
            color={
              globalPumpState === "critical"
                ? "#e53e3e"
                : globalPumpState === "warning"
                  ? "#eab308"
                  : "#48bb78"
            }
            emissive={
              globalPumpState === "critical"
                ? "#e53e3e"
                : globalPumpState === "warning"
                  ? "#eab308"
                  : "#48bb78"
            }
            emissiveIntensity={globalPumpState === "off" ? 0 : 1}
          />
        </Sphere>
      </group>

      {/* FAN */}
      <group
        position={[-1.7, 3.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart({ type: "fan", name: "fan" });
        }}
      >
        <Box args={[0.2, 0.6, 0.6]} castShadow>
          <meshStandardMaterial color="#a0aec0" metalness={0.5} />
        </Box>
        <group
          ref={fanBladesRef}
          position={[0.11, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <Box args={[0.02, 0.5, 0.1]}>
            <meshStandardMaterial color="#1a202c" />
          </Box>
          <Box args={[0.02, 0.1, 0.5]}>
            <meshStandardMaterial color="#1a202c" />
          </Box>
        </group>
      </group>
    </group>
  );
}
