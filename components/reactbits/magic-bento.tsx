"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------
interface BentoItem {
  /** Icon component (Lucide or similar) */
  icon: React.ElementType;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Optional extra CSS classes on the wrapper div */
  className?: string;
  /** Accent glow color (rgba string) – defaults to white */
  accentColor?: string;
}

interface MagicBentoProps {
  items: BentoItem[];
  className?: string;
}

// --------------------------------------------------------------------------
// Single bento card
// --------------------------------------------------------------------------
function BentoCard({
  icon: Icon,
  title,
  description,
  className,
  accentColor = "rgba(255,255,255,0.08)",
}: BentoItem) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotPosition, setSpotPosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setSpotPosition({ x, y });

      // Subtle tilt
      const rotateX = ((y - 50) / 50) * -4;
      const rotateY = ((x - 50) / 50) * 4;
      cardRef.current.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 md:p-7 cursor-default",
        "backdrop-blur-md transition-[transform,box-shadow,border-color] duration-300 ease-out will-change-transform",
        "select-none",
        className
      )}
      style={{
        background:
          "linear-gradient(155deg, rgba(22, 16, 24, 0.92), rgba(13, 9, 16, 0.82))",
        borderColor: isHovered
          ? "rgba(215, 220, 228, 0.38)"
          : "rgba(215, 220, 228, 0.2)",
        boxShadow: isHovered
          ? `inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 60px rgba(1,8,20,0.55), 0 0 30px ${accentColor}`
          : "inset 0 1px 0 rgba(255,255,255,0.05), 0 18px 50px rgba(1,8,20,0.45)",
      }}
    >
      {/* Mouse-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${spotPosition.x}% ${spotPosition.y}%, rgba(255,255,255,0.06) 0%, transparent 70%)`,
        }}
      />

      {/* Top highlight edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) ${spotPosition.x}%, transparent 100%)`,
        }}
      />

      <div className="relative z-10">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-5 border transition-all duration-300",
            isHovered ? "border-white/20" : "border-white/10"
          )}
          style={{
            background: isHovered
              ? "rgba(255,255,255,0.08)"
              : "rgba(34,19,29,0.85)",
          }}
        >
          <Icon
            className={cn(
              "w-6 h-6 transition-colors duration-300",
              isHovered ? "text-white" : "text-white/75"
            )}
          />
        </div>

        <h3
          className={cn(
            "text-xl font-semibold mb-2 leading-tight transition-colors duration-300",
            isHovered ? "text-white" : "text-white/90"
          )}
        >
          {title}
        </h3>
        <p className="text-white/58 leading-relaxed text-[0.9375rem]">
          {description}
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// MagicBento grid
// --------------------------------------------------------------------------
export function MagicBento({ items, className }: MagicBentoProps) {
  return (
    <div
      className={cn(
        "grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5",
        className
      )}
    >
      {items.map((item, index) => (
        <BentoCard
          key={item.title}
          {...item}
          className={cn(
            index === 0
              ? "md:col-span-2 lg:col-span-2 min-h-[220px]"
              : "min-h-[200px]",
            item.className
          )}
        />
      ))}
    </div>
  );
}
