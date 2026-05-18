"use client";
// import Image from "next/image";
import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { Eye, EyeOff, ArrowRight, Shirt } from "lucide-react";

// ─── Scoped Input with hover radial glow ──────────────────────────────────────

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
    rgba(201,168,76,0.35),
    transparent 80%
  )`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  }

  const inputType = type === "password" ? (showPw ? "text" : "password") : type;

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
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className="auth-input"
          autoComplete={
            type === "password"
              ? "current-password"
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

// ─── Ornamental left panel ────────────────────────────────────────────────────

function LeftPanel() {
  const items = [
    "Dry Cleaning",
    "Wash & Fold",
    "Alterations",
    "Leather Care",
    "Pressing",
    "Household Linens",
    "Evening Wear",
    "Bespoke Suits",
  ];

  return (
    <div className="auth-left">
      {/* Grain */}
      <div className="auth-grain" aria-hidden />

      {/* Radial glow */}
      <div className="auth-glow" aria-hidden />

      {/* Logo mark */}
      <motion.div
        className="auth-logomark"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-logomark-ring">
          <Shirt width={24} height={24} strokeWidth={1} color="#C9A84C" />
        </div>
      </motion.div>

      {/* Big serif headline */}
      <motion.div
        className="auth-left-headline"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="auth-headline-small">Est. 2010 · Lagos</span>
        <h2 className="auth-headline">
          Dressed to
          <br />
          <em>Perfection.</em>
        </h2>
        <p className="auth-headline-sub">
          Premium garment care, collected from your door and returned
          immaculate.
        </p>
      </motion.div>

      {/* Scrolling service strip */}
      <div className="auth-marquee-wrap" aria-hidden>
        <div className="auth-marquee-track">
          {[...items, ...items, ...items].map((item, i) => (
            <span key={i} className="auth-marquee-item">
              {item}
              <span className="auth-marquee-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Floating trust badges */}
      <motion.div
        className="auth-badges"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-badge">
          <span className="auth-badge-val">98%</span>
          <span className="auth-badge-label">Satisfaction</span>
        </div>
        <div className="auth-badge-divider" />
        <div className="auth-badge">
          <span className="auth-badge-val">36+</span>
          <span className="auth-badge-label">Years</span>
        </div>
        <div className="auth-badge-divider" />
        <div className="auth-badge">
          <span className="auth-badge-val">24h</span>
          <span className="auth-badge-label">Express</span>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
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
    // await new Promise((r) => setTimeout(r, 1200));
    // setLoading(false);
    // setSubmitted(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      localStorage.setItem("token", data.token);

      if (!res.ok) {
        setErrors({ general: data.message || "Login failed" });
        return;
      }

      console.log("User:", data.user);

      setSubmitted(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrors({ general: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

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

        /* ── Left panel ── */
        .auth-left {
          position: relative;
          background: #161210;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          overflow: hidden;
          min-height: 100vh;
        }
        .auth-grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px; opacity: 0.04; pointer-events: none; z-index: 0;
        }
        .auth-glow {
          position: absolute;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none; z-index: 0;
        }
        .auth-logomark {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 14px;
        }
        .auth-logomark-ring {
          width: 52px; height: 52px;
          border-radius: 50%;
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
          font-size: clamp(40px, 4vw, 64px);
          font-weight: 300; line-height: 1.05;
          color: var(--cream); margin-bottom: 18px;
        }
        .auth-headline em { font-style: italic; color: var(--gold-light); }
        .auth-headline-sub {
          font-size: 14px; color: var(--mist);
          font-weight: 300; line-height: 1.75;
          max-width: 320px;
        }

        /* Marquee */
        .auth-marquee-wrap {
          position: relative; z-index: 1;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .auth-marquee-track {
          display: flex; gap: 0;
          white-space: nowrap; width: max-content;
          animation: authScroll 28s linear infinite;
        }
        .auth-marquee-item {
          font-size: 11px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--mist);
          font-weight: 300; padding: 0 6px;
          display: inline-flex; align-items: center; gap: 10px;
        }
        .auth-marquee-dot { font-size: 7px; color: var(--gold); }

        /* Badges */
        .auth-badges {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }
        .auth-badge { display: flex; flex-direction: column; gap: 4px; }
        .auth-badge-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px; font-weight: 400;
          color: var(--cream); line-height: 1;
        }
        .auth-badge-label {
          font-size: 10px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--mist);
        }
        .auth-badge-divider { width: 1px; height: 40px; background: var(--border); }

        /* ── Right panel ── */
        .auth-right {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 64px 48px;
          min-height: 100vh;
        }
        .auth-form-wrap {
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column; gap: 0;
        }

        /* Form header */
        .auth-form-eyebrow {
          font-size: 11px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--gold);
          font-weight: 300; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .auth-form-eyebrow-line { width: 20px; height: 1px; background: var(--gold); }
        .auth-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px; font-weight: 300;
          color: var(--cream); line-height: 1.05;
          margin-bottom: 8px;
        }
        .auth-form-title em { font-style: italic; color: var(--gold-light); }
        .auth-form-sub {
          font-size: 14px; color: var(--mist);
          font-weight: 300; margin-bottom: 40px;
          line-height: 1.6;
        }

        /* Google button */
        .auth-google-btn {
          width: 100%;
          background: var(--card);
          border: 1px solid var(--border);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 300;
          padding: 13px 20px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer; margin-bottom: 24px;
          transition: border-color 0.2s, background 0.2s;
          letter-spacing: 0.03em;
        }
        .auth-google-btn:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.03); }
        .auth-google-icon {
          width: 18px; height: 18px;
          background: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; overflow: hidden;
        }
        .auth-divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px;
        }
        .auth-divider-line { flex: 1; height: 1px; background: var(--border); }
        .auth-divider-text { font-size: 11px; color: var(--mist); letter-spacing: 0.1em; }

        /* Fields */
        .auth-fields { display: flex; flex-direction: column; gap: 20px; margin-bottom: 28px; }
        .auth-field { display: flex; flex-direction: column; gap: 8px; }
        .auth-label {
          font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--mist);
          font-weight: 400;
        }
        .auth-input-wrap {
          padding: 1.5px;
          border-radius: 0;
          transition: background 0.3s;
        }
        .auth-input-inner {
          position: relative;
          background: var(--input-bg);
          border: 1px solid var(--border);
        }
        .auth-input {
          width: 100%; background: transparent;
          border: none; outline: none;
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300;
          padding: 13px 16px;
        }
        .auth-input::placeholder { color: #3E3830; }
        .auth-input:focus + .auth-pw-toggle,
        .auth-input:focus { outline: none; }
        .auth-input-inner:focus-within { border-color: rgba(201,168,76,0.45); }
        .auth-pw-toggle {
          position: absolute; top: 50%; right: 14px;
          transform: translateY(-50%);
          background: none; border: none;
          color: var(--mist); cursor: pointer;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .auth-pw-toggle:hover { color: var(--gold-light); }
        .auth-error { font-size: 11px; color: #B45050; margin-top: 4px; }

        /* Forgot */
        .auth-forgot-row {
          display: flex; justify-content: flex-end;
          margin-top: -12px; margin-bottom: 28px;
        }
        .auth-forgot {
          font-size: 12px; color: var(--mist);
          background: none; border: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: color 0.2s; letter-spacing: 0.04em;
        }
        .auth-forgot:hover { color: var(--gold-light); }

        /* Submit */
        .auth-submit {
          width: 100%;
          background: var(--gold);
          color: var(--ink);
          border: none;
          padding: 15px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: filter 0.2s, transform 0.15s;
          margin-bottom: 24px;
          position: relative; overflow: hidden;
        }
        .auth-submit:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .auth-submit:active { transform: scale(0.99); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .auth-btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(26,23,18,0.3);
          border-top-color: var(--ink);
          border-radius: 50%;
          animation: authSpin 0.7s linear infinite;
        }
        .auth-arrow { transition: transform 0.2s; }
        .auth-submit:hover .auth-arrow { transform: translateX(4px); }

        /* Switch */
        .auth-switch {
          text-align: center; font-size: 13px;
          color: var(--mist); font-weight: 300;
        }
        .auth-switch a, .auth-switch button {
          color: var(--gold-light);
          background: none; border: none;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 400;
          text-decoration: none; transition: color 0.2s;
        }
        .auth-switch a:hover, .auth-switch button:hover { color: var(--gold); }

        /* Success */
        .auth-success {
          display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 16px;
          animation: authRise 0.6s ease forwards;
        }
        .auth-success-ring {
          width: 64px; height: 64px;
          border-radius: 50%;
          border: 1px solid var(--gold);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
        }
        .auth-success-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px; font-weight: 300; color: var(--cream);
        }
        .auth-success-sub { font-size: 14px; color: var(--mist); font-weight: 300; }

        /* Animations */
        @keyframes authScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        @keyframes authRise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes authSpin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 860px) {
          .auth-root { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 48px 28px; }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
      />

      <div className="auth-root">
        <LeftPanel />

        <div className="auth-right">
          <div className="auth-form-wrap">
            {submitted ? (
              <motion.div
                className="auth-success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="auth-success-ring">✦</div>
                <div className="auth-success-title">Welcome back.</div>
                <div className="auth-success-sub">
                  Redirecting to your dashboard…
                </div>
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
                    Member Access
                  </div>
                  <h1 className="auth-form-title">
                    Sign <em>in</em>
                  </h1>
                  <p className="auth-form-sub">
                    Welcome back. Enter your details to continue.
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
                    Continue with Google
                  </button>
                  <div className="auth-divider">
                    <span className="auth-divider-line" />
                    <span className="auth-divider-text">or</span>
                    <span className="auth-divider-line" />
                  </div>
                </motion.div>

                {/* Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.18 }}
                  noValidate
                >
                  <div className="auth-fields">
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
                        placeholder="Your password"
                        value={form.password}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, password: e.target.value }))
                        }
                        required
                      />
                      {errors.password && (
                        <p className="auth-error">{errors.password}</p>
                      )}
                    </div>
                  </div>

                  <div className="auth-forgot-row">
                    <Link href="/auth/forgot-password">
                      <button type="button" className="auth-forgot">
                        Forgot password?
                      </button>
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="auth-btn-spinner" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Sign In{" "}
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
                  transition={{ delay: 0.35 }}
                >
                  Don&apos;t have an account?{" "}
                  <a href="/auth/signup">Create one →</a>
                </motion.p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
