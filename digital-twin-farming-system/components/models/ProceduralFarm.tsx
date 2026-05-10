"use client";

import React, { useMemo, useState, useRef } from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DigitalTwinState, SelectedComponent } from "@/lib/types";

type Vector3 = [number, number, number];

interface PlantSproutProps {
  position: Vector3;
  rotation: Vector3;
  scale: number;
}

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

interface RackComponentProps {
  rackId: string;
  positionZ: number; // For parallel aisles
  zonesData: Record<string, DigitalTwinState>;
  onSelectPart: (part: SelectedComponent | null) => void;
  plants: React.ReactNode;
  hoveredPart: string | null;
  setHoveredPart: (part: string | null) => void;
}

// --- EXTRACTED RACK COMPONENT ---
function RackComponent({
  rackId,
  positionZ,
  zonesData,
  onSelectPart,
  plants,
  hoveredPart,
  setHoveredPart,
}: RackComponentProps) {
  const fanBladesRef = useRef<THREE.Group>(null);

  const rackData = zonesData[`rack_${rackId}`] || zonesData["overall"];
  const fanStatus = rackData?.deviceState.fanStatus || "off";
  const pumpStatus = rackData?.deviceState.pumpStatus || "normal";

  useFrame(() => {
    if (
      (fanStatus === "on" || fanStatus === "normal") &&
      fanBladesRef.current
    ) {
      fanBladesRef.current.rotation.z += 0.3;
    }
  });

  const renderTier = (tierNumber: number, yPosition: number, zone: string) => {
    const zoneLedStatus =
      zonesData[`led_${rackId}_${zone}`]?.deviceState.ledStatus || "off";
    const isLedOn = zoneLedStatus === "on" || zoneLedStatus === "normal";
    const isLedWarning = zoneLedStatus === "warning";

    const rackPartId = `rack_${rackId}`;
    const ledPartId = `led_${rackId}_${zone}`;
    const plantsPartId = `plants_${rackId}_${zone}`;

    return (
      <group position={[0, yPosition, 0]} key={`tier-${tierNumber}`}>
        {/* RACK FRAME */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart({ type: "rack", name: rackPartId });
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(rackPartId);
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
              emissiveIntensity={hoveredPart === rackPartId ? 0.2 : 0}
            />
          </Box>
        </group>

        {/* LED LIGHTS */}
        <group
          position={[0, 1.1, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart({ type: "led", name: ledPartId });
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(ledPartId);
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
              emissiveIntensity={hoveredPart === ledPartId ? 0.25 : 0}
            />
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

        {/* PLANT TRAYS */}
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectPart({ type: "plant", name: plantsPartId });
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredPart(plantsPartId);
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
              emissiveIntensity={hoveredPart === plantsPartId ? 0.15 : 0}
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

  const reservoirId = `reservoir_${rackId}`;
  const pumpId = `pump_${rackId}`;
  const fanId = `fan_${rackId}`;

  return (
    <group position={[0, 0, positionZ]}>
      {/* 4 Main Vertical Support Beams */}
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

      {/* RACK-SPECIFIC HARDWARE */}

      {/* RESERVOIR */}
      <group
        position={[0, 0.3, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart({ type: "reservoir", name: reservoirId });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPart(reservoirId);
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
            emissiveIntensity={hoveredPart === reservoirId ? 0.2 : 0}
          />
        </Box>
        <Box args={[2.7, 0.4, 1.1]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#3182ce" roughness={0.1} />
        </Box>
      </group>

      {/* NUTRIENT PUMP */}
      <group
        position={[1.6, 0.3, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart({ type: "pump", name: pumpId });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPart(pumpId);
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
            emissiveIntensity={hoveredPart === pumpId ? 0.25 : 0}
          />
        </Cylinder>
        <Sphere args={[0.05]} position={[0.25, 0.15, 0]}>
          <meshStandardMaterial
            color={
              pumpStatus === "critical"
                ? "#e53e3e"
                : pumpStatus === "warning"
                  ? "#eab308"
                  : "#48bb78"
            }
            emissive={
              pumpStatus === "critical"
                ? "#e53e3e"
                : pumpStatus === "warning"
                  ? "#eab308"
                  : "#48bb78"
            }
            emissiveIntensity={pumpStatus === "off" ? 0 : 1}
          />
        </Sphere>
      </group>

      {/* HVAC FAN */}
      <group
        position={[-1.7, 3.8, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectPart({ type: "fan", name: fanId });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPart(fanId);
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
            emissiveIntensity={hoveredPart === fanId ? 0.25 : 0}
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

// --- NEW: MOBILE ROBOTIC UNIT ---
function RoboticMaintenanceUnit({
  hoveredPart,
  setHoveredPart,
}: {
  hoveredPart: string | null;
  setHoveredPart: (part: string | null) => void;
}) {
  const robotId = "robot_main";
  const isHovered = hoveredPart === robotId;

  return (
    <group
      position={[-2.8, 0.5, 0.4]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredPart(robotId);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHoveredPart(null);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Chassis */}
      <Box args={[0.6, 0.3, 0.5]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#1a202c"
          metalness={0.9}
          roughness={0.1}
          emissive="#ffffff"
          emissiveIntensity={isHovered ? 0.2 : 0}
        />
      </Box>
      <Box args={[0.5, 0.1, 0.4]} position={[0, 0.2, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.5} />
      </Box>

      {/* 4 Wheels */}
      {[
        [-0.25, -0.15, 0.25],
        [0.25, -0.15, 0.25],
        [-0.25, -0.15, -0.25],
        [0.25, -0.15, -0.25],
      ].map((pos, i) => (
        <Cylinder
          key={i}
          args={[0.1, 0.1, 0.1, 16]}
          position={pos as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0] as [number, number, number]}
          castShadow
        >
          <meshStandardMaterial color="#111111" roughness={1} />
        </Cylinder>
      ))}

      {/* Articulated Arm */}
      <group position={[0.2, 0.25, 0]}>
        <Cylinder
          args={[0.04, 0.04, 0.4]}
          rotation={[0, 0, Math.PI / 3]}
          position={[0.1, 0.1, 0]}
          castShadow
        >
          <meshStandardMaterial color="#cbd5e0" metalness={1} />
        </Cylinder>
        <Cylinder
          args={[0.04, 0.04, 0.3]}
          rotation={[0, 0, -Math.PI / 6]}
          position={[0.3, 0.25, 0]}
          castShadow
        >
          <meshStandardMaterial color="#cbd5e0" metalness={1} />
        </Cylinder>
        <Sphere args={[0.06]} position={[0.4, 0.35, 0]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </Sphere>
      </group>

      {/* Sensor Pod */}
      <Cylinder
        args={[0.1, 0.1, 0.1, 16]}
        position={[-0.1, 0.35, 0.15]}
        castShadow
      >
        <meshStandardMaterial color="#2d3748" />
      </Cylinder>
      <Sphere args={[0.04]} position={[-0.1, 0.35, 0.22]}>
        <meshStandardMaterial
          color="#63b3ed"
          emissive="#63b3ed"
          emissiveIntensity={0.8}
        />
      </Sphere>

      {/* Label above */}
      {isHovered && (
        <group position={[0, 1.2, 0]}>
          <mesh>
            <boxGeometry args={[0.4, 0.1, 0.02]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function ProceduralFarm({
  onSelectPart,
  zonesData,
}: {
  onSelectPart: (part: SelectedComponent | null) => void;
  zonesData: Record<string, DigitalTwinState>;
}) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

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

  return (
    <group position={[0, -1.8, 0]}>
      {/* 👇 3D FARM FLOOR (Blending with background grass plane) 👇 */}
      <mesh
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#166534" roughness={1} />
      </mesh>

      {/* RENDER ALL 3 RACKS IN PARALLEL AISLES */}
      <RackComponent
        rackId="north"
        positionZ={-3.5}
        zonesData={zonesData}
        onSelectPart={onSelectPart}
        plants={plants}
        hoveredPart={hoveredPart}
        setHoveredPart={setHoveredPart}
      />

      <RackComponent
        rackId="main"
        positionZ={0}
        zonesData={zonesData}
        onSelectPart={onSelectPart}
        plants={plants}
        hoveredPart={hoveredPart}
        setHoveredPart={setHoveredPart}
      />

      <RackComponent
        rackId="south"
        positionZ={3.5}
        zonesData={zonesData}
        onSelectPart={onSelectPart}
        plants={plants}
        hoveredPart={hoveredPart}
        setHoveredPart={setHoveredPart}
      />

      {/* --- NEW: MOBILE MAINTENTANCE UNIT --- */}
      <RoboticMaintenanceUnit
        hoveredPart={hoveredPart}
        setHoveredPart={setHoveredPart}
      />
    </group>
  );
}
