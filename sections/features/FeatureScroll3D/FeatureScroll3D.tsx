'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { Mesh } from 'three'

export type FeatureScroll3DProps = {
  eyebrow?: string
  headline: string
  accentColor?: string
  /** Secondary brand color (second 3D point light). */
  accentColor2?: string
  /** Tertiary brand color (reserved for additional accents). */
  accentColor3?: string
  segments: { title: string; body: string; color?: string }[]
}

function ScrollMorphMesh({ progress }: { progress: { get: () => number } }) {
  const ref = useRef<Mesh>(null)
  useFrame(() => {
    if (!ref.current) return
    const p = progress.get()
    ref.current.rotation.y = p * Math.PI * 2.5
    ref.current.rotation.x = p * Math.PI * 0.6
    const scale = 1 + Math.sin(p * Math.PI * 3) * 0.15
    ref.current.scale.set(scale, scale, scale)
  })
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[1, 0.32, 200, 32]} />
        <MeshDistortMaterial color="#6366f1" distort={0.4} speed={3} roughness={0.15} metalness={0.7} />
      </mesh>
    </Float>
  )
}

export function FeatureScroll3D({
  eyebrow,
  headline,
  accentColor = '#6366f1',
  accentColor2 = '#ec4899',
  accentColor3 = '#06b6d4',
  segments,
}: FeatureScroll3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  // Active segment index based on scroll progress.
  const activeIndex = useTransform(scrollYProgress, (v) =>
    Math.min(segments.length - 1, Math.floor(v * segments.length)),
  )
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <section
      ref={containerRef}
      className="relative bg-black text-white"
      style={{ height: `${segments.length * 80}vh` }}
    >
      {/* Sticky 3D + heading layer */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0">
          {mounted ? (
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 2]}>
              <Suspense fallback={null}>
                <color attach="background" args={['#06060e']} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 5]} intensity={1.5} color={accentColor} />
                <pointLight position={[-8, -4, -2]} intensity={0.8} color={accentColor2} />
                <pointLight position={[0, -8, 4]} intensity={0.6} color={accentColor3} />
                <ScrollMorphMesh progress={scrollYProgress} />
              </Suspense>
            </Canvas>
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(ellipse at center, ${accentColor}22, transparent 70%), #06060e`,
              }}
            />
          )}
        </div>

        <div className="relative z-10 grid h-full grid-cols-1 items-center px-6 md:grid-cols-2 md:px-16">
          <div className="hidden md:block" />
          <div>
            {eyebrow ? (
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]"
                style={{ color: accentColor }}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mb-10 text-4xl font-bold leading-tight md:text-5xl">{headline}</h2>

            {segments.map((seg, i) => (
              <SegmentBlock key={i} index={i} segment={seg} activeIndex={activeIndex} accentColor={accentColor} />
            ))}
          </div>
        </div>

        {/* Scroll progress dots on the left */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-3 md:left-10">
          {segments.map((_, i) => (
            <Dot key={i} index={i} activeIndex={activeIndex} accentColor={accentColor} />
          ))}
        </div>
      </div>
    </section>
  )
}

function SegmentBlock({
  index,
  segment,
  activeIndex,
  accentColor,
}: {
  index: number
  segment: { title: string; body: string; color?: string }
  activeIndex: { get: () => number }
  accentColor: string
}) {
  const opacity = useTransform(activeIndex, (v) => (Math.round(v) === index ? 1 : 0.25))
  const x = useTransform(activeIndex, (v) => (Math.round(v) === index ? 0 : 20))
  return (
    <motion.div style={{ opacity, x }} className="mb-8">
      <h3 className="mb-2 text-2xl font-bold" style={{ color: segment.color ?? accentColor }}>
        {segment.title}
      </h3>
      <p className="max-w-md text-base text-white/70">{segment.body}</p>
    </motion.div>
  )
}

function Dot({
  index,
  activeIndex,
  accentColor,
}: {
  index: number
  activeIndex: { get: () => number }
  accentColor: string
}) {
  const scale = useTransform(activeIndex, (v) => (Math.round(v) === index ? 1.4 : 1))
  const bg = useTransform(activeIndex, (v) => (Math.round(v) === index ? accentColor : '#ffffff33'))
  return (
    <motion.div
      style={{ scale, background: bg }}
      className="h-2 w-2 rounded-full"
    />
  )
}
