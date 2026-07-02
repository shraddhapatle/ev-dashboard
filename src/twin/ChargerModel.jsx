import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, Edges } from '@react-three/drei'
import { meshParts, STATUS } from '../data/twinModel'
import { makeFrontLivery, makeSideLivery, makePcbTexture } from './livery'

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const C = {
  bodyWhite: '#e9ebed',
  capGrey: '#3a3f42',
  steel: '#b9bdc1',
  steelDark: '#7e848a',
  interior: '#171b1d',
  teal: '#00f2ff',
  red: '#ff3b3b',
  amber: '#f5b544',
  green: '#37d96b',
  blue: '#0f8fcf',
}
const statusColor = (s) => (s === 'critical' ? C.red : s === 'warning' ? C.amber : C.teal)
const hl = (s) => (s === 'critical' ? C.red : s === 'warning' ? C.amber : C.teal)

function Led({ position, color, intensity = 2.4, r = 0.013 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[r, 14, 14]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Front livery door (front_panel_shell)
// ---------------------------------------------------------------------------
function ShellDoor({ dims, highlight, hlColor, ghost }) {
  const [w, h, d] = dims
  const front = useMemo(() => makeFrontLivery(), [])
  const tp = { transparent: ghost, opacity: ghost ? 0.16 : 1 }
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial attach="material-0" color={C.bodyWhite} metalness={0.1} roughness={0.55} {...tp} />
        <meshStandardMaterial attach="material-1" color={C.bodyWhite} metalness={0.1} roughness={0.55} {...tp} />
        <meshStandardMaterial attach="material-2" color={C.bodyWhite} metalness={0.1} roughness={0.55} {...tp} />
        <meshStandardMaterial attach="material-3" color={C.bodyWhite} metalness={0.1} roughness={0.55} {...tp} />
        <meshStandardMaterial attach="material-4" map={front} metalness={0.18} roughness={0.5} transparent={ghost} opacity={ghost ? 0.34 : 1} />
        <meshStandardMaterial attach="material-5" color={C.bodyWhite} metalness={0.1} roughness={0.55} {...tp} />
        {highlight && <Edges scale={1.001} threshold={15} color={hlColor} />}
      </mesh>

      {/* touchscreen glow */}
      <mesh position={[0, h * 0.22, d / 2 + 0.004]}>
        <boxGeometry args={[w * 0.5, h * 0.155, 0.012]} />
        <meshStandardMaterial color="#03171a" emissive={C.teal} emissiveIntensity={0.9} metalness={0.3} roughness={0.2} />
      </mesh>

      {/* status light row */}
      {[C.green, C.amber, C.amber, C.red, C.red].map((col, i) => (
        <Led key={i} position={[-0.16 + i * 0.0415, h * 0.11, d / 2 + 0.006]} color={col} r={0.011} />
      ))}

      {/* emergency stop mushroom */}
      <group position={[-0.24, h * 0.06, d / 2 + 0.006]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.012, 24]} />
          <meshStandardMaterial color="#d8b400" metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.024, 0.026, 0.022, 24]} />
          <meshStandardMaterial color="#c01616" emissive="#c01616" emissiveIntensity={0.3} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// White structural body (cabinet_chassis) — open front + rear
// ---------------------------------------------------------------------------
function CabinetBody({ dims, highlight, hlColor, ghost }) {
  const [w, h, d] = dims
  const side = useMemo(() => makeSideLivery(), [])
  const tp = { transparent: ghost, opacity: ghost ? 0.16 : 1 }
  const sideMat = <meshStandardMaterial map={side} metalness={0.12} roughness={0.55} {...tp} />
  const whiteMat = <meshStandardMaterial color={C.bodyWhite} metalness={0.12} roughness={0.55} {...tp} />
  return (
    <group>
      {/* left & right side panels (livery) */}
      <mesh position={[-w / 2 + 0.01, 0, 0]} castShadow>
        <boxGeometry args={[0.02, h, d]} />
        {sideMat}
      </mesh>
      <mesh position={[w / 2 - 0.01, 0, 0]} castShadow>
        <boxGeometry args={[0.02, h, d]} />
        {sideMat}
      </mesh>
      {/* top + bottom */}
      <mesh position={[0, h / 2 - 0.01, 0]}>
        <boxGeometry args={[w, 0.02, d]} />
        {whiteMat}
      </mesh>
      <mesh position={[0, -h / 2 + 0.01, 0]}>
        <boxGeometry args={[w, 0.02, d]} />
        {whiteMat}
      </mesh>
      {/* dark cap overhang */}
      <mesh position={[0, h / 2 + 0.04, 0]} castShadow>
        <boxGeometry args={[w + 0.06, 0.08, d + 0.06]} />
        <meshStandardMaterial color={C.capGrey} metalness={0.5} roughness={0.5} />
      </mesh>
      {/* interior rear wall + floor */}
      <mesh position={[0, 0, -d / 2 + 0.03]}>
        <boxGeometry args={[w - 0.05, h - 0.05, 0.02]} />
        <meshStandardMaterial color={C.interior} metalness={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[0, -h / 2 + 0.04, 0]}>
        <boxGeometry args={[w - 0.05, 0.02, d - 0.08]} />
        <meshStandardMaterial color={C.interior} metalness={0.4} roughness={0.7} />
      </mesh>
      {highlight && (
        <mesh>
          <boxGeometry args={[w + 0.02, h + 0.02, d + 0.02]} />
          <meshBasicMaterial color={hlColor} wireframe transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Green modular rectifier
// ---------------------------------------------------------------------------
function RectifierModule({ dims, status, anomaly = true, highlight, hlColor, critRef }) {
  const [w, h, d] = dims
  const pcb = useMemo(() => makePcbTexture(), [])
  const eff = anomaly ? status : 'ok'
  const isCrit = eff === 'critical'
  const led = statusColor(eff)
  return (
    <group>
      {/* metal body */}
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={C.steel} metalness={0.85} roughness={0.32} />
        {highlight && <Edges scale={1.001} threshold={15} color={hlColor} />}
      </mesh>
      {/* green PCB front face */}
      <mesh position={[0, 0, d / 2 + 0.006]}>
        <boxGeometry args={[w * 0.9, h * 0.82, 0.012]} />
        <meshStandardMaterial map={pcb} metalness={0.2} roughness={0.6} emissive="#0a4027" emissiveIntensity={0.25} />
      </mesh>
      {/* cooling fins on top */}
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={i} position={[-w / 2 + 0.05 + i * ((w - 0.1) / 12), h / 2 + 0.012, 0]}>
          <boxGeometry args={[0.012, 0.028, d * 0.8]} />
          <meshStandardMaterial color={C.steelDark} metalness={0.85} roughness={0.4} />
        </mesh>
      ))}
      {/* handle */}
      <mesh position={[w * 0.36, -h * 0.28, d / 2 + 0.03]}>
        <boxGeometry args={[0.06, 0.03, 0.05]} />
        <meshStandardMaterial color="#2a2e30" metalness={0.6} roughness={0.4} />
      </mesh>
      <Led position={[-w * 0.4, h * 0.32, d / 2 + 0.012]} color={led} r={0.012} />
      {isCrit && (
        <mesh ref={critRef} scale={1.05}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={C.red} emissive={C.red} emissiveIntensity={1.4} transparent opacity={0.26} wireframe toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Control kernel PCB
// ---------------------------------------------------------------------------
function ControlKernel({ dims, highlight, hlColor }) {
  const [w, h, t] = dims
  const pcb = useMemo(() => makePcbTexture(), [])
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial map={pcb} metalness={0.2} roughness={0.6} emissive="#0a4027" emissiveIntensity={0.3} />
        {highlight && <Edges scale={1.01} threshold={15} color={hlColor} />}
      </mesh>
      {/* chips */}
      {[
        [-0.08, 0.1, 0.06, 0.05],
        [0.07, 0.05, 0.08, 0.06],
        [-0.05, -0.1, 0.05, 0.04],
        [0.08, -0.12, 0.04, 0.04],
      ].map(([x, y, cw, ch], i) => (
        <mesh key={i} position={[x, y, t / 2 + 0.008]}>
          <boxGeometry args={[cw, ch, 0.012]} />
          <meshStandardMaterial color="#0d0f10" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
      {/* status leds */}
      <Led position={[-w / 2 + 0.04, -h / 2 + 0.04, t / 2 + 0.01]} color={C.green} r={0.008} />
      <Led position={[-w / 2 + 0.07, -h / 2 + 0.04, t / 2 + 0.01]} color={C.teal} r={0.008} />
    </group>
  )
}

function Breaker({ dims, status, anomaly = true, highlight, hlColor }) {
  const [w, h, d] = dims
  const led = statusColor(anomaly ? status : 'ok')
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#3a3f42" metalness={0.4} roughness={0.55} />
        {highlight && <Edges scale={1.01} threshold={15} color={hlColor} />}
      </mesh>
      <mesh position={[0, 0.02, d / 2 + 0.02]}>
        <boxGeometry args={[0.035, 0.06, 0.04]} />
        <meshStandardMaterial color="#0d1011" metalness={0.3} roughness={0.6} />
      </mesh>
      <Led position={[w * 0.28, h * 0.32, d / 2 + 0.008]} color={led} r={0.01} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Rear fan-array door (renders 4 of 6 fans; top two are left/right fan nodes)
// ---------------------------------------------------------------------------
function FanBlades({ status, r = 0.13 }) {
  const spin = useRef()
  const speed = status === 'warning' ? 5 : 9
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z += dt * speed
  })
  const led = statusColor(status)
  return (
    <group>
      <mesh>
        <torusGeometry args={[r, 0.018, 10, 36]} />
        <meshStandardMaterial color="#15191b" metalness={0.7} roughness={0.5} />
      </mesh>
      <group ref={spin}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.03, 16]} />
          <meshStandardMaterial color={C.steelDark} metalness={0.7} roughness={0.4} />
        </mesh>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2
          return (
            <mesh key={i} rotation={[0, 0, a]} position={[Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, 0]}>
              <boxGeometry args={[r * 0.62, 0.045, 0.006]} />
              <meshStandardMaterial color="#23282b" metalness={0.5} roughness={0.5} />
            </mesh>
          )
        })}
      </group>
      <Led position={[0, 0, 0.02]} color={led} r={0.01} />
    </group>
  )
}

function FanDoor({ dims, highlight, hlColor }) {
  const [w, h, t] = dims
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color="#2a2e30" metalness={0.6} roughness={0.5} />
        {highlight && <Edges scale={1.01} threshold={15} color={hlColor} />}
      </mesh>
      {/* mid + bottom rows (4 fans); top row is left_fan / right_fan nodes */}
      {[
        [-0.16, 0.0],
        [0.16, 0.0],
        [-0.16, -0.46],
        [0.16, -0.46],
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, t / 2 + 0.02]}>
          <FanBlades status="ok" />
        </group>
      ))}
    </group>
  )
}

function Fan({ status, anomaly = true, highlight, hlColor }) {
  return (
    <group>
      <FanBlades status={anomaly ? status : 'ok'} />
      {highlight && (
        <mesh>
          <torusGeometry args={[0.14, 0.01, 8, 32]} />
          <meshBasicMaterial color={hlColor} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Side holster + blue CCS gun + cable
// ---------------------------------------------------------------------------
function CableAssembly({ highlight, hlColor }) {
  const cable = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.04, -0.12, 0.12),
          new THREE.Vector3(0.16, -0.5, 0.26),
          new THREE.Vector3(0.0, -0.92, 0.16),
          new THREE.Vector3(-0.12, -1.16, 0.02),
        ]),
        44,
        0.032,
        12,
        false
      ),
    []
  )
  return (
    <group>
      {/* holster */}
      <mesh position={[-0.04, 0.08, 0.0]} castShadow>
        <boxGeometry args={[0.12, 0.34, 0.18]} />
        <meshStandardMaterial color="#15191b" metalness={0.4} roughness={0.6} />
        {highlight && <Edges scale={1.02} threshold={15} color={hlColor} />}
      </mesh>
      {/* blue gun handle */}
      <mesh position={[0.05, 0.04, 0.08]} rotation={[0.25, 0, 0.1]} castShadow>
        <boxGeometry args={[0.09, 0.24, 0.1]} />
        <meshStandardMaterial color={C.blue} metalness={0.3} roughness={0.45} />
      </mesh>
      {/* connector head */}
      <mesh position={[0.05, -0.12, 0.12]} rotation={[Math.PI / 2.2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.042, 0.14, 18]} />
        <meshStandardMaterial color="#101314" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* cable */}
      <mesh geometry={cable}>
        <meshStandardMaterial color="#0c0e0f" metalness={0.2} roughness={0.85} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
function PartMesh({ part, anomaly, ghost, highlight, hlColor, critRef }) {
  switch (part.kind) {
    case 'shell':
      return <ShellDoor dims={part.dims} highlight={highlight} hlColor={hlColor} ghost={ghost} />
    case 'body':
      return <CabinetBody dims={part.dims} highlight={highlight} hlColor={hlColor} ghost={ghost} />
    case 'rectifier':
      return <RectifierModule dims={part.dims} status={part.status} anomaly={anomaly} highlight={highlight} hlColor={hlColor} critRef={critRef} />
    case 'pcb':
      return <ControlKernel dims={part.dims} highlight={highlight} hlColor={hlColor} />
    case 'breaker':
      return <Breaker dims={part.dims} status={part.status} anomaly={anomaly} highlight={highlight} hlColor={hlColor} />
    case 'fandoor':
      return <FanDoor dims={part.dims} highlight={highlight} hlColor={hlColor} />
    case 'fan':
      return <Fan status={part.status} anomaly={anomaly} highlight={highlight} hlColor={hlColor} />
    case 'cables':
      return <CableAssembly highlight={highlight} hlColor={hlColor} />
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
function ExplodingPart({ part, alphaTarget, selected, anomaly, ghostCasing, showAnno, onSelect, onHover }) {
  const group = useRef()
  const critRef = useRef()
  const alpha = useRef(0)
  const [hovered, setHovered] = useState(false)

  useFrame((state, dt) => {
    alpha.current = THREE.MathUtils.damp(alpha.current, alphaTarget, 6, dt)
    if (group.current) {
      const [px, py, pz] = part.pos
      const [ex, ey, ez] = part.explode
      group.current.position.set(px + ex * alpha.current, py + ey * alpha.current, pz + ez * alpha.current)
    }
    if (critRef.current) {
      critRef.current.material.emissiveIntensity = 1.0 + Math.sin(state.clock.elapsedTime * 4) * 0.7
    }
  })

  const highlight = selected || hovered
  const effStatus = anomaly ? part.status : 'ok'
  const hlColor = hl(effStatus)
  const ghost = ghostCasing && (part.kind === 'shell' || part.kind === 'body')
  const anno = part.annotation

  return (
    <group ref={group}>
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelect(part.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          onHover(part.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          onHover(null)
          document.body.style.cursor = 'auto'
        }}
      >
        <PartMesh part={part} anomaly={anomaly} ghost={ghost} highlight={highlight} hlColor={hlColor} critRef={critRef} />
      </group>

      {anno && showAnno && (
        <Html position={[0, 0, 0]} center distanceFactor={6} zIndexRange={[20, 0]}>
          <div className={`annotation ${STATUS[anno.state].anno}`}>{anno.text}</div>
        </Html>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
export default function ChargerModel({ explode, selectedId, isolate, anomaly = true, onSelect, onHover }) {
  const ghostCasing = isolate || explode > 0.35
  return (
    <group position={[0, -0.9, 0]}>
      {/* concrete plinth */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[1.04, 0.12, 0.82]} />
        <meshStandardMaterial color="#8d9094" metalness={0.1} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.12, 0.42]}>
        <boxGeometry args={[1.04, 0.04, 0.01]} />
        <meshStandardMaterial color={C.blue} emissive={C.blue} emissiveIntensity={0.2} />
      </mesh>

      {meshParts.map((part) => {
        const dimmed = isolate && selectedId && selectedId !== part.id
        const isAnomalyAnno = part.annotation && part.annotation.state !== 'ok'
        const showAnno =
          !!part.annotation &&
          (!isAnomalyAnno || anomaly) &&
          (explode > 0.18 || selectedId === part.id || (anomaly && part.status === 'critical'))
        return (
          <group key={part.id} visible={!dimmed}>
            <ExplodingPart
              part={part}
              alphaTarget={explode}
              selected={selectedId === part.id}
              anomaly={anomaly}
              ghostCasing={ghostCasing}
              showAnno={showAnno && !dimmed}
              onSelect={onSelect}
              onHover={onHover}
            />
          </group>
        )
      })}
    </group>
  )
}
