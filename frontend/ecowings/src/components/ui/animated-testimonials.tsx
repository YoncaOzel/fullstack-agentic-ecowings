"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  content: string
  rating: number
  avatar: string
}

export interface AnimatedTestimonialsProps {
  title?: string
  subtitle?: string
  badgeText?: string
  testimonials?: Testimonial[]
  autoRotateInterval?: number
  className?: string
}

export function AnimatedTestimonials({
  title = "Recent Reviews",
  subtitle = "Hear from real EcoWings passengers about their green travel experience.",
  badgeText = "Passenger Experiences",
  testimonials = [],
  autoRotateInterval = 6000,
  className,
}: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) controls.start("visible")
  }, [isInView, controls])

  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, autoRotateInterval)
    return () => clearInterval(interval)
  }, [autoRotateInterval, testimonials.length])

  if (testimonials.length === 0) return null

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className={className}
      style={{
        background: "linear-gradient(to bottom, #f4f6f4 0%, #eef2ee 14%, #eef2ee 86%, #f5f7f5 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={controls}
        variants={{ visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } }}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "96px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "48px",
          alignItems: "stretch",
        }}
      >
        {/* ── Left column ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              width: "fit-content",
              padding: "5px 12px",
              borderRadius: "999px",
              background: "rgba(26,58,42,0.08)",
              color: "#1a3a2a",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "'Inter',sans-serif",
            }}
          >
            <Star style={{ width: "13px", height: "13px", fill: "#1a3a2a", color: "#1a3a2a" }} />
            {badgeText}
          </div>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "'Manrope','Plus Jakarta Sans',sans-serif",
              fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
              fontWeight: 800,
              color: "#0f1f17",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {title}
          </h2>

          {/* Description */}
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
              fontSize: "1rem",
              lineHeight: 1.65,
              color: "#6b7c73",
              margin: 0,
              maxWidth: "420px",
            }}
          >
            {subtitle}
          </p>

          {/* Pagination pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                aria-label={`View testimonial ${index + 1}`}
                style={{
                  height: "10px",
                  width: activeIndex === index ? "36px" : "10px",
                  borderRadius: "999px",
                  background: activeIndex === index ? "#1a3a2a" : "#d1d9d4",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "width 0.3s ease, background 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{
                opacity: activeIndex === index ? 1 : 0,
                x: activeIndex === index ? 0 : 60,
                scale: activeIndex === index ? 1 : 0.97,
              }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              style={{
                position: index === 0 ? "relative" : "absolute",
                inset: 0,
                zIndex: activeIndex === index ? 10 : 0,
                pointerEvents: activeIndex === index ? "auto" : "none",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "32px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  height: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                {/* Stars */}
                <div style={{ display: "flex", gap: "4px" }}>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        style={{
                          width: "20px",
                          height: "20px",
                          fill: i < testimonial.rating ? "#f59e0b" : "#e5e7eb",
                          color: i < testimonial.rating ? "#f59e0b" : "#e5e7eb",
                        }}
                      />
                    ))}
                </div>

                {/* Review text */}
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans','Inter',sans-serif",
                    fontSize: "1.05rem",
                    fontWeight: 500,
                    lineHeight: 1.7,
                    color: "#1c2b22",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(0,0,0,0.07)" }} />

                {/* Avatar row */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <Avatar
                    style={{
                      width: "48px",
                      height: "48px",
                      flexShrink: 0,
                      border: "2px solid rgba(26,58,42,0.12)",
                      borderRadius: "50%",
                    }}
                  >
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback
                      style={{
                        background: "rgba(26,58,42,0.08)",
                        color: "#1a3a2a",
                        fontWeight: 700,
                        fontSize: "15px",
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Manrope',sans-serif",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "#0f1f17",
                        lineHeight: 1.3,
                      }}
                    >
                      {testimonial.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Inter',sans-serif",
                        fontSize: "0.78rem",
                        color: "#6b7c73",
                        marginTop: "2px",
                      }}
                    >
                      {testimonial.role} &middot; {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
