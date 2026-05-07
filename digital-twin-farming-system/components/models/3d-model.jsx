"use client"

import React, { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'

export function Model({ onSelectPart, ...props }) {
  // 1. Ensure the path points to your public/models/ folder
  const { nodes, materials } = useGLTF('/models/3d-model-transformed.glb')
  
  // 2. Track hover state for the whole model
  const [hovered, setHovered] = useState(false)

  // 3. WebGL Crash Recovery (Still good practice to keep)
  useEffect(() => {
    const handleContextLoss = (e) => {
      e.preventDefault()
      console.warn('WebGL context lost, attempting recovery...')
    }
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLoss, false)
      return () => canvas.removeEventListener('webglcontextlost', handleContextLoss)
    }
  }, [])

  return (
    <group {...props} dispose={null}>
      {/* 4. The Single Merged Mesh */}
      {nodes.Object_2 && (
        <mesh 
          geometry={nodes.Object_2.geometry} 
          rotation={[-Math.PI / 2, 0, 0]} 
          scale={0.006} // This model was huge, 0.006 shrinks it to fit the screen
          castShadow
          receiveShadow
          
          onClick={(e) => {
            e.stopPropagation()
            // Triggers the "rack" data panel to open
            onSelectPart("rack") 
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setHovered(false)
            document.body.style.cursor = 'auto'
          }}
        >
          {/* We spread the material but add the glow effect when hovered */}
          <meshStandardMaterial 
            {...materials['Scene_-_Root']} 
            emissive={hovered ? "#ffffff" : "#000000"}
            emissiveIntensity={hovered ? 0.25 : 0}
          />
        </mesh>
      )}
    </group>
  )
}

useGLTF.preload('/models/3d-model-transformed.glb')