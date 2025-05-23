import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useVideoTexture } from '@react-three/drei'

export default function Billboard({ 
  position = [10, 5, 0], 
  rotation = [0, 0, 0], 
  scale = [0.4, 0.46, 1],
  video = '/ad2.mp4',
  muted = true,
  loop = true,
  autoplay = true,
  volume = 1
}) {
  const meshRef = useRef()

  // Using useVideoTexture hook from drei which handles texture creation properly
  const videoTexture = useVideoTexture(video, {
    crossOrigin: 'anonymous',
    loop: loop,
    muted: muted,
    start: autoplay,
    volume: volume
  })

  // Set modern colorspace instead of deprecated encoding
  useEffect(() => {
    if (videoTexture) {
      videoTexture.colorSpace = THREE.SRGBColorSpace
    }
  }, [videoTexture])

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.5, 1.5]} />
      <meshBasicMaterial map={videoTexture} side={THREE.DoubleSide} />
    </mesh>
  )
}