"use client";

import React, { useState } from "react";
import {
  MapPin,
  ArrowRight,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Shirt,
  Wind,
  Sparkles,
  Layers,
  Scissors,
  Home,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  label: string;
  description: string;
  price: string;
  icon: React.ReactNode;
}

interface TimeSlot {
  id: string;
  label: string;
  available: boolean;
}

interface FormState {
  pickupAddress: string;
  deliveryAddress: string;
  sameAsPickup: boolean;
  serviceType: string;
  date: Date | null;
  timeSlot: string;
  notes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES: ServiceOption[] = [
  {
    id: "wash-fold",
    label: "Wash & Fold",
    description: "Everyday laundry, fresh & folded",
    price: "From £12",
    icon: <Shirt width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "dry-clean",
    label: "Dry Clean",
    description: "Suits, dresses & delicates",
    price: "From £18",
    icon: <Wind width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "press-only",
    label: "Press Only",
    description: "Crisp finish, no wash",
    price: "From £8",
    icon: <Sparkles width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "household",
    label: "Household",
    description: "Bedding, curtains & linens",
    price: "From £22",
    icon: <Layers width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "alterations",
    label: "Alterations",
    description: "Tailoring & repairs",
    price: "From £15",
    icon: <Scissors width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "leather",
    label: "Leather & Suede",
    description: "Specialist leather care",
    price: "From £35",
    icon: <Home width={20} height={20} strokeWidth={1.5} />,
  },
];

const TIME_SLOTS: TimeSlot[] = [
  { id: "08-10", label: "8:00 – 10:00 am", available: true },
  { id: "10-12", label: "10:00 – 12:00 pm", available: true },
  { id: "12-14", label: "12:00 – 2:00 pm", available: false },
  { id: "14-16", label: "2:00 – 4:00 pm", available: true },
  { id: "16-18", label: "4:00 – 6:00 pm", available: true },
  { id: "18-20", label: "6:00 – 8:00 pm", available: false },
];

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  // shift so week starts Monday (0=Mon … 6=Sun)
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isPast(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SchedulePickup() {
  const today = new Date();

  const [form, setForm] = useState<FormState>({
    pickupAddress: "",
    deliveryAddress: "",
    sameAsPickup: false,
    serviceType: "",
    date: null,
    timeSlot: "",
    notes: "",
  });

  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [submitted, setSubmitted] = useState(false);

  const cells = getDaysInMonth(calYear, calMonth);

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const selectedService = SERVICES.find((s) => s.id === form.serviceType);

  // ── Submitted confirmation screen ────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Fonts />
        <div className="sp-root">
          <div className="sp-confirm">
            <div className="sp-confirm-icon">
              <Check width={28} height={28} strokeWidth={2} color="#C9A84C" />
            </div>
            <h2 className="sp-confirm-title">Booking Confirmed</h2>
            <p className="sp-confirm-sub">
              We&apos;ll send a confirmation to your email. Our driver will
              arrive during your chosen slot.
            </p>
            <div className="sp-confirm-details">
              {form.date && (
                <div className="sp-confirm-row">
                  <span className="sp-confirm-label">Date</span>
                  <span className="sp-confirm-val">
                    {form.date.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              )}
              {form.timeSlot && (
                <div className="sp-confirm-row">
                  <span className="sp-confirm-label">Time</span>
                  <span className="sp-confirm-val">
                    {TIME_SLOTS.find((t) => t.id === form.timeSlot)?.label}
                  </span>
                </div>
              )}
              {selectedService && (
                <div className="sp-confirm-row">
                  <span className="sp-confirm-label">Service</span>
                  <span className="sp-confirm-val">
                    {selectedService.label}
                  </span>
                </div>
              )}
              {form.pickupAddress && (
                <div className="sp-confirm-row">
                  <span className="sp-confirm-label">Pickup</span>
                  <span className="sp-confirm-val">{form.pickupAddress}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="sp-btn-primary"
              onClick={() => setSubmitted(false)}
            >
              Schedule Another
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <>
      <Fonts />
      <div className="sp-root">
        {/* ── Page header ── */}
        <header className="sp-header">
          <div className="sp-header-inner">
            <div className="sp-eyebrow">
              <span className="sp-eyebrow-line" />
              <span>Schedule a Pickup</span>
            </div>
            <h1 className="sp-page-title">
              Your Garments,
              <br />
              <em>Collected.</em>
            </h1>
            <p className="sp-page-sub">
              Free same-day collection when booked before noon. Returned fresh,
              pressed, and ready to wear.
            </p>
          </div>
        </header>

        {/* ── Form layout ── */}
        <form className="sp-form" onSubmit={handleSubmit} noValidate>
          <div className="sp-grid">
            {/* ── LEFT: Address + Service + Notes ── */}
            <div className="sp-col">
              {/* Section: Addresses */}
              <section className="sp-section">
                <div className="sp-section-label">
                  <MapPin width={14} height={14} strokeWidth={1.5} />
                  Collection &amp; Delivery
                </div>

                <div className="sp-field">
                  <label className="sp-label" htmlFor="pickup">
                    Pickup Address
                  </label>
                  <input
                    id="pickup"
                    type="text"
                    className="sp-input"
                    placeholder="Enter your full address"
                    value={form.pickupAddress}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pickupAddress: e.target.value }))
                    }
                    required
                    autoComplete="street-address"
                  />
                </div>

                <label className="sp-checkbox-row">
                  <span
                    className={`sp-checkbox ${form.sameAsPickup ? "sp-checkbox--checked" : ""}`}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        sameAsPickup: !f.sameAsPickup,
                        deliveryAddress: !f.sameAsPickup
                          ? f.pickupAddress
                          : f.deliveryAddress,
                      }))
                    }
                    role="checkbox"
                    aria-checked={form.sameAsPickup}
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === " " &&
                      setForm((f) => ({ ...f, sameAsPickup: !f.sameAsPickup }))
                    }
                  >
                    {form.sameAsPickup && (
                      <Check
                        width={10}
                        height={10}
                        strokeWidth={3}
                        color="#1A1712"
                      />
                    )}
                  </span>
                  <span className="sp-checkbox-label">
                    Deliver back to same address
                  </span>
                </label>

                {!form.sameAsPickup && (
                  <div className="sp-field sp-field--animated">
                    <label className="sp-label" htmlFor="delivery">
                      Delivery Address
                    </label>
                    <input
                      id="delivery"
                      type="text"
                      className="sp-input"
                      placeholder="Enter delivery address"
                      value={form.deliveryAddress}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          deliveryAddress: e.target.value,
                        }))
                      }
                      autoComplete="street-address"
                    />
                  </div>
                )}
              </section>

              {/* Section: Service Type */}
              <section className="sp-section">
                <div className="sp-section-label">
                  <Sparkles width={14} height={14} strokeWidth={1.5} />
                  Service Type
                </div>
                <div className="sp-services-grid">
                  {SERVICES.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      className={`sp-service-card ${form.serviceType === svc.id ? "sp-service-card--active" : ""}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, serviceType: svc.id }))
                      }
                    >
                      <div className="sp-service-icon">{svc.icon}</div>
                      <div className="sp-service-label">{svc.label}</div>
                      <div className="sp-service-desc">{svc.description}</div>
                      <div className="sp-service-price">{svc.price}</div>
                      {form.serviceType === svc.id && (
                        <div className="sp-service-check">
                          <Check
                            width={10}
                            height={10}
                            strokeWidth={3}
                            color="#1A1712"
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Section: Notes */}
              <section className="sp-section">
                <div className="sp-section-label">
                  <Layers width={14} height={14} strokeWidth={1.5} />
                  Special Instructions
                </div>
                <div className="sp-field">
                  <label className="sp-label" htmlFor="notes">
                    Notes for our team{" "}
                    <span className="sp-optional">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    className="sp-textarea"
                    placeholder="e.g. fragile beading on gown, stain on left lapel, handle with care…"
                    rows={4}
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                  <div className="sp-char-count">{form.notes.length} / 300</div>
                </div>
              </section>
            </div>

            {/* ── RIGHT: Calendar + Time ── */}
            <div className="sp-col">
              {/* Section: Date picker */}
              <section className="sp-section">
                <div className="sp-section-label">
                  <Calendar width={14} height={14} strokeWidth={1.5} />
                  Pickup Date
                </div>

                <div className="sp-calendar">
                  {/* Calendar nav */}
                  <div className="sp-cal-nav">
                    <button
                      type="button"
                      className="sp-cal-nav-btn"
                      onClick={prevMonth}
                      aria-label="Previous month"
                    >
                      <ChevronLeft width={16} height={16} strokeWidth={1.5} />
                    </button>
                    <span className="sp-cal-month">
                      {MONTHS[calMonth]} {calYear}
                    </span>
                    <button
                      type="button"
                      className="sp-cal-nav-btn"
                      onClick={nextMonth}
                      aria-label="Next month"
                    >
                      <ChevronRight width={16} height={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Day headers */}
                  <div className="sp-cal-days-header">
                    {DAYS.map((d) => (
                      <div key={d} className="sp-cal-day-name">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Date grid */}
                  <div className="sp-cal-grid">
                    {cells.map((date, i) => {
                      if (!date)
                        return (
                          <div
                            key={`empty-${i}`}
                            className="sp-cal-cell sp-cal-cell--empty"
                          />
                        );
                      const past = isPast(date);
                      const isToday = isSameDay(date, today);
                      const selected = form.date
                        ? isSameDay(date, form.date)
                        : false;
                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          disabled={past}
                          className={[
                            "sp-cal-cell",
                            past ? "sp-cal-cell--past" : "",
                            isToday ? "sp-cal-cell--today" : "",
                            selected ? "sp-cal-cell--selected" : "",
                          ].join(" ")}
                          onClick={() =>
                            !past && setForm((f) => ({ ...f, date }))
                          }
                          aria-label={date.toLocaleDateString()}
                          aria-pressed={selected}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Section: Time slot */}
              <section className="sp-section">
                <div className="sp-section-label">
                  <Clock width={14} height={14} strokeWidth={1.5} />
                  Pickup Window
                </div>
                <div className="sp-slots">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available}
                      className={[
                        "sp-slot",
                        !slot.available ? "sp-slot--unavailable" : "",
                        form.timeSlot === slot.id ? "sp-slot--active" : "",
                      ].join(" ")}
                      onClick={() =>
                        slot.available &&
                        setForm((f) => ({ ...f, timeSlot: slot.id }))
                      }
                    >
                      {slot.label}
                      {!slot.available && (
                        <span className="sp-slot-tag">Full</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Order summary ── */}
              {(form.serviceType || form.date || form.timeSlot) && (
                <div className="sp-summary">
                  <div className="sp-summary-title">Booking Summary</div>
                  {selectedService && (
                    <div className="sp-summary-row">
                      <span>{selectedService.label}</span>
                      <span className="sp-summary-price">
                        {selectedService.price}
                      </span>
                    </div>
                  )}
                  {form.date && (
                    <div className="sp-summary-row">
                      <span>
                        {form.date.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {form.timeSlot && (
                        <span className="sp-summary-time">
                          {
                            TIME_SLOTS.find((t) => t.id === form.timeSlot)
                              ?.label
                          }
                        </span>
                      )}
                    </div>
                  )}
                  <div className="sp-summary-divider" />
                  <div className="sp-summary-row sp-summary-row--note">
                    <span>Final price confirmed on collection</span>
                  </div>
                </div>
              )}

              {/* ── Submit ── */}
              <button type="submit" className="sp-btn-primary sp-btn-full">
                Confirm Booking
                <ArrowRight
                  width={16}
                  height={16}
                  strokeWidth={1.5}
                  className="sp-btn-arrow"
                />
              </button>

              <p className="sp-disclaimer">
                Free cancellation up to 2 hours before pickup. No card required
                to book.
              </p>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Root ── */
        .sp-root {
          --cream: #F5F0E8;
          --ink: #1A1712;
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: rgba(201,168,76,0.18);
          --mist: #8C8070;
          --card: #211D16;
          --card-hover: #2A2419;
          --border: rgba(201,168,76,0.14);
          --border-hover: rgba(201,168,76,0.35);
          --input-bg: #1E1A13;
          min-height: 100vh;
          background: var(--ink);
          font-family: 'DM Sans', sans-serif;
          color: var(--cream);
        }

        /* ── Header ── */
        .sp-header {
          padding: 80px 0 48px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 56px;
        }
        .sp-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .sp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          animation: spRise 0.7s ease forwards;
          opacity: 0;
        }
        .sp-eyebrow-line {
          width: 28px;
          height: 1px;
          background: var(--gold);
          display: block;
          flex-shrink: 0;
        }
        .sp-eyebrow span {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 400;
        }
        .sp-page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 5vw, 68px);
          font-weight: 300;
          line-height: 1.05;
          color: var(--cream);
          margin-bottom: 14px;
          animation: spRise 0.8s ease 0.1s forwards;
          opacity: 0;
        }
        .sp-page-title em {
          font-style: italic;
          color: var(--gold-light);
        }
        .sp-page-sub {
          font-size: 15px;
          color: var(--mist);
          font-weight: 300;
          max-width: 480px;
          line-height: 1.7;
          animation: spRise 0.8s ease 0.2s forwards;
          opacity: 0;
        }

        /* ── Form ── */
        .sp-form {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 40px 80px;
        }
        .sp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        .sp-col {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        /* ── Section ── */
        .sp-section { display: flex; flex-direction: column; gap: 16px; }
        .sp-section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 400;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        /* ── Field / Input ── */
        .sp-field { display: flex; flex-direction: column; gap: 8px; }
        .sp-field--animated { animation: spReveal 0.35s ease forwards; }
        .sp-label {
          font-size: 12px;
          letter-spacing: 0.06em;
          color: var(--mist);
          text-transform: uppercase;
          font-weight: 400;
        }
        .sp-optional { font-style: italic; text-transform: none; letter-spacing: 0; }
        .sp-input, .sp-textarea {
          background: var(--input-bg);
          border: 1px solid var(--border);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          padding: 14px 18px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
          resize: none;
        }
        .sp-input::placeholder, .sp-textarea::placeholder { color: #4A4238; }
        .sp-input:focus, .sp-textarea:focus {
          border-color: rgba(201,168,76,0.5);
          background: #221E16;
        }
        .sp-char-count {
          font-size: 11px;
          color: #4A4238;
          text-align: right;
          letter-spacing: 0.04em;
        }

        /* ── Checkbox row ── */
        .sp-checkbox-row {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }
        .sp-checkbox {
          width: 18px;
          height: 18px;
          border: 1px solid var(--border-hover);
          background: var(--input-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
          cursor: pointer;
          outline: none;
        }
        .sp-checkbox:focus-visible { border-color: var(--gold); }
        .sp-checkbox--checked { background: var(--gold); border-color: var(--gold); }
        .sp-checkbox-label { font-size: 13px; color: var(--mist); font-weight: 300; }

        /* ── Services grid ── */
        .sp-services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        .sp-service-card {
          background: var(--card);
          border: 1px solid var(--border);
          padding: 16px 14px;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          color: var(--cream);
        }
        .sp-service-card:hover {
          border-color: var(--border-hover);
          background: var(--card-hover);
        }
        .sp-service-card--active {
          border-color: var(--gold) !important;
          background: rgba(201,168,76,0.06) !important;
        }
        .sp-service-icon { color: var(--mist); margin-bottom: 2px; }
        .sp-service-card--active .sp-service-icon { color: var(--gold); }
        .sp-service-label { font-size: 13px; font-weight: 500; color: var(--cream); }
        .sp-service-desc { font-size: 11px; color: var(--mist); line-height: 1.4; font-weight: 300; }
        .sp-service-price {
          font-size: 11px;
          color: var(--gold);
          margin-top: 4px;
          letter-spacing: 0.04em;
          font-weight: 400;
        }
        .sp-service-check {
          position: absolute;
          top: 10px; right: 10px;
          width: 18px; height: 18px;
          background: var(--gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Calendar ── */
        .sp-calendar {
          background: var(--card);
          border: 1px solid var(--border);
          padding: 24px;
        }
        .sp-cal-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .sp-cal-nav-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--mist);
          width: 32px; height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .sp-cal-nav-btn:hover { border-color: var(--gold); color: var(--gold); }
        .sp-cal-month {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 400;
          color: var(--cream);
          letter-spacing: 0.04em;
        }
        .sp-cal-days-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 8px;
        }
        .sp-cal-day-name {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4A4238;
          text-align: center;
          padding: 6px 0;
          font-weight: 400;
        }
        .sp-cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 3px;
        }
        .sp-cal-cell {
          aspect-ratio: 1;
          background: none;
          border: 1px solid transparent;
          color: var(--cream);
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px;
        }
        .sp-cal-cell--empty { cursor: default; }
        .sp-cal-cell:not(.sp-cal-cell--past):not(.sp-cal-cell--empty):hover {
          border-color: var(--border-hover);
          background: rgba(201,168,76,0.06);
        }
        .sp-cal-cell--past { color: #3A3328; cursor: not-allowed; }
        .sp-cal-cell--today {
          border-color: var(--border-hover);
          color: var(--gold-light);
        }
        .sp-cal-cell--selected {
          background: var(--gold) !important;
          border-color: var(--gold) !important;
          color: var(--ink) !important;
          font-weight: 500 !important;
        }

        /* ── Time slots ── */
        .sp-slots {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .sp-slot {
          background: var(--card);
          border: 1px solid var(--border);
          color: var(--cream);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .sp-slot:hover:not(:disabled) { border-color: var(--border-hover); background: var(--card-hover); }
        .sp-slot--active {
          border-color: var(--gold) !important;
          background: rgba(201,168,76,0.06) !important;
          color: var(--gold-light) !important;
        }
        .sp-slot--unavailable { color: #3A3328 !important; cursor: not-allowed; }
        .sp-slot-tag {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3A3328;
          border: 1px solid #2E2820;
          padding: 2px 8px;
        }

        /* ── Summary ── */
        .sp-summary {
          background: var(--card);
          border: 1px solid var(--border);
          padding: 20px 24px;
          animation: spReveal 0.3s ease forwards;
        }
        .sp-summary-title {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 16px;
        }
        .sp-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          color: var(--mist);
          margin-bottom: 10px;
          font-weight: 300;
        }
        .sp-summary-row--note { font-size: 11px; color: #4A4238; font-style: italic; margin-bottom: 0; }
        .sp-summary-price { color: var(--gold); font-weight: 400; }
        .sp-summary-time { color: var(--cream); }
        .sp-summary-divider { height: 1px; background: var(--border); margin: 12px 0; }

        /* ── Submit button ── */
        .sp-btn-primary {
          background: var(--gold);
          color: var(--ink);
          border: none;
          padding: 18px 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.2s, filter 0.2s;
          position: relative;
          overflow: hidden;
        }
        .sp-btn-primary:hover { transform: translateY(-1px); filter: brightness(1.08); }
        .sp-btn-primary:active { transform: translateY(0) scale(0.99); }
        .sp-btn-full { width: 100%; justify-content: center; }
        .sp-btn-arrow { transition: transform 0.2s; }
        .sp-btn-primary:hover .sp-btn-arrow { transform: translateX(4px); }

        .sp-disclaimer {
          font-size: 12px;
          color: #4A4238;
          text-align: center;
          margin-top: 14px;
          line-height: 1.6;
          font-style: italic;
        }

        /* ── Confirmation ── */
        .sp-confirm {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 480px;
          margin: 0 auto;
          padding: 100px 40px;
          animation: spRise 0.7s ease forwards;
          opacity: 0;
        }
        .sp-confirm-icon {
          width: 72px; height: 72px;
          border: 1px solid var(--gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          background: rgba(201,168,76,0.06);
        }
        .sp-confirm-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 44px;
          font-weight: 300;
          color: var(--cream);
          margin-bottom: 16px;
        }
        .sp-confirm-sub {
          font-size: 15px;
          color: var(--mist);
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 40px;
        }
        .sp-confirm-details {
          width: 100%;
          border: 1px solid var(--border);
          background: var(--card);
          padding: 24px;
          margin-bottom: 40px;
          text-align: left;
        }
        .sp-confirm-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
          font-size: 13px;
        }
        .sp-confirm-row:last-child { border-bottom: none; }
        .sp-confirm-label { color: var(--mist); font-weight: 300; }
        .sp-confirm-val { color: var(--cream); font-weight: 400; text-align: right; max-width: 60%; }

        /* ── Animations ── */
        @keyframes spRise {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spReveal {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .sp-grid { grid-template-columns: 1fr; }
          .sp-header { padding: 60px 0 36px; }
          .sp-form, .sp-header-inner { padding-left: 24px; padding-right: 24px; }
          .sp-services-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 540px) {
          .sp-services-grid { grid-template-columns: 1fr; }
          .sp-slots { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

// ─── Font loader ──────────────────────────────────────────────────────────────

function Fonts() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
    />
  );
}
