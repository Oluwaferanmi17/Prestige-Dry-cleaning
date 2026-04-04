"use client";
import Link from "next/link";
import React from "react";
import { ArrowRight, Truck } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatItemProps {
  value: string;
  label: string;
}

interface ServicePillProps {
  label: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatItem: React.FC<StatItemProps> = ({ value, label }) => (
  <div className="stat-item">
    <div className="stat-num">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const ServicePill: React.FC<ServicePillProps> = ({ label }) => (
  <div className="pill">
    <span className="pill-dot" />
    {label}
  </div>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS: StatItemProps[] = [
  { value: "36+", label: "Years serving" },
  { value: "98%", label: "Satisfaction" },
  { value: "24h", label: "Express ready" },
];

const SERVICES: string[] = [
  "Dry Clean",
  "Alterations",
  "Leather Care",
  "Pressing",
];

const TRUST_ITEMS: string[] = [
  "Wedding Gowns",
  "Bespoke Suits",
  "Cashmere & Wool",
  "Leather & Suede",
  "Household Linens",
  "Embroidered Fabrics",
  "Silk & Delicates",
  "Evening Wear",
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DryCleaningHero() {
  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── CSS Variables ── */
        .hero-root {
          --cream: #F5F0E8;
          --ink: #1A1712;
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --mist: #8C8070;
          --card-bg: #2C2620;
          --card-bg-dark: #241F17;
        }

        /* ── Base ── */
        .hero-root * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Hero layout ── */
        .hero-root {
          min-height: 100vh;
          background: var(--ink);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
        }
        .hero-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 80% at 70% 50%, #2a2318 0%, transparent 70%);
          z-index: 0;
        }

        /* ── Grain overlay ── */
        .grain {
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
        }

        /* ── Left panel ── */
        .hero-left {
          position: relative;
          z-index: 2;
          padding: 64px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* ── Eyebrow ── */
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
          opacity: 0;
          animation: heroRise 0.8s ease forwards 0.1s;
        }
        .eyebrow-line {
          width: 32px;
          height: 1px;
          background: var(--gold);
          flex-shrink: 0;
        }
        .eyebrow span {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 400;
        }

        /* ── Heading ── */
        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 6vw, 88px);
          font-weight: 300;
          line-height: 1.0;
          color: var(--cream);
          margin-bottom: 10px;
          opacity: 0;
          animation: heroRise 0.9s ease forwards 0.25s;
        }
        .hero-h1 em {
          font-style: italic;
          color: var(--gold-light);
        }
        .hero-h1-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 6vw, 88px);
          font-weight: 300;
          line-height: 1.05;
          color: var(--cream);
          margin-bottom: 36px;
          opacity: 0;
          animation: heroRise 0.9s ease forwards 0.35s;
        }

        /* ── Description ── */
        .hero-desc {
          font-size: 15px;
          color: var(--mist);
          line-height: 1.75;
          max-width: 400px;
          margin-bottom: 48px;
          font-weight: 300;
          opacity: 0;
          animation: heroRise 0.9s ease forwards 0.45s;
        }

        /* ── CTA row ── */
        .cta-row {
          display: flex;
          align-items: center;
          gap: 28px;
          opacity: 0;
          animation: heroRise 0.9s ease forwards 0.55s;
        }
        .btn-primary {
          background: var(--gold);
          color: var(--ink);
          border: none;
          padding: 16px 36px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.25s ease, background 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.15);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        .btn-primary:hover::after { transform: translateX(0); }
        .btn-primary:hover { transform: translateY(-1px); }

        .btn-ghost {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--mist);
          letter-spacing: 0.06em;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
        }
        .btn-ghost:hover { color: var(--cream); }
        .btn-ghost .btn-ghost-icon { transition: transform 0.2s; }
        .btn-ghost:hover .btn-ghost-icon { transform: translateX(4px); }

        /* ── Stats ── */
        .stats {
          display: flex;
          align-items: stretch;
          gap: 40px;
          margin-top: 64px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.08);
          opacity: 0;
          animation: heroRise 0.9s ease forwards 0.7s;
        }
        .stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px;
          font-weight: 600;
          color: var(--cream);
          line-height: 1;
        }
        .stat-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--mist);
          margin-top: 6px;
        }
        .stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.1);
          align-self: stretch;
        }

        /* ── Right panel ── */
        .hero-right {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 48px 64px 24px;
          opacity: 0;
          animation: heroRise 1s ease forwards 0.4s;
        }

        /* ── Visual stack ── */
        .visual-stack {
          position: relative;
          width: 100%;
          max-width: 420px;
        }

        /* ── Garment frame ── */
        .garment-frame {
          width: 100%;
          aspect-ratio: 3 / 4;
          background: var(--card-bg-dark);
          border: 1px solid rgba(201,168,76,0.2);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .garment-frame::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .garment-svg { width: 65%; opacity: 0.9; }

        .hanger-bar {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          background: linear-gradient(to right, transparent, var(--gold), transparent);
        }
        .hanger-hook {
          position: absolute;
          top: -16px; left: 50%;
          transform: translateX(-50%);
          width: 20px; height: 20px;
          border: 2px solid var(--gold);
          border-bottom: none;
          border-radius: 10px 10px 0 0;
        }

        .badge-ready {
          position: absolute;
          bottom: 24px;
          left: 24px;
          background: var(--gold);
          color: var(--ink);
          padding: 10px 16px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Service pills ── */
        .pill-stack {
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pill {
          background: var(--card-bg);
          border: 1px solid rgba(201,168,76,0.25);
          padding: 10px 16px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold-light);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: default;
          transition: background 0.25s, transform 0.25s;
          font-family: 'DM Sans', sans-serif;
        }
        .pill:hover {
          background: rgba(201,168,76,0.12);
          transform: translateX(-4px);
        }
        .pill-dot {
          display: inline-block;
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--gold);
          flex-shrink: 0;
        }

        /* ── Delivery badge ── */
        .delivery-badge {
          position: absolute;
          bottom: -18px;
          right: 20px;
          background: #F5F0E8;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .delivery-icon {
          width: 36px; height: 36px;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .delivery-eyebrow {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
          font-weight: 400;
          display: block;
          font-family: 'DM Sans', sans-serif;
        }
        .delivery-main {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          margin-top: 2px;
          display: block;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Trust / marquee bar ── */
        .trust-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: rgba(201,168,76,0.06);
          border-top: 1px solid rgba(201,168,76,0.15);
          padding: 14px 0;
          z-index: 3;
          overflow: hidden;
        }
        .trust-track {
          display: flex;
          gap: 48px;
          white-space: nowrap;
          width: max-content;
          animation: heroScroll 30s linear infinite;
        }
        .trust-item {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--mist);
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: 'DM Sans', sans-serif;
        }
        .trust-item::after {
          content: '✦';
          font-size: 8px;
          color: var(--gold);
        }

        /* ── Keyframes ── */
        @keyframes heroRise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes heroScroll {
          from { transform: translateX(0);    }
          to   { transform: translateX(-50%); }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hero-root { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .hero-left { padding: 80px 28px 120px; }
        }
      `}</style>

      <section className="hero-root">
        {/* Grain texture */}
        <div className="grain" aria-hidden="true" />

        {/* ── Left column ── */}
        <div className="hero-left">
          {/* Eyebrow */}
          <div className="eyebrow">
            <span className="eyebrow-line" />
            <span>Est. 1987 · Premium Care</span>
          </div>

          {/* Heading */}
          <h1 className="hero-h1">
            Dressed to
            <br />
            <em>Perfection,</em>
          </h1>
          <p className="hero-h1-sub">Every Time.</p>

          {/* Description */}
          <p className="hero-desc">
            Specialist dry cleaning for those who demand the finest. We treat
            every garment as if it were our own — with precision, expertise, and
            an eye for detail that can&apos;t be automated.
          </p>

          {/* CTA buttons */}
          <div className="cta-row">
            <Link href="/schedule">
              <button className="btn-primary" type="button">
                Schedule Pickup
              </button>
            </Link>
            <button className="btn-ghost" type="button">
              View Services
              <ArrowRight
                className="btn-ghost-icon"
                width={16}
                height={16}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* Stats */}
          <div className="stats">
            {STATS.map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <div className="stat-divider" />}
                <StatItem {...stat} />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="hero-right" aria-hidden="true">
          <div className="visual-stack">
            {/* Garment illustration card */}
            <div className="garment-frame">
              <div className="hanger-bar" />
              <div className="hanger-hook" />

              {/* Suit jacket SVG */}
              <svg
                className="garment-svg"
                viewBox="0 0 200 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Body */}
                <path
                  d="M40 70 L20 260 L180 260 L160 70 L130 50 L100 65 L70 50 Z"
                  fill="#2C2620"
                  stroke="rgba(201,168,76,0.3)"
                  strokeWidth="1"
                />
                {/* Left lapel */}
                <path
                  d="M100 65 L70 50 L50 90 L85 120 Z"
                  fill="#241F17"
                  stroke="rgba(201,168,76,0.25)"
                  strokeWidth="0.8"
                />
                {/* Right lapel */}
                <path
                  d="M100 65 L130 50 L150 90 L115 120 Z"
                  fill="#241F17"
                  stroke="rgba(201,168,76,0.25)"
                  strokeWidth="0.8"
                />
                {/* Collar */}
                <path
                  d="M80 50 L100 40 L120 50 L100 65 Z"
                  fill="#1E1A14"
                  stroke="rgba(201,168,76,0.2)"
                  strokeWidth="0.8"
                />
                {/* Centre seam */}
                <line
                  x1="100"
                  y1="120"
                  x2="100"
                  y2="260"
                  stroke="rgba(201,168,76,0.15)"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                />
                {/* Pocket square */}
                <path
                  d="M55 110 L75 108 L73 125 L53 127 Z"
                  fill="rgba(201,168,76,0.08)"
                  stroke="rgba(201,168,76,0.35)"
                  strokeWidth="0.8"
                />
                <path
                  d="M62 108 L65 100 L68 108"
                  fill="none"
                  stroke="rgba(201,168,76,0.5)"
                  strokeWidth="0.8"
                />
                {/* Buttons */}
                {[145, 165, 185].map((cy) => (
                  <circle
                    key={cy}
                    cx="100"
                    cy={cy}
                    r="3"
                    fill="rgba(201,168,76,0.4)"
                    stroke="rgba(201,168,76,0.6)"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Left shoulder */}
                <path
                  d="M40 70 Q30 65 30 55 Q40 48 70 50"
                  fill="none"
                  stroke="rgba(201,168,76,0.2)"
                  strokeWidth="0.8"
                />
                {/* Right shoulder */}
                <path
                  d="M160 70 Q170 65 170 55 Q160 48 130 50"
                  fill="none"
                  stroke="rgba(201,168,76,0.2)"
                  strokeWidth="0.8"
                />
                {/* Shine accent */}
                <path
                  d="M55 80 Q60 95 58 115"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>

              <div className="badge-ready">✦ Ready for collection</div>
            </div>

            {/* Service pills */}
            <div className="pill-stack">
              {SERVICES.map((label) => (
                <ServicePill key={label} label={label} />
              ))}
            </div>

            {/* Delivery badge */}
            <div className="delivery-badge">
              <div className="delivery-icon">
                <Truck
                  width={18}
                  height={18}
                  color="#C9A84C"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <span className="delivery-eyebrow">Free collection</span>
                <span className="delivery-main">Book before noon today</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Trust marquee ── */}
        <div className="trust-bar" aria-hidden="true">
          <div className="trust-track">
            {/* Duplicated for seamless loop */}
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
              <span key={i} className="trust-item">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
