import { useThree, useFrame } from '@react-three/fiber'
import { EffectComposer, RenderPass, EffectPass, FXAAEffect, ToneMappingEffect, BloomEffect, HueSaturationEffect } from 'postprocessing'
import { useEffect, useState } from 'react'
import { SSREffect, VelocityDepthNormalPass, MotionBlurEffect } from './realism-effects/v2'
import type { WebGLRenderer, Scene, Camera, Vector2 } from 'three'

interface SSRConfig {
  // Core SSR parameters
  intensity: number         // Reflection intensity
  exponent: number          // Reflection falloff exponent 
  distance: number          // Maximum reflection distance
  fade: number              // Screen-space fade distance
  roughnessFade: number     // Fade based on roughness
  thickness: number         // Thickness of depth testing
  ior: number               // Index of refraction
  maxRoughness: number      // Maximum roughness to apply reflections
  maxDepthDifference: number // Maximum depth difference for reflections
  blend: number             // Blend with previous frame
  correction: number        // Roughness correction
  correctionRadius: number  // Correction sample radius
  blur: number              // Blur amount
  blurKernel: number        // Blur kernel size
  blurSharpness: number     // Blur sharpness
  jitter: number            // Jitter amount
  jitterRoughness: number   // Jitter roughness
  steps: number             // Ray steps
  refineSteps: number       // Refinement steps
  missedRays: boolean       // Fill in rays that miss
  useNormalMap: boolean     // Use normal map for normals
  useRoughnessMap: boolean  // Use roughness from roughness maps
  resolutionScale: number   // Resolution scaling factor
  velocityResolutionScale: number // Velocity resolution scaling
}

interface BloomConfig {
  intensity: number          // Bloom intensity
  luminanceThreshold: number // Luminance threshold
  luminanceSmoothing: number // Luminance smoothing
  mipmapBlur: boolean        // Use mipmap blur
  radius: number             // Bloom radius
}

interface HueSaturationConfig {
  hue: number                // Hue adjustment (-Math.PI to Math.PI)
  saturation: number         // Saturation adjustment (-1 to 1)
}

interface MotionBlurConfig {
  intensity: number         // Blur intensity
  jitter: number            // Jitter amount for sampling
  samples: number           // Number of samples for the blur effect
}

export function SSREffects(): JSX.Element {
  const gl = useThree((state) => state.gl) as WebGLRenderer
  const scene = useThree((state) => state.scene) as Scene
  const camera = useThree((state) => state.camera) as Camera
  const size = useThree((state) => state.size) as Vector2
  const [composer] = useState(() => new EffectComposer(gl, { multisampling: 0 }))

  useEffect(() => composer.setSize(size.width, size.height), [composer, size])
  useEffect(() => {
    // These are optimized settings for screen space reflections
    // You can adjust these values based on your scene requirements
    const ssrConfig: Partial<SSRConfig> = {
      // Main parameters
      intensity: 2.0,
      distance: 40,
      fade: 0.5,
      roughnessFade: 1.0,
      thickness: 4.0,
      ior: 1.5,
      maxRoughness: 0.8,
      maxDepthDifference: 10,
      
      // Temporal sampling/denoising
      blend: 0.95,
      correction: 1,
      correctionRadius: 1,
      blur: 0.5,
      
      // Ray tracing parameters
      steps: 2,
      refineSteps: 5,
      missedRays: true,
      
      // Quality settings
      resolutionScale: 0.5,
      
      // Use material maps
      useNormalMap: true,
      useRoughnessMap: true
    }

    // Bloom effect configuration
    const bloomConfig: BloomConfig = {
      intensity: 0.6,           // Bloom intensity
      luminanceThreshold: 0.9,  // Minimum luminance to apply bloom
      luminanceSmoothing: 0.025, // Smoothing of the luminance threshold
      mipmapBlur: true,         // Use mipmap blur for better performance
      radius: 0.85              // Bloom radius
    }

    // Hue/Saturation effect configuration
    const hueSaturationConfig: HueSaturationConfig = {
      hue: 0.0,                 // No hue shift by default
      saturation: 0.2          // Slight saturation boost
    }

    // Motion blur configuration
    const motionBlurConfig: MotionBlurConfig = {
      intensity: 1.0,           // Blur intensity
      jitter: 0.5,              // Jitter for sampling randomization
      samples: 16               // Number of samples for blur
    }

    const renderPass = new RenderPass(scene, camera)
    const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
    
    composer.addPass(renderPass)
    composer.addPass(velocityDepthNormalPass)
    
    // Add SSR effect
    // Note: SSREffect extends SSGIEffect with specularOnly=true
    const ssrEffect = new SSREffect(composer, scene, camera, velocityDepthNormalPass, ssrConfig)
    
    // Create motion blur effect
    const motionBlurEffect = new MotionBlurEffect(velocityDepthNormalPass, {
      intensity: motionBlurConfig.intensity,
      jitter: motionBlurConfig.jitter,
      samples: motionBlurConfig.samples
    })
    
    // Create bloom effect
    const bloomEffect = new BloomEffect({
      intensity: bloomConfig.intensity,
      luminanceThreshold: bloomConfig.luminanceThreshold,
      luminanceSmoothing: bloomConfig.luminanceSmoothing,
      mipmapBlur: bloomConfig.mipmapBlur,
      radius: bloomConfig.radius
    })
    
    // Create hue/saturation effect
    const hueSaturationEffect = new HueSaturationEffect({
      hue: hueSaturationConfig.hue,
      saturation: hueSaturationConfig.saturation
    })
    
    // Apply SSR effect
    composer.addPass(new EffectPass(camera, ssrEffect))
    
    // Apply motion blur effect (after SSR and before bloom for better results)
    composer.addPass(new EffectPass(camera, motionBlurEffect))
    
    // Apply bloom and hue/saturation effects
    composer.addPass(new EffectPass(camera, bloomEffect))
    composer.addPass(new EffectPass(camera, hueSaturationEffect))
    
    // Add standard post-processing effects last
    composer.addPass(new EffectPass(camera, new FXAAEffect(), new ToneMappingEffect()))

    return () => {
      composer.removeAllPasses()
    }
  }, [composer, camera, scene])

  useFrame((_, delta: number) => {
    gl.autoClear = true
    composer.render(delta)
  }, 1)

  return null
}

// Additional component for SSDGI-only (diffuse global illumination)
export function SSDGIEffects(): JSX.Element {
  const gl = useThree((state) => state.gl) as WebGLRenderer
  const scene = useThree((state) => state.scene) as Scene
  const camera = useThree((state) => state.camera) as Camera
  const size = useThree((state) => state.size) as Vector2
  const [composer] = useState(() => new EffectComposer(gl, { multisampling: 0 }))

  useEffect(() => composer.setSize(size.width, size.height), [composer, size])
  useEffect(() => {
    // These are settings optimized for diffuse global illumination
    const config = {
      // Core parameters
      intensity: 1.0,
      distance: 30,
      thickness: 10.0,
      
      // Denoising
      denoiseIterations: 3,
      denoiseKernel: 2,
      denoiseDiffuse: 10,
      phi: 0.5,
      lumaPhi: 10,
      depthPhi: 2,
      normalPhi: 4,
      
      // Ray tracing quality
      steps: 34,
      refineSteps: 3,
      missedRays: false,
      
      // Resolution
      resolutionScale: 1.0,
      
      // Additional options
      importanceSampling: true,
      envBlur: 0.5
    }

    // Motion blur configuration for SSDGI
    const motionBlurConfig = {
      intensity: 1.8,           // Slightly lower intensity for GI
      jitter: 0.5,              // Jitter for sampling randomization
      samples: 12               // Slightly fewer samples for performance
    }

    const renderPass = new RenderPass(scene, camera)
    const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera)
    
    composer.addPass(renderPass)
    composer.addPass(velocityDepthNormalPass)
    
    // Add SSDGI effect - diffuse global illumination only
    // Note: SSDGIEffect extends SSGIEffect with diffuseOnly=true
    const ssdgiEffect = new SSDGIEffect(composer, scene, camera, velocityDepthNormalPass, config)
    composer.addPass(new EffectPass(camera, ssdgiEffect))
    
    // Create and add motion blur effect
    const motionBlurEffect = new MotionBlurEffect(velocityDepthNormalPass, {
      intensity: motionBlurConfig.intensity,
      jitter: motionBlurConfig.jitter,
      samples: motionBlurConfig.samples
    })
    composer.addPass(new EffectPass(camera, motionBlurEffect))
    
    // Add standard post-processing effects
    composer.addPass(new EffectPass(camera, new FXAAEffect(), new ToneMappingEffect()))

    return () => {
      composer.removeAllPasses()
    }
  }, [composer, camera, scene])

  useFrame((_, delta: number) => {
    gl.autoClear = true
    composer.render(delta)
  }, 1)

  return null
}