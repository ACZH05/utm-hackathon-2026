"use client";

import React, { useMemo, useState } from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";

interface PlantSproutProps {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number | [number, number, number];
}

// 1. Detailed Procedural Plant Sprout
const PlantSprout = ({ position, rotation, scale }: PlantSproutProps) => (
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
}: {
  onSelectPart: (part: string) => void;
}) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Generate Plants once to save performance
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

  const renderTier = (tierNumber: number, yPosition: number) => {
    const tierName = `tier-${tierNumber}`;
    const isHoveredRack = hoveredPart === `rack-${tierName}`;
    const isHoveredPlants = hoveredPart === `plants-${tierName}`;

    return (
      <group position={[0, yPosition, 0]} key={tierName}>
        {/* === MAIN FRAME (Triggers "rack" panel) === */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart("rack");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(`rack-${tierName}`);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredPart(null);
            document.body.style.cursor = "auto";
          }}
        >
          {/* Metal Frame Shelf */}
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
              emissive="#ffffff"
              emissiveIntensity={isHoveredRack ? 0.2 : 0}
            />
          </Box>

          {/* Temp/Humidity/Light Probe (Hanging from frame) */}
          <group position={[-1.4, 0.8, 0.6]}>
            <Cylinder args={[0.005, 0.005, 0.4]} position={[0, 0.2, 0]}>
              <meshStandardMaterial color="#1a202c" />
            </Cylinder>
            <Box args={[0.08, 0.12, 0.08]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color="#e2e8f0"
                emissive="#ffffff"
                emissiveIntensity={isHoveredRack ? 0.5 : 0}
              />
            </Box>
          </group>

          {/* Daylight LED System - Clickable */}
          <group
            position={[0, 1.1, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPart("led");
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredPart("led");
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredPart(null);
              document.body.style.cursor = "auto";
            }}
          >
            <Box args={[2.9, 0.05, 0.3]} castShadow>
              <meshStandardMaterial
                color="#e2e8f0"
                emissive="#ffffff"
                emissiveIntensity={hoveredPart === "led" ? 0.3 : 0}
              />
            </Box>
            {/* Glowing Natural White LED */}
            <Box args={[2.8, 0.06, 0.2]}>
              <meshStandardMaterial
                color="#fffff0"
                emissive="#fffff0"
                emissiveIntensity={1.5}
                toneMapped={false}
              />
            </Box>
            <rectAreaLight
              width={2.8}
              height={0.2}
              color="#fffff0"
              intensity={3}
              position={[0, -0.05, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          </group>
        </group>

        {/* === PLANT TRAYS (Triggers "plants" panel) === */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart("plants");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(`plants-${tierName}`);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredPart(null);
            document.body.style.cursor = "auto";
          }}
        >
          {/* Plastic Tray */}
          <Box
            args={[2.9, 0.15, 1.2]}
            position={[0, 0.075, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#1a202c"
              roughness={0.9}
              emissive="#ffffff"
              emissiveIntensity={isHoveredPlants ? 0.1 : 0}
            />
          </Box>

          {/* Soil/Coir Layer */}
          <Box args={[2.8, 0.16, 1.1]} position={[0, 0.08, 0]} receiveShadow>
            <meshStandardMaterial color="#3e2723" roughness={1} />
          </Box>

          {/* Insert Procedural Plants */}
          {plants}

          {/* Soil Moisture Probe (Stuck in dirt) */}
          <group position={[1.2, 0.16, 0.4]}>
            <Cylinder args={[0.01, 0.01, 0.2]} position={[0, 0, 0]}>
              <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
            </Cylinder>
            <Box args={[0.05, 0.08, 0.05]} position={[0, 0.1, 0]}>
              <meshStandardMaterial
                color="#48bb78"
                emissive="#48bb78"
                emissiveIntensity={isHoveredPlants ? 1 : 0.2}
              />
            </Box>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group position={[0, -1.8, 0]}>
      {/* 4 Main Vertical Support Beams */}
      <Cylinder
        args={[0.05, 0.05, 4.8]}
        position={[-1.5, 2.4, -0.6]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#cbd5e0" metalness={0.8} />
      </Cylinder>
      <Cylinder
        args={[0.05, 0.05, 4.8]}
        position={[1.5, 2.4, -0.6]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#cbd5e0" metalness={0.8} />
      </Cylinder>
      <Cylinder
        args={[0.05, 0.05, 4.8]}
        position={[-1.5, 2.4, 0.6]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#cbd5e0" metalness={0.8} />
      </Cylinder>
      <Cylinder
        args={[0.05, 0.05, 4.8]}
        position={[1.5, 2.4, 0.6]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#cbd5e0" metalness={0.8} />
      </Cylinder>

      {/* Render the 4 Tiers */}
      {renderTier(4, 0)}
      {renderTier(3, 1.2)}
      {renderTier(2, 2.4)}
      {renderTier(1, 3.6)}
    </group>
  );
}
