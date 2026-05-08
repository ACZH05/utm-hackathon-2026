"use client";

import React, { useMemo, useState, useRef } from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

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
  fanStatus = "",
  pumpStatus = "",
}: {
  onSelectPart: (part: string) => void;
  zonesData: Record<string, any>;
  fanStatus?: string;
  pumpStatus?: string;
}) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const fanBladesRef = useRef<THREE.Group>(null);

  const isFanOn = fanStatus.includes("ON") || fanStatus.includes("AUTO");
  const isPumpError = pumpStatus.includes("ERROR");

  useFrame(() => {
    if (isFanOn && fanBladesRef.current) {
      const speed = fanStatus.includes("High") ? 0.4 : 0.15;
      fanBladesRef.current.rotation.z += speed;
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
    const isHoveredRack = hoveredPart === `rack`;
    const isHoveredPlants = hoveredPart === `plants_${zone}`;
    const isHoveredLED = hoveredPart === `led_${zone}`;

    // 👇 THIS IS THE MAGIC: Look up the exact LED state for THIS SPECIFIC ZONE 👇
    const zoneLedStatus = zonesData[`led_${zone}`]?.led || "OFF";
    const isLedOn = zoneLedStatus.includes("ON");

    return (
      <group position={[0, yPosition, 0]} key={`tier-${tierNumber}`}>
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart("rack");
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(`rack`);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredPart(null);
            document.body.style.cursor = "auto";
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
              emissive="#ffffff"
              emissiveIntensity={isHoveredRack ? 0.2 : 0}
            />
          </Box>
        </group>

        {/* LED LIGHTS */}
        <group
          position={[0, 1.1, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart(`led_${zone}`);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(`led_${zone}`);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredPart(null);
            document.body.style.cursor = "auto";
          }}
        >
          <Box args={[2.9, 0.05, 0.3]} castShadow>
            <meshStandardMaterial color="#e2e8f0" />
          </Box>
          <Box args={[2.8, 0.06, 0.2]}>
            <meshStandardMaterial
              color="#fffff0"
              emissive="#fffff0"
              emissiveIntensity={isLedOn ? (isHoveredLED ? 2 : 1.5) : 0}
              toneMapped={false}
            />
          </Box>
          {isLedOn && (
            <rectAreaLight
              width={2.8}
              height={0.2}
              color="#fffff0"
              intensity={3}
              position={[0, -0.05, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          )}
        </group>

        {/* PLANT TRAYS */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart(`plants_${zone}`);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(`plants_${zone}`);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredPart(null);
            document.body.style.cursor = "auto";
          }}
        >
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
          onSelectPart("reservoir");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPart("reservoir");
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredPart(null);
          document.body.style.cursor = "auto";
        }}
      >
        <Box args={[2.8, 0.6, 1.2]} receiveShadow castShadow>
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.2}
            transparent
            opacity={0.8}
            emissive="#ffffff"
            emissiveIntensity={hoveredPart === "reservoir" ? 0.2 : 0}
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
          onSelectPart("pump");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPart("pump");
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredPart(null);
          document.body.style.cursor = "auto";
        }}
      >
        <Cylinder
          args={[0.2, 0.2, 0.5]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <meshStandardMaterial
            color="#2d3748"
            metalness={0.8}
            emissive="#ffffff"
            emissiveIntensity={hoveredPart === "pump" ? 0.2 : 0}
          />
        </Cylinder>
        <Sphere args={[0.05]} position={[0.25, 0.15, 0]}>
          <meshStandardMaterial
            color={isPumpError ? "#e53e3e" : "#48bb78"}
            emissive={isPumpError ? "#e53e3e" : "#48bb78"}
            emissiveIntensity={1}
          />
        </Sphere>
      </group>

      {/* FAN */}
      <group
        position={[-1.7, 3.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart("fan");
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPart("fan");
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredPart(null);
          document.body.style.cursor = "auto";
        }}
      >
        <Box args={[0.2, 0.6, 0.6]} castShadow>
          <meshStandardMaterial
            color="#a0aec0"
            metalness={0.5}
            emissive="#ffffff"
            emissiveIntensity={hoveredPart === "fan" ? 0.2 : 0}
          />
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
