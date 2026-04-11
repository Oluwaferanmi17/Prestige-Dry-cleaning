"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Shirt,
  RefreshCw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "request" | "sent" | "reset" | "done";

// ─── Shared Input with gold radial hover glow ─────────────────────────────────

function GoldInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  required,
  autoFocus,
}: {
  id: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoFocus?: boolean;
}) {
  const [glowing, setGlowing] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const bg = useMotionTemplate`radial-gradient(
    ${glowing ? "130px" : "0px"} circle at ${mouseX}px ${mouseY}px,
    rgba(201,168,76,0.32),
    transparent 80%
  )`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  }

  const resolvedType =
    type === "password" ? (showPw ? "text" : "password") : type;

  return (
    <motion.div
      style={{ background: bg }}
      onMouseMove={handleMove}
      onMouseEnter={() => setGlowing(true)}
      onMouseLeave={() => setGlowing(false)}
      className="fp-input-wrap"
    >
      <div className="fp-input-inner">
        <input
          id={id}
          name={id}
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoFocus={autoFocus}
          className="fp-input"
          autoComplete={
            type === "email"
              ? "email"
              : type === "password"
                ? "new-password"
                : "off"
          }
        />
        {type === "password" && (
          <button
            type="button"
            className="fp-pw-toggle"
            onClick={() => setShowPw((p) => !p)}
            aria-label="Toggle password visibility"
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

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ["request", "sent", "reset", "done"];
  const active = steps.indexOf(step);

  return (
    <div className="fp-stepdots">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`fp-stepdot ${i <= active ? "fp-stepdot--active" : ""} ${
            i === active ? "fp-stepdot--current" : ""
          }`}
        />
      ))}
    </div>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special char", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const barColors = ["#3E3830", "#B45050", "#C9A84C", "#C9A84C", "#4AA06C"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="fp-strength">
      <div className="fp-strength-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="fp-strength-bar"
            style={{
              background:
                i < score ? barColors[score] : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
      <span className="fp-strength-label" style={{ color: barColors[score] }}>
        {labels[score]}
      </span>
      <div className="fp-strength-checks">
        {checks.map((c) => (
          <div
            key={c.label}
            className={`fp-strength-check ${c.pass ? "fp-strength-check--pass" : ""}`}
          >
            <Check width={9} height={9} strokeWidth={3} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Animated background ornament ────────────────────────────────────────────

function OrnamentGrid() {
  return (
    <div className="fp-ornament" aria-hidden>
      {/* SVG diagonal grid lines */}
      <svg
        className="fp-ornament-svg"
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diagonal lines */}
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={`d${i}`}
            x1={-100 + i * 70}
            y1={0}
            x2={-100 + i * 70 + 500}
            y2={800}
            stroke="rgba(201,168,76,0.04)"
            strokeWidth="1"
          />
        ))}
        {/* Horizontal hairlines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 72}
            x2={600}
            y2={i * 72}
            stroke="rgba(201,168,76,0.03)"
            strokeWidth="1"
          />
        ))}
        {/* Corner flourish — top right */}
        <path
          d="M480 0 L600 0 L600 120"
          stroke="rgba(201,168,76,0.18)"
          strokeWidth="1"
          fill="none"
        />
        {/* Corner flourish — bottom left */}
        <path
          d="M0 680 L0 800 L120 800"
          stroke="rgba(201,168,76,0.18)"
          strokeWidth="1"
          fill="none"
        />
        {/* Central medallion outline */}
        <circle
          cx="300"
          cy="400"
          r="220"
          stroke="rgba(201,168,76,0.05)"
          strokeWidth="1"
          strokeDasharray="6 10"
        />
        <circle
          cx="300"
          cy="400"
          r="160"
          stroke="rgba(201,168,76,0.04)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

// ─── STEP 1 — Request reset ───────────────────────────────────────────────────

function StepRequest({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      setMessage(data.message);
      onSubmit(email);
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      key="request"
      className="fp-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="fp-step-icon-wrap">
        <div className="fp-step-icon">
          <KeyRound width={22} height={22} strokeWidth={1.2} color="#C9A84C" />
        </div>
      </div>

      <h2 className="fp-step-title">
        Forgotten your
        <br />
        <em>password?</em>
      </h2>
      <p className="fp-step-sub">
        No trouble. Enter your registered email and we&apos;ll send a secure
        reset link to your inbox within seconds.
      </p>

      <form onSubmit={handleSubmit} noValidate className="fp-form">
        <div className="fp-field">
          <label htmlFor="fp-email" className="fp-label">
            Email Address
          </label>
          <GoldInput
            id="fp-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          {error && <p className="fp-error">{error}</p>}
        </div>

        <button type="submit" className="fp-btn-primary" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
          <ArrowRight
            width={14}
            height={14}
            strokeWidth={1.5}
            className="fp-btn-arrow"
          />
        </button>
      </form>
      {message && <p className="fp-success">{message}</p>}
      <a href="/auth/login" className="fp-back-link">
        <ArrowLeft width={12} height={12} strokeWidth={1.5} />
        Back to sign in
      </a>
    </motion.div>
  );
}

// ─── STEP 2 — Email sent ──────────────────────────────────────────────────────

function StepSent({
  email,
  onContinue,
  onResend,
}: {
  email: string;
  onContinue: () => void;
  onResend: () => void;
}) {
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  function handleResend() {
    if (countdown > 0) return;
    setResent(true);
    setCountdown(30);
    onResend();
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  return (
    <motion.div
      key="sent"
      className="fp-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Animated mail envelope */}
      <div className="fp-mail-visual">
        <motion.div
          className="fp-mail-envelope"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Mail width={28} height={28} strokeWidth={1} color="#C9A84C" />
          <motion.div
            className="fp-mail-dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.5,
              type: "spring",
              stiffness: 400,
            }}
          />
        </motion.div>
        {/* Radiating rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="fp-mail-ring"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1 + i * 0.35, opacity: 0 }}
            transition={{
              duration: 1.8,
              delay: 0.3 + i * 0.25,
              repeat: Infinity,
              repeatDelay: 1.2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <h2 className="fp-step-title">
        Check your
        <br />
        <em>inbox.</em>
      </h2>
      <p className="fp-step-sub">
        We&apos;ve sent a reset link to{" "}
        <span className="fp-email-highlight">{email}</span>.<br />
        It expires in 15 minutes.
      </p>

      {/* What to do next */}
      <div className="fp-checklist">
        {[
          "Open the email from Prestige",
          "Click the secure reset link",
          "Choose a new password",
        ].map((item, i) => (
          <motion.div
            key={item}
            className="fp-checklist-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
          >
            <div className="fp-checklist-num">{i + 1}</div>
            <span>{item}</span>
          </motion.div>
        ))}
      </div>

      {/* CTA — simulate clicking the link */}
      <button type="button" className="fp-btn-primary" onClick={onContinue}>
        I&apos;ve clicked the link
        <ArrowRight
          width={14}
          height={14}
          strokeWidth={1.5}
          className="fp-btn-arrow"
        />
      </button>

      {/* Resend */}
      <div className="fp-resend-row">
        <span className="fp-resend-label">Didn&apos;t receive it?</span>
        <button
          type="button"
          className={`fp-resend-btn ${countdown > 0 ? "fp-resend-btn--disabled" : ""}`}
          onClick={handleResend}
          disabled={countdown > 0}
        >
          {resent && countdown > 0 ? (
            <>
              <RefreshCw width={11} height={11} strokeWidth={2} />
              Resend in {countdown}s
            </>
          ) : (
            <>
              <RefreshCw width={11} height={11} strokeWidth={2} />
              {resent ? "Resend again" : "Resend email"}
            </>
          )}
        </button>
      </div>

      <a href="/auth/login" className="fp-back-link">
        <ArrowLeft width={12} height={12} strokeWidth={1.5} />
        Back to sign in
      </a>
    </motion.div>
  );
}

// ─── STEP 3 — New password ────────────────────────────────────────────────────

function StepReset({ onSubmit }: { onSubmit: () => void }) {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  function validate() {
    const e: Record<string, string> = {};
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Must be at least 8 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password)
      e.confirm = "Passwords do not match";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    if (!token) {
      setErrors({ password: "Invalid or missing reset token" });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ password: data.message || "Something went wrong" });
        return;
      }

      // ✅ success → go to next step
      onSubmit();
    } catch (err) {
      setErrors({ password: "Network error. Try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      key="reset"
      className="fp-step"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="fp-step-icon-wrap">
        <div className="fp-step-icon">
          <KeyRound width={22} height={22} strokeWidth={1.2} color="#C9A84C" />
        </div>
      </div>

      <h2 className="fp-step-title">
        Choose a new
        <br />
        <em>password.</em>
      </h2>
      <p className="fp-step-sub">
        Make it strong. Your account security matters.
      </p>

      <form onSubmit={handleSubmit} noValidate className="fp-form">
        <div className="fp-field">
          <label htmlFor="fp-newpw" className="fp-label">
            New Password
          </label>
          <GoldInput
            id="fp-newpw"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            required
            autoFocus
          />
          <PasswordStrength password={form.password} />
          {errors.password && <p className="fp-error">{errors.password}</p>}
        </div>

        <div className="fp-field" style={{ marginTop: 8 }}>
          <label htmlFor="fp-confirmpw" className="fp-label">
            Confirm Password
          </label>
          <GoldInput
            id="fp-confirmpw"
            type="password"
            placeholder="Repeat your new password"
            value={form.confirm}
            onChange={(e) =>
              setForm((f) => ({ ...f, confirm: e.target.value }))
            }
            required
          />
          {/* Match indicator */}
          {form.confirm && form.password && (
            <motion.p
              className={`fp-match ${form.confirm === form.password ? "fp-match--ok" : "fp-match--no"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {form.confirm === form.password ? (
                <>
                  <Check width={10} height={10} strokeWidth={3} /> Passwords
                  match
                </>
              ) : (
                "Passwords don't match yet"
              )}
            </motion.p>
          )}
          {errors.confirm && !form.confirm && (
            <p className="fp-error">{errors.confirm}</p>
          )}
        </div>

        <button type="submit" className="fp-btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="fp-spinner" />
              Updating password…
            </>
          ) : (
            <>
              Set New Password
              <ArrowRight
                width={14}
                height={14}
                strokeWidth={1.5}
                className="fp-btn-arrow"
              />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}

// ─── STEP 4 — Done ────────────────────────────────────────────────────────────

function StepDone() {
  return (
    <motion.div
      key="done"
      className="fp-step fp-step--center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="fp-done-ring"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <Check width={32} height={32} strokeWidth={1.5} color="#C9A84C" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="fp-step-title" style={{ textAlign: "center" }}>
          Password
          <br />
          <em>reset.</em>
        </h2>
        <p
          className="fp-step-sub"
          style={{ textAlign: "center", margin: "0 auto 36px" }}
        >
          Your password has been updated successfully. You can now sign in with
          your new credentials.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        style={{ width: "100%" }}
      >
        <a href="/auth/login" className="fp-btn-primary fp-btn-link">
          Sign in to your account
          <ArrowRight
            width={14}
            height={14}
            strokeWidth={1.5}
            className="fp-btn-arrow"
          />
        </a>
      </motion.div>

      <motion.p
        className="fp-done-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        For your security, all other sessions have been signed out.
      </motion.p>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");

  function handleRequest(submittedEmail: string) {
    setEmail(submittedEmail);
    setStep("sent");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Root ── */
        .fp-root {
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
          background: var(--ink);
          font-family: 'DM Sans', sans-serif;
          color: var(--cream);
          display: grid;
          grid-template-columns: 1fr 1fr;
          position: relative;
          overflow: hidden;
        }

        /* ── Left — ornamental panel ── */
        .fp-ornamental {
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

        /* Grain */
        .fp-ornamental::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px; opacity: 0.04;
          pointer-events: none; z-index: 0;
        }

        /* Central glow */
        .fp-ornamental::after {
          content: '';
          position: absolute;
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          pointer-events: none; z-index: 0;
        }

        /* Ornament SVG */
        .fp-ornament {
          position: absolute; inset: 0;
          z-index: 0; pointer-events: none;
          overflow: hidden;
        }
        .fp-ornament-svg {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        /* Logo */
        .fp-logo {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 14px;
        }
        .fp-logo-ring {
          width: 52px; height: 52px; border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
        }
        .fp-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 400;
          color: var(--cream); letter-spacing: 0.03em;
        }
        .fp-logo-tagline {
          font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--gold);
          font-weight: 300; margin-top: 2px;
        }

        /* Central visual content */
        .fp-ornamental-body {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 20px;
        }
        .fp-ornamental-eyebrow {
          font-size: 11px; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--gold);
          font-weight: 300; display: flex; align-items: center; gap: 8px;
        }
        .fp-ornamental-eyebrow-line {
          width: 24px; height: 1px; background: var(--gold);
        }
        .fp-ornamental-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 3.6vw, 58px);
          font-weight: 300; line-height: 1.05; color: var(--cream);
        }
        .fp-ornamental-title em { font-style: italic; color: var(--gold-light); }
        .fp-ornamental-sub {
          font-size: 14px; color: var(--mist);
          font-weight: 300; line-height: 1.75; max-width: 340px;
        }

        /* Security features list */
        .fp-security-list {
          display: flex; flex-direction: column; gap: 12px; margin-top: 8px;
        }
        .fp-security-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .fp-security-item:hover { border-color: var(--border-hover); }
        .fp-security-mark {
          font-size: 12px; color: var(--gold);
          margin-top: 1px; flex-shrink: 0; width: 18px; text-align: center;
        }
        .fp-security-text {}
        .fp-security-title {
          font-size: 13px; font-weight: 500; color: var(--cream);
          margin-bottom: 2px;
        }
        .fp-security-desc {
          font-size: 12px; color: var(--mist);
          font-weight: 300; line-height: 1.5;
        }

        /* Bottom note */
        .fp-ornamental-footer {
          position: relative; z-index: 1;
          font-size: 11px; color: #4A4238;
          font-weight: 300; letter-spacing: 0.06em;
          border-top: 1px solid var(--border); padding-top: 20px;
        }

        /* ── Right — form panel ── */
        .fp-panel {
          display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          padding: 64px 56px;
          min-height: 100vh; overflow-y: auto;
        }

        .fp-inner {
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column;
          align-items: stretch;
        }

        /* Step dots */
        .fp-stepdots {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 48px;
        }
        .fp-stepdot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          transition: all 0.3s;
        }
        .fp-stepdot--active { background: rgba(201,168,76,0.4); }
        .fp-stepdot--current {
          width: 24px; border-radius: 3px;
          background: var(--gold) !important;
        }

        /* Step container */
        .fp-step {
          display: flex; flex-direction: column;
          align-items: flex-start; gap: 0;
        }
        .fp-step--center { align-items: center; }

        /* Step icon */
        .fp-step-icon-wrap { margin-bottom: 28px; }
        .fp-step-icon {
          width: 56px; height: 56px;
          border: 1px solid rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
        }

        /* Step typography */
        .fp-step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px; font-weight: 300;
          color: var(--cream); line-height: 1.05;
          margin-bottom: 14px;
        }
        .fp-step-title em { font-style: italic; color: var(--gold-light); }
        .fp-step-sub {
          font-size: 14px; color: var(--mist);
          font-weight: 300; line-height: 1.7;
          max-width: 360px; margin-bottom: 36px;
        }

        /* Form */
        .fp-form { display: flex; flex-direction: column; gap: 0; width: 100%; }
        .fp-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .fp-label {
          font-size: 11px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--mist); font-weight: 400;
        }
        .fp-error { font-size: 11px; color: #B45050; margin-top: 4px; }

        /* Input */
        .fp-input-wrap { padding: 1.5px; transition: background 0.3s; }
        .fp-input-inner {
          position: relative; background: var(--input-bg);
          border: 1px solid var(--border);
        }
        .fp-input-inner:focus-within { border-color: rgba(201,168,76,0.45); }
        .fp-input {
          width: 100%; background: transparent;
          border: none; outline: none;
          color: var(--cream); font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 300; padding: 13px 16px;
        }
        .fp-input::placeholder { color: #3E3830; }
        .fp-pw-toggle {
          position: absolute; top: 50%; right: 14px;
          transform: translateY(-50%);
          background: none; border: none; color: var(--mist);
          cursor: pointer; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .fp-pw-toggle:hover { color: var(--gold-light); }

        /* Password strength */
        .fp-strength { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
        .fp-strength-bars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
        .fp-strength-bar { height: 3px; border-radius: 2px; transition: background 0.3s; }
        .fp-strength-label {
          font-size: 11px; text-align: right; font-weight: 400; transition: color 0.3s;
        }
        .fp-strength-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
        .fp-strength-check {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #4A4238; font-weight: 300; transition: color 0.2s;
        }
        .fp-strength-check--pass { color: #4AA06C; }

        /* Password match */
        .fp-match {
          font-size: 11px; margin-top: 6px;
          display: flex; align-items: center; gap: 5px;
        }
        .fp-match--ok { color: #4AA06C; }
        .fp-match--no { color: var(--mist); }

        /* Primary button */
        .fp-btn-primary {
          width: 100%;
          background: var(--gold); color: var(--ink);
          border: none; padding: 15px 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.16em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: filter 0.2s, transform 0.15s;
          margin-bottom: 20px; text-decoration: none;
        }
        .fp-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .fp-btn-primary:active { transform: scale(0.99); }
        .fp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .fp-btn-link { display: flex; }
        .fp-btn-arrow { transition: transform 0.2s; }
        .fp-btn-primary:hover .fp-btn-arrow { transform: translateX(4px); }

        /* Spinner */
        .fp-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(26,23,18,0.3);
          border-top-color: var(--ink);
          border-radius: 50%;
          animation: fpSpin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* Back link */
        .fp-back-link {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--mist);
          text-decoration: none; transition: color 0.2s;
        }
        .fp-back-link:hover { color: var(--gold-light); }

        /* Email highlight */
        .fp-email-highlight {
          color: var(--gold-light); font-weight: 400; word-break: break-all;
        }

        /* Checklist */
        .fp-checklist {
          display: flex; flex-direction: column; gap: 8px;
          margin-bottom: 32px; width: 100%;
        }
        .fp-checklist-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          font-size: 13px; color: var(--mist); font-weight: 300;
        }
        .fp-checklist-num {
          width: 22px; height: 22px; border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.3);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: var(--gold); font-weight: 400;
          flex-shrink: 0;
        }

        /* Resend row */
        .fp-resend-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 28px;
        }
        .fp-resend-label { font-size: 13px; color: var(--mist); font-weight: 300; }
        .fp-resend-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--gold-light);
          display: flex; align-items: center; gap: 5px;
          transition: color 0.2s; padding: 0;
        }
        .fp-resend-btn:hover { color: var(--gold); }
        .fp-resend-btn--disabled { color: var(--mist) !important; cursor: default; }

        /* Mail visual */
        .fp-mail-visual {
          position: relative;
          width: 80px; height: 80px;
          margin-bottom: 28px;
          display: flex; align-items: center; justify-content: center;
        }
        .fp-mail-envelope {
          width: 68px; height: 68px;
          border: 1px solid rgba(201,168,76,0.35);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
        }
        .fp-mail-dot {
          position: absolute; top: 12px; right: 12px;
          width: 10px; height: 10px; border-radius: 50%;
          background: #4AA06C;
        }
        .fp-mail-ring {
          position: absolute; inset: 0;
          border: 1px solid rgba(201,168,76,0.3);
          border-radius: 0;
        }

        /* Done screen */
        .fp-done-ring {
          width: 80px; height: 80px;
          border: 1px solid var(--gold);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
        }
        .fp-done-note {
          font-size: 11px; color: #4A4238;
          text-align: center; font-style: italic;
          margin-top: 12px; line-height: 1.6; font-weight: 300;
        }

        /* ── Animations ── */
        @keyframes fpSpin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .fp-root { grid-template-columns: 1fr; }
          .fp-ornamental { display: none; }
          .fp-panel { padding: 48px 28px; }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
      />

      <div className="fp-root">
        {/* ── Left ornamental panel ── */}
        <aside className="fp-ornamental">
          <OrnamentGrid />

          {/* Logo */}
          <motion.div
            className="fp-logo"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="fp-logo-ring">
              <Shirt width={24} height={24} strokeWidth={1} color="#C9A84C" />
            </div>
            <div>
              <div className="fp-logo-name">Prestige</div>
              <div className="fp-logo-tagline">Dry Cleaning</div>
            </div>
          </motion.div>

          {/* Central copy */}
          <motion.div
            className="fp-ornamental-body"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="fp-ornamental-eyebrow">
              <span className="fp-ornamental-eyebrow-line" />
              Account Security
            </div>
            <h2 className="fp-ornamental-title">
              Your account,
              <br />
              <em>protected.</em>
            </h2>
            <p className="fp-ornamental-sub">
              We take the security of your account seriously. Our reset process
              is designed to be fast, safe, and seamless.
            </p>

            <div className="fp-security-list">
              {[
                {
                  icon: "◈",
                  title: "Encrypted link",
                  desc: "Each reset link uses a one-time secure token that expires after 15 minutes",
                },
                {
                  icon: "◇",
                  title: "Session invalidation",
                  desc: "All existing sessions are signed out once a new password is set",
                },
                {
                  icon: "○",
                  title: "Audit trail",
                  desc: "Password changes are logged with time and device for your records",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="fp-security-item"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.4 + i * 0.1 }}
                >
                  <span className="fp-security-mark">{item.icon}</span>
                  <div className="fp-security-text">
                    <div className="fp-security-title">{item.title}</div>
                    <div className="fp-security-desc">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="fp-ornamental-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Need help? Contact us at{" "}
            <span style={{ color: "var(--mist)" }}>
              support@prestigeclean.co.uk
            </span>
          </motion.div>
        </aside>

        {/* ── Right form panel ── */}
        <main className="fp-panel">
          <div className="fp-inner">
            <StepDots step={step} />

            <AnimatePresence mode="wait">
              {step === "request" && <StepRequest onSubmit={handleRequest} />}
              {step === "sent" && (
                <StepSent
                  email={email}
                  onContinue={() => setStep("reset")}
                  onResend={() => console.log("Resending to", email)}
                />
              )}
              {step === "reset" && (
                <StepReset onSubmit={() => setStep("done")} />
              )}
              {step === "done" && <StepDone />}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
