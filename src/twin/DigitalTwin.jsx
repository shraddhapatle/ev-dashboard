import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
  Grid,
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import ChargerModel from './ChargerModel'

// Procedural studio environment (no network HDRI fetch) for metal reflections.
function StudioEnv() {
  return (
    <Environment resolution={256} background={false}>
      <Lightformer intensity={3.0} color="#ffffff" position={[-4, 5, 5]} rotation={[Math.PI / 4, 0, 0]} scale={[9, 9, 1]} />
      <Lightformer intensity={1.6} color="#cdeeff" position={[6, 2, -2]} rotation={[0, -Math.PI / 3, 0]} scale={[7, 7, 1]} />
      <Lightformer intensity={1.0} color="#00c2d4" position={[2, 1, 6]} rotation={[0, 0, 0]} scale={[5, 5, 1]} />
      <Lightformer intensity={0.6} color="#1a2628" position={[0, -3, 2]} scale={[10, 4, 1]} />
    </Environment>
  )
}

export default function DigitalTwin({
  explode,
  selectedId,
  hoveredId,
  isolate,
  anomaly = true,
  autoRotate,
  onSelect,
  onHover,
}) {
  return (
    <Canvas
      shadows={false}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [3.3, 1.4, 4.4], fov: 42, near: 0.1, far: 100 }}
      onPointerMissed={() => onSelect(null)}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#dff4ff', '#0a0f12', 0.6]} />
        <directionalLight position={[-5, 8, 6]} intensity={1.5} color="#ffffff" castShadow={false} />
        <directionalLight position={[6, 4, -4]} intensity={0.6} color="#cdeeff" />
        <pointLight position={[3, 2, 5]} intensity={10} color="#00f2ff" distance={18} decay={2} />
        <pointLight position={[-3, 1.5, -3]} intensity={6} color="#0a6a71" distance={16} decay={2} />

        <StudioEnv />

        <ChargerModel
          explode={explode}
          selectedId={selectedId}
          isolate={isolate}
          anomaly={anomaly}
          onSelect={onSelect}
          onHover={onHover}
        />

        {/* tactical floor */}
        <Grid
          position={[0, -0.84, 0]}
          args={[24, 24]}
          cellSize={0.4}
          cellThickness={0.6}
          cellColor="#0c4146"
          sectionSize={2}
          sectionThickness={1.1}
          sectionColor="#00aeb8"
          fadeDistance={16}
          fadeStrength={1.5}
          infiniteGrid
          followCamera={false}
        />
        <ContactShadows position={[0, -0.83, 0]} opacity={0.5} scale={6} blur={2.6} far={3} color="#000000" />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          target={[0, 0.05, 0]}
          minDistance={2.6}
          maxDistance={10}
          maxPolarAngle={Math.PI * 0.52}
          autoRotate={autoRotate}
          autoRotateSpeed={0.6}
        />

        <EffectComposer disableNormalPass>
          <Bloom intensity={0.7} luminanceThreshold={0.5} luminanceSmoothing={0.85} mipmapBlur radius={0.6} />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
