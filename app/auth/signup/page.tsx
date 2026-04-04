"use client";
// import Image from "next/image";
import { useState, ChangeEvent, FormEvent } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check, Shirt } from "lucide-react";

// ─── Scoped Input (reused from login) ────────────────────────────────────────

function GoldInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(
    ${visible ? "120px" : "0px"} circle at ${mouseX}px ${mouseY}px,
    rgba(201,168,76,0.35), transparent 80%
  )`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  }

  return (
    <motion.div
      style={{ background: bg }}
      onMouseMove={handleMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="auth-input-wrap"
    >
      <div className="auth-input-inner">
        <input
          id={id}
          name={id}
          type={type === "password" ? (showPw ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="auth-input"
          autoComplete={
            type === "password"
              ? "new-password"
              : type === "email"
                ? "email"
                : "off"
          }
        />
        {type === "password" && (
          <button
            type="button"
            className="auth-pw-toggle"
            onClick={() => setShowPw((p) => !p)}
            aria-label="Toggle password"
          >
            {showPw ? (
              <Eye width={15} height={15} strokeWidth={1.5} />
            ) : (
              <EyeOff width={15} height={15} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Password strength meter ─────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["#3E3830", "#B45050", "#C9A84C", "#C9A84C", "#4AA06C"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="pw-bar"
            style={{
              background: i < score ? colors[score] : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
      <div className="pw-label" style={{ color: colors[score] }}>
        {labels[score]}
      </div>
      <div className="pw-checks">
        {checks.map((c) => (
          <div
            key={c.label}
            className={`pw-check ${c.pass ? "pw-check--pass" : ""}`}
          >
            <Check width={9} height={9} strokeWidth={3} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Right panel visual (flipped from login) ──────────────────────────────────

function RightPanel() {
  const perks = [
    {
      icon: "✦",
      title: "Free Collection",
      desc: "We come to your door, no minimum order",
    },
    {
      icon: "◈",
      title: "Expert Care",
      desc: "Specialists in delicates, leather & bespoke",
    },
    {
      icon: "◇",
      title: "24h Express",
      desc: "Same-day turnaround before noon",
    },
    {
      icon: "○",
      title: "Premium Guarantee",
      desc: "Not right? We re-clean it. Free.",
    },
  ];

  return (
    <div className="auth-left signup-right-panel">
      <div className="auth-grain" aria-hidden />
      <div className="auth-glow" aria-hidden />

      {/* Logo */}
      <motion.div
        className="auth-logomark"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-logomark-ring">
          <Shirt width={24} height={24} strokeWidth={1} color="#C9A84C" />
        </div>
        <div>
          <div className="auth-logomark-name">Prestige</div>
          <div className="auth-logomark-tagline">Dry Cleaning</div>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        className="auth-left-headline"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="auth-headline-small">Join 12,000+ members</span>
        <h2 className="auth-headline">
          Your wardrobe,
          <br />
          <em>in safe hands.</em>
        </h2>
        <p className="auth-headline-sub">
          Create a free account and experience garment care the way it was meant
          to be.
        </p>
      </motion.div>

      {/* Perks list */}
      <motion.div
        className="signup-perks"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {perks.map((p, i) => (
          <motion.div
            key={p.title}
            className="signup-perk"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
          >
            <div className="signup-perk-icon">{p.icon}</div>
            <div>
              <div className="signup-perk-title">{p.title}</div>
              <div className="signup-perk-desc">{p.desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom quote */}
      <motion.div
        className="signup-quote"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <p className="signup-quote-text">
          &quot;Prestige has looked after my wardrobe for twelve years. I
          wouldn&apos;t trust anyone else.&quot;
        </p>
        <p className="signup-quote-attr">— Charlotte W., Member since 2013</p>
      </motion.div>
    </div>
  );
}

// ─── Sign Up Page ─────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password)
      e.confirm = "Passwords do not match";
    if (!form.agree) e.agree = "You must agree to the terms";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Root ── */
        .auth-root {
          --cream: #F5F0E8;
          --ink: #1A1712;
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --mist: #8C8070;
          --card: #211D16;
          --border: rgba(201,168,76,0.14);
          --border-hover: rgba(201,168,76,0.38);
          --input-bg: #1E1A13;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--ink);
          font-family: 'DM Sans', sans-serif;
          color: var(--cream);
        }

        /* ── Left / visual panel ── */
        .auth-left {
          position: relative; background: #161210;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          justify-content: space-between; padding: 48px;
          overflow: hidden; min-height: 100vh;
        }
        .signup-right-panel { border-right: none; border-left: 1px solid var(--border); order: 2; }
        .auth-grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px; opacity: 0.04; pointer-events: none; z-index: 0;
        }
        .auth-glow {
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none; z-index: 0;
        }
        .auth-logomark {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 14px;
        }
        .auth-logomark-ring {
          width: 52px; height: 52px; border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
        }
        .auth-logomark-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 400;
          color: var(--cream); letter-spacing: 0.03em;
        }
        .auth-logomark-tagline {
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--gold);
          font-weight: 300; margin-top: 2px;
        }
        .auth-left-headline { position: relative; z-index: 1; }
        .auth-headline-small {
          display: block; font-size: 11px;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--gold); font-weight: 300; margin-bottom: 16px;
        }
        .auth-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 3.5vw, 56px);
          font-weight: 300; line-height: 1.05;
          color: var(--cream); margin-bottom: 18px;
        }
        .auth-headline em { font-style: italic; color: var(--gold-light); }
        .auth-headline-sub {
          font-size: 14px; color: var(--mist);
          font-weight: 300; line-height: 1.75; max-width: 320px;
        }

        /* Perks */
        .signup-perks {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 16px;
        }
        .signup-perk {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .signup-perk:hover { border-color: var(--border-hover); }
        .signup-perk-icon {
          font-size: 14px; color: var(--gold);
          margin-top: 1px; flex-shrink: 0; width: 20px;
          text-align: center;
        }
        .signup-perk-title {
          font-size: 13px; font-weight: 500; color: var(--cream);
          margin-bottom: 3px;
        }
        .signup-perk-desc {
          font-size: 12px; color: var(--mist); font-weight: 300; line-height: 1.5;
        }

        /* Quote */
        .signup-quote {
          position: relative; z-index: 1;
          border-top: 1px solid var(--border);
          padding-top: 24px;
        }
        .signup-quote-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px; font-style: italic;
          color: var(--mist); line-height: 1.7;
          margin-bottom: 10px;
        }
        .signup-quote-attr {
          font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: #4A4238;
          font-weight: 300;
        }

        /* ── Form panel ── */
        .auth-right {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 48px 48px;
          min-height: 100vh;
          overflow-y: auto;
          order: 1;
        }
        .auth-form-wrap {
          width: 100%; max-width: 420px;
          display: flex; flex-direction: column;
        }

        .auth-form-eyebrow {
          font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--gold);
          font-weight: 300; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .auth-form-eyebrow-line { width: 20px; height: 1px; background: var(--gold); }
        .auth-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 38px; font-weight: 300;
          color: var(--cream); line-height: 1.05; margin-bottom: 8px;
        }
        .auth-form-title em { font-style: italic; color: var(--gold-light); }
        .auth-form-sub {
          font-size: 14px; color: var(--mist);
          font-weight: 300; margin-bottom: 36px; line-height: 1.6;
        }

        /* Google */
        .auth-google-btn {
          width: 100%; background: var(--card);
          border: 1px solid var(--border); color: var(--cream);
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 300;
          padding: 13px 20px; display: flex; align-items: center;
          justify-content: center; gap: 10px; cursor: pointer;
          margin-bottom: 22px; transition: border-color 0.2s, background 0.2s;
          letter-spacing: 0.03em;
        }
        .auth-google-btn:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.03); }
        .auth-google-icon {
          width: 18px; height: 18px; background: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .auth-divider {
          display: flex; align-items: center; gap: 14px; margin-bottom: 26px;
        }
        .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
        .auth-divider-text { font-size: 11px; color: var(--mist); letter-spacing: 0.1em; }

        /* Fields */
        .auth-fields { display: flex; flex-direction: column; gap: 18px; margin-bottom: 24px; }
        .auth-fields-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .auth-field { display: flex; flex-direction: column; gap: 7px; }
        .auth-label {
          font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--mist); font-weight: 400;
        }
        .auth-input-wrap { padding: 1.5px; transition: background 0.3s; }
        .auth-input-inner {
          position: relative; background: var(--input-bg);
          border: 1px solid var(--border);
        }
        .auth-input {
          width: 100%; background: transparent; border: none; outline: none;
          color: var(--cream); font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300; padding: 12px 16px;
        }
        .auth-input::placeholder { color: #3E3830; }
        .auth-input-inner:focus-within { border-color: rgba(201,168,76,0.45); }
        .auth-pw-toggle {
          position: absolute; top: 50%; right: 14px;
          transform: translateY(-50%);
          background: none; border: none; color: var(--mist);
          cursor: pointer; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .auth-pw-toggle:hover { color: var(--gold-light); }
        .auth-error { font-size: 11px; color: #B45050; margin-top: 3px; }

        /* Password strength */
        .pw-strength { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        .pw-bars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
        .pw-bar { height: 3px; border-radius: 2px; transition: background 0.3s; }
        .pw-label { font-size: 11px; text-align: right; font-weight: 400; transition: color 0.3s; }
        .pw-checks {
          display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;
        }
        .pw-check {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #4A4238; font-weight: 300;
          transition: color 0.2s;
        }
        .pw-check--pass { color: #4AA06C; }

        /* Agree checkbox */
        .auth-agree-row {
          display: flex; align-items: flex-start; gap: 10px; margin-bottom: 24px;
        }
        .auth-checkbox-btn {
          width: 18px; height: 18px; border: 1px solid var(--border-hover);
          background: var(--input-bg);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px; cursor: pointer;
          transition: background 0.2s; border-radius: 0;
          outline: none;
        }
        .auth-checkbox-btn--checked { background: var(--gold); border-color: var(--gold); }
        .auth-agree-label {
          font-size: 12px; color: var(--mist); font-weight: 300; line-height: 1.6;
        }
        .auth-agree-label a { color: var(--gold-light); text-decoration: none; }
        .auth-agree-label a:hover { color: var(--gold); }

        /* Submit */
        .auth-submit {
          width: 100%; background: var(--gold); color: var(--ink);
          border: none; padding: 15px 32px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: filter 0.2s, transform 0.15s; margin-bottom: 22px;
        }
        .auth-submit:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .auth-submit:active { transform: scale(0.99); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .auth-btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(26,23,18,0.3); border-top-color: var(--ink);
          border-radius: 50%; animation: authSpin 0.7s linear infinite;
        }
        .auth-arrow { transition: transform 0.2s; }
        .auth-submit:hover .auth-arrow { transform: translateX(4px); }

        .auth-switch {
          text-align: center; font-size: 13px;
          color: var(--mist); font-weight: 300;
        }
        .auth-switch a, .auth-switch button {
          color: var(--gold-light); background: none; border: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400; text-decoration: none;
          transition: color 0.2s;
        }
        .auth-switch a:hover, .auth-switch button:hover { color: var(--gold); }

        /* Success */
        .auth-success {
          display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 16px;
          animation: authRise 0.6s ease forwards;
        }
        .auth-success-ring {
          width: 72px; height: 72px; border-radius: 50%;
          border: 1px solid var(--gold);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
        }
        .auth-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 36px; font-weight: 300; color: var(--cream);
        }
        .auth-success-sub { font-size: 14px; color: var(--mist); font-weight: 300; max-width: 300px; line-height: 1.7; }

        @keyframes authSpin { to { transform: rotate(360deg); } }
        @keyframes authRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .auth-root { grid-template-columns: 1fr; }
          .signup-right-panel { display: none; }
          .auth-right { padding: 48px 28px; order: 1; }
          .auth-fields-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
      />

      <div className="auth-root">
        {/* Form panel (left on signup) */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            {submitted ? (
              <motion.div
                className="auth-success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="auth-success-ring">
                  <Check
                    width={28}
                    height={28}
                    strokeWidth={1.5}
                    color="#C9A84C"
                  />
                </div>
                <div className="auth-success-title">Account created.</div>
                <div className="auth-success-sub">
                  Welcome to Prestige. Your first collection is on us — schedule
                  your pickup to get started.
                </div>
                <a
                  href="/schedule"
                  style={{
                    marginTop: 8,
                    color: "var(--gold-light)",
                    fontSize: 13,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Schedule Pickup →
                </a>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="auth-form-eyebrow">
                    <span className="auth-form-eyebrow-line" />
                    Create Account
                  </div>
                  <h1 className="auth-form-title">
                    Join <em>Prestige</em>
                  </h1>
                  <p className="auth-form-sub">
                    Start with a free account. No card required.
                  </p>
                </motion.div>

                {/* Google */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <button type="button" className="auth-google-btn">
                    <span className="auth-google-icon">
                      <img
                        src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                        width={18}
                        height={18}
                        alt="Google"
                        style={{ display: "block" }}
                      />
                    </span>
                    Sign up with Google
                  </button>
                  <div className="auth-divider">
                    <span className="auth-divider-line" />
                    <span className="auth-divider-text">or</span>
                    <span className="auth-divider-line" />
                  </div>
                </motion.div>

                <motion.form
                  onSubmit={handleSubmit}
                  noValidate
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.18 }}
                >
                  <div className="auth-fields">
                    {/* Name row */}
                    <div className="auth-fields-row">
                      <div className="auth-field">
                        <label htmlFor="firstName" className="auth-label">
                          First Name
                        </label>
                        <GoldInput
                          id="firstName"
                          type="text"
                          placeholder="James"
                          value={form.firstName}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              firstName: e.target.value,
                            }))
                          }
                          required
                        />
                        {errors.firstName && (
                          <p className="auth-error">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="auth-field">
                        <label htmlFor="lastName" className="auth-label">
                          Last Name
                        </label>
                        <GoldInput
                          id="lastName"
                          type="text"
                          placeholder="Dunmore"
                          value={form.lastName}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, lastName: e.target.value }))
                          }
                          required
                        />
                        {errors.lastName && (
                          <p className="auth-error">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="auth-field">
                      <label htmlFor="email" className="auth-label">
                        Email Address
                      </label>
                      <GoldInput
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        required
                      />
                      {errors.email && (
                        <p className="auth-error">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                      <label htmlFor="password" className="auth-label">
                        Password
                      </label>
                      <GoldInput
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={form.password}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, password: e.target.value }))
                        }
                        required
                      />
                      <PasswordStrength password={form.password} />
                      {errors.password && (
                        <p className="auth-error">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm */}
                    <div className="auth-field">
                      <label htmlFor="confirm" className="auth-label">
                        Confirm Password
                      </label>
                      <GoldInput
                        id="confirm"
                        type="password"
                        placeholder="Repeat your password"
                        value={form.confirm}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, confirm: e.target.value }))
                        }
                        required
                      />
                      {errors.confirm && (
                        <p className="auth-error">{errors.confirm}</p>
                      )}
                    </div>
                  </div>

                  {/* Agree */}
                  <div className="auth-agree-row">
                    <button
                      type="button"
                      className={`auth-checkbox-btn ${form.agree ? "auth-checkbox-btn--checked" : ""}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, agree: !f.agree }))
                      }
                      aria-checked={form.agree}
                      role="checkbox"
                    >
                      {form.agree && (
                        <Check
                          width={10}
                          height={10}
                          strokeWidth={3}
                          color="#1A1712"
                        />
                      )}
                    </button>
                    <label className="auth-agree-label">
                      I agree to the <a href="/terms">Terms of Service</a> and{" "}
                      <a href="/privacy">Privacy Policy</a>
                    </label>
                  </div>
                  {errors.agree && (
                    <p
                      className="auth-error"
                      style={{ marginTop: -16, marginBottom: 16 }}
                    >
                      {errors.agree}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="auth-btn-spinner" />
                        Creating account…
                      </>
                    ) : (
                      <>
                        Create Account{" "}
                        <ArrowRight
                          width={14}
                          height={14}
                          strokeWidth={1.5}
                          className="auth-arrow"
                        />
                      </>
                    )}
                  </button>
                </motion.form>

                <motion.p
                  className="auth-switch"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Already have an account? <a href="/auth/login">Sign in →</a>
                </motion.p>
              </>
            )}
          </div>
        </div>

        {/* Visual panel (right on signup) */}
        <RightPanel />
      </div>
    </>
  );
}
