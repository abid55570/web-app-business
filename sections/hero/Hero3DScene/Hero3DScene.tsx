'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, OrbitControls, Stars } from '@react-three/drei'
import { motion } from 'framer-motion'
import type { Mesh } from 'three'

export type Hero3DSceneProps = {
  eyebrow?: string
  headline: string
  body: string
  ctaLabel?: string
  ctaHref?: string
  /** Primary brand color (drives the headline gradient, button, light). */
  accentColor?: string
  /** Secondary brand color (gradient end, second blob, button hover). */
  accentColor2?: string
  /** Tertiary brand color (third blob, third gradient stop). */
  accentColor3?: string
  /** Sprint 14 — layout variant. 'full' (default, fills viewport),
   *  'half' (60vh, leaves room below the fold), 'compact' (fixed 420px). */
  layoutVariant?: 'full' | 'half' | 'compact'
}

/** Big distorted blob that floats + rotates. */
function FloatingBlob({ color, position }: { color: string; position: [number, number, number] }) {
  const ref = useRef<Mesh>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.x += dt * 0.15
    ref.current.rotation.y += dt * 0.25
  })
  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[1.4, 8]} />
        <MeshDistortMaterial color={color} distort={0.45} speed={2} roughness={0.18} metalness={0.65} />
      </mesh>
    </Float>
  )
}

function Scene({ accentColor, accentColor2, accentColor3 }: { accentColor: string; accentColor2: string; accentColor3: string }) {
  return (
    <>
      <color attach="background" args={['#0b0b15']} />
      <ambientLight intensity={0.45} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color={accentColor} />
      <pointLight position={[-10, -6, -4]} intensity={0.8} color={accentColor2} />
      <Stars radius={60} depth={40} count={2500} factor={4} fade speed={1} />
      <FloatingBlob color={accentColor} position={[2.5, 0.5, 0]} />
      <FloatingBlob color={accentColor2} position={[-3, -0.6, -2]} />
      <FloatingBlob color={accentColor3} position={[0, 2.2, -3]} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
    </>
  )
}

export function Hero3DScene({
  eyebrow,
  headline,
  body,
  ctaLabel = 'Get started',
  ctaHref = '#',
  accentColor = '#6366f1',
  accentColor2 = '#ec4899',
  accentColor3 = '#06b6d4',
  layoutVariant = 'full',
}: Hero3DSceneProps) {
  // r3f's Canvas touches window-only APIs on init; gate it so SSR
  // renders the overlay only and the 3D scene mounts client-side.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Sprint 14 — variant-specific height classes
  const heightClass =
    layoutVariant === 'half'    ? 'h-[60vh] min-h-[440px]' :
    layoutVariant === 'compact' ? 'h-[420px] min-h-[420px]' :
                                   'h-screen min-h-[640px]'

  return (
    <section className={`relative ${heightClass} w-full overflow-hidden bg-black text-white`}>
      <div className="absolute inset-0">
        {mounted ? (
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              <Scene accentColor={accentColor} accentColor2={accentColor2} accentColor3={accentColor3} />
            </Suspense>
          </Canvas>
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(ellipse at center, ${accentColor}33, transparent 70%), #0b0b15`,
            }}
          />
        )}
      </div>

      {/* Gradient veil for text legibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        {eyebrow ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: accentColor }}
          >
            {eyebrow}
          </motion.p>
        ) : null}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 0.8, 0.36, 1] }}
          className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          style={{
            background: `linear-gradient(135deg, #fff 0%, ${accentColor} 50%, ${accentColor2} 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          {body}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="mt-10"
        >
          <a
            href={ctaHref}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-base font-semibold text-white shadow-2xl transition-transform hover:scale-[1.03]"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor2})` }}
          >
            <span className="relative z-10">{ctaLabel}</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
            <span
              aria-hidden
              className="absolute inset-0 -z-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: `linear-gradient(135deg, ${accentColor2}, ${accentColor})` }}
            />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-white/40"
        >
          ↓ scroll to explore
        </motion.div>
      </div>
    </section>
  )
}
