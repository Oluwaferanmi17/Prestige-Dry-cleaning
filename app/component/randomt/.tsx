"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Layers,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Tag,
  Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceId =
  | "WASH_FOLD"
  | "DRY_CLEAN"
  | "PRESS_ONLY"
  | "HOUSEHOLD"
  | "ALTERATIONS"
  | "LEATHER_CARE";

type ItemId =
  | "shirt"
  | "suit"
  | "trousers"
  | "dress"
  | "coat"
  | "bedding"
  | "other";

type TimeSlot =
  | "SLOT_08_10"
  | "SLOT_10_12"
  | "SLOT_14_16"
  | "SLOT_16_18"
  | "SLOT_18_20";

// ─── Item definitions ─────────────────────────────────────────────────────────

interface ItemDef {
  id: ItemId;
  label: string;
  emoji: string;
  sublabel: string;
}

const ITEMS: ItemDef[] = [
  {
    id: "shirt",
    label: "Shirt / T-shirt",
    emoji: "👔",
    sublabel: "Dress shirts, casual tees, blouses",
  },
  {
    id: "suit",
    label: "Suit Jacket",
    emoji: "🧥",
    sublabel: "Blazers, jackets, waistcoats",
  },
  {
    id: "trousers",
    label: "Trousers / Jeans",
    emoji: "👖",
    sublabel: "Smart trousers, denim, chinos",
  },
  {
    id: "dress",
    label: "Dress / Skirt",
    emoji: "👗",
    sublabel: "Day dresses, evening wear, skirts",
  },
  {
    id: "coat",
    label: "Coat / Jacket",
    emoji: "🪭",
    sublabel: "Overcoats, puffer jackets, parkas",
  },
  {
    id: "bedding",
    label: "Bedding / Linen",
    emoji: "🛏️",
    sublabel: "Duvets, sheets, pillowcases, curtains",
  },
  {
    id: "other",
    label: "Other / Custom",
    emoji: "📦",
    sublabel: "Unlisted items — price confirmed by team",
  },
];

const EMPTY_QTYS: Record<ItemId, number> = {
  shirt: 0,
  suit: 0,
  trousers: 0,
  dress: 0,
  coat: 0,
  bedding: 0,
  other: 0,
};

// ─── Pricing matrix (pence / GBP) ────────────────────────────────────────────
// 0 = not applicable for that service

const PRICES: Record<ServiceId, Record<ItemId, number>> = {
  WASH_FOLD: {
    shirt: 350,
    suit: 800,
    trousers: 500,
    dress: 600,
    coat: 900,
    bedding: 1200,
    other: 500,
  },
  DRY_CLEAN: {
    shirt: 800,
    suit: 1800,
    trousers: 1200,
    dress: 1500,
    coat: 2200,
    bedding: 2500,
    other: 1000,
  },
  PRESS_ONLY: {
    shirt: 300,
    suit: 700,
    trousers: 400,
    dress: 500,
    coat: 700,
    bedding: 900,
    other: 350,
  },
  HOUSEHOLD: {
    shirt: 0,
    suit: 0,
    trousers: 0,
    dress: 0,
    coat: 0,
    bedding: 1200,
    other: 800,
  },
  ALTERATIONS: {
    shirt: 1200,
    suit: 2500,
    trousers: 1800,
    dress: 2200,
    coat: 2800,
    bedding: 1500,
    other: 1500,
  },
  LEATHER_CARE: {
    shirt: 0,
    suit: 3500,
    trousers: 2800,
    dress: 3000,
    coat: 4500,
    bedding: 0,
    other: 2000,
  },
};

// ─── Service definitions ──────────────────────────────────────────────────────

interface ServiceDef {
  id: ServiceId;
  label: string;
  sublabel: string;
  emoji: string;
  turnaround: string;
}

const SERVICES: ServiceDef[] = [
  {
    id: "WASH_FOLD",
    label: "Wash & Fold",
    sublabel: "Everyday laundry",
    emoji: "🫧",
    turnaround: "24h",
  },
  {
    id: "DRY_CLEAN",
    label: "Dry Clean",
    sublabel: "Delicates & formalwear",
    emoji: "🌬️",
    turnaround: "48h",
  },
  {
    id: "PRESS_ONLY",
    label: "Press Only",
    sublabel: "Crisp finish, no wash",
    emoji: "✨",
    turnaround: "24h",
  },
  {
    id: "HOUSEHOLD",
    label: "Household",
    sublabel: "Bedding & linens only",
    emoji: "🏠",
    turnaround: "48h",
  },
  {
    id: "ALTERATIONS",
    label: "Alterations",
    sublabel: "Tailoring & repairs",
    emoji: "✂️",
    turnaround: "5–7d",
  },
  {
    id: "LEATHER_CARE",
    label: "Leather & Suede",
    sublabel: "Specialist leather care",
    emoji: "👜",
    turnaround: "5–7d",
  },
];

const TIME_SLOTS: { id: TimeSlot; label: string; available: boolean }[] = [
  { id: "SLOT_08_10", label: "8:00 – 10:00 am", available: true },
  { id: "SLOT_10_12", label: "10:00 – 12:00 pm", available: true },
  { id: "SLOT_14_16", label: "2:00 – 4:00 pm", available: true },
  { id: "SLOT_16_18", label: "4:00 – 6:00 pm", available: true },
  { id: "SLOT_18_20", label: "6:00 – 8:00 pm", available: false },
];

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
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(y: number, m: number): (Date | null)[] {
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(y, m, d));
  return cells;
}
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const isPast = (d: Date) => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
};
const fmt = (p: number) => `£${(p / 100).toFixed(2)}`;

// ─── ItemRow ──────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  qty,
  price,
  unavailable,
  onInc,
  onDec,
}: {
  item: ItemDef;
  qty: number;
  price: number;
  unavailable: boolean;
  onInc: () => void;
  onDec: () => void;
}) {
  const isOther = item.id === "other";
  const hasPrice = price > 0 || isOther;
  const disabled = unavailable;

  return (
    <motion.div
      layout
      className={[
        "item-row",
        disabled ? "item-row--disabled" : "",
        qty > 0 ? "item-row--active" : "",
      ].join(" ")}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Emoji */}
      <span className="item-emoji" aria-hidden>
        {item.emoji}
      </span>

      {/* Info */}
      <div className="item-info">
        <div className="item-label">{item.label}</div>
        <div className="item-sub">
          {disabled ? (
            "Not available for this service"
          ) : isOther ? (
            "Price confirmed on collection"
          ) : hasPrice ? (
            <>
              <strong className="item-price">{fmt(price)}</strong> per item
            </>
          ) : (
            "Not available for this service"
          )}
        </div>
      </div>

      {/* Controls */}
      {disabled ? (
        <span className="item-na">N/A</span>
      ) : (
        <div className="item-controls">
          <button
            type="button"
            className="item-btn item-btn--dec"
            onClick={onDec}
            disabled={qty === 0}
            aria-label={`Remove ${item.label}`}
          >
            {qty === 1 ? (
              <Trash2 width={11} height={11} strokeWidth={2} />
            ) : (
              <Minus width={11} height={11} strokeWidth={2} />
            )}
          </button>

          <AnimatePresence mode="wait">
            <motion.span
              key={qty}
              className="item-qty"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.13 }}
            >
              {qty}
            </motion.span>
          </AnimatePresence>

          <button
            type="button"
            className="item-btn item-btn--inc"
            onClick={onInc}
            aria-label={`Add ${item.label}`}
          >
            <Plus width={11} height={11} strokeWidth={2} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── PriceBreakdown ───────────────────────────────────────────────────────────

function PriceBreakdown({
  qtys,
  service,
  total,
}: {
  qtys: Record<ItemId, number>;
  service: ServiceId;
  total: number;
}) {
  const lines = ITEMS.filter((it) => qtys[it.id] > 0).map((it) => ({
    ...it,
    qty: qtys[it.id],
    unit: PRICES[service][it.id],
    line: qtys[it.id] * PRICES[service][it.id],
  }));

  if (lines.length === 0) return null;

  return (
    <motion.div
      className="pb-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pb-head">
        <Tag width={11} height={11} strokeWidth={1.5} />
        Price Breakdown
      </div>

      <div className="pb-lines">
        {lines.map((li, i) => (
          <motion.div
            key={li.id}
            className="pb-line"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: i * 0.05 }}
          >
            <span className="pb-line-left">
              <span className="pb-line-emoji">{li.emoji}</span>
              {li.label}
              <span className="pb-line-qty">×{li.qty}</span>
            </span>
            <span className="pb-line-right">
              {li.unit === 0 ? (
                <span className="pb-tbc">TBC</span>
              ) : (
                fmt(li.line)
              )}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="pb-sep" />

      <div className="pb-total-row">
        <span className="pb-total-label">Estimated Total</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={total}
            className="pb-total-val"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{
              duration: 0.18,
              type: "spring",
              stiffness: 500,
              damping: 32,
            }}
          >
            {fmt(total)}
          </motion.span>
        </AnimatePresence>
      </div>

      {lines.some((l) => l.unit === 0) && (
        <p className="pb-note">
          <Info width={9} height={9} strokeWidth={1.5} />
          TBC items are priced by our team on collection.
        </p>
      )}
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SchedulePickup() {
  const today = new Date();

  // Form state
  const [service, setService] = useState<ServiceId | "">("");
  const [qtys, setQtys] = useState<Record<ItemId, number>>({ ...EMPTY_QTYS });
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [sameAddr, setSameAddr] = useState(false);
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<TimeSlot | "">("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Calendar navigation
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const cells = getDaysInMonth(calYear, calMonth);
  const prevM = () =>
    calMonth === 0
      ? (setCalMonth(11), setCalYear((y) => y - 1))
      : setCalMonth((m) => m - 1);
  const nextM = () =>
    calMonth === 11
      ? (setCalMonth(0), setCalYear((y) => y + 1))
      : setCalMonth((m) => m + 1);

  // Item controls
  const inc = (id: ItemId) => setQtys((q) => ({ ...q, [id]: q[id] + 1 }));
  const dec = (id: ItemId) =>
    setQtys((q) => ({ ...q, [id]: Math.max(0, q[id] - 1) }));

  // Live pricing
  const { total, totalItems } = useMemo(() => {
    if (!service) return { total: 0, totalItems: 0 };
    let t = 0,
      n = 0;
    ITEMS.forEach((it) => {
      const q = qtys[it.id];
      if (q > 0) {
        t += q * PRICES[service][it.id];
        n += q;
      }
    });
    return { total: t, totalItems: n };
  }, [service, qtys]);

  function validate() {
    const e: Record<string, string> = {};
    if (!pickup.trim()) e.pickup = "Pickup address is required";
    if (!sameAddr && !delivery.trim())
      e.delivery = "Delivery address is required";
    if (!service) e.service = "Select a service";
    if (totalItems === 0) e.items = "Add at least one item";
    if (!date) e.date = "Select a pickup date";
    if (!slot) e.slot = "Select a time slot";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
  }

  function reset() {
    setService("");
    setQtys({ ...EMPTY_QTYS });
    setPickup("");
    setDelivery("");
    setSameAddr(false);
    setDate(null);
    setSlot("");
    setNotes("");
    setSubmitted(false);
  }

  // ─── Success screen ───────────────────────────────────────────────────────

  if (submitted) {
    const svcLabel = SERVICES.find((s) => s.id === service)?.label ?? "";
    const slotLabel = TIME_SLOTS.find((t) => t.id === slot)?.label ?? "";
    return (
      <>
        <style>{CSS}</style>
        <div className="sp-root sp-root--center">
          <motion.div
            className="success-card"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="success-ring"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.6,
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
            >
              <Check width={30} height={30} strokeWidth={1.5} color="#C9A84C" />
            </motion.div>

            <h2 className="success-title">
              Booking <em>Confirmed</em>
            </h2>
            <p className="success-sub">
              We'll send a confirmation to your email. Our driver will arrive
              during your chosen window.
            </p>

            <div className="success-summary">
              {[
                ["Service", svcLabel],
                [
                  "Date",
                  date?.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }) ?? "",
                ],
                ["Window", slotLabel],
                ["Items", `${totalItems} item${totalItems !== 1 ? "s" : ""}`],
              ].map(([k, v]) => (
                <div key={k} className="success-row">
                  <span>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div className="success-row success-row--total">
                <span>Estimated Total</span>
                <span>{fmt(total)}</span>
              </div>
            </div>

            <button
              type="button"
              className="sp-btn sp-btn--gold sp-btn--full"
              onClick={reset}
            >
              Schedule Another
              <ArrowRight width={13} height={13} strokeWidth={1.5} />
            </button>
            <a href="/dashboard" className="success-back">
              ← Back to dashboard
            </a>
          </motion.div>
        </div>
      </>
    );
  }

  // ─── Main form ────────────────────────────────────────────────────────────

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
      />
      <style>{CSS}</style>

      <div className="sp-root">
        {/* ── Header ── */}
        <header className="sp-header">
          <motion.div
            className="sp-container"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="sp-eyebrow">
              <span className="sp-eyebrow-line" />
              Schedule a Pickup
            </p>
            <h1 className="sp-title">
              Your Garments,
              <br />
              <em>Collected.</em>
            </h1>
            <p className="sp-sub">
              Free same-day collection when booked before noon. Prices update
              live as you add items.
            </p>
          </motion.div>
        </header>

        {/* ── 3-column grid ── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="sp-container sp-grid">
            {/* ════ COL 1 — Address + Service ════ */}
            <div className="sp-col">
              {/* Addresses */}
              <div className="sp-block">
                <div className="sp-block-label">
                  <MapPin width={12} height={12} strokeWidth={1.5} />
                  Collection &amp; Delivery
                </div>

                <div className="sp-field">
                  <label htmlFor="pickup" className="sp-label">
                    Pickup Address
                  </label>
                  <input
                    id="pickup"
                    className="sp-input"
                    autoComplete="street-address"
                    placeholder="Enter your full address"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                  />
                  {errors.pickup && <p className="sp-err">{errors.pickup}</p>}
                </div>

                <label className="sp-check-row">
                  <span
                    className={`sp-check${sameAddr ? " sp-check--on" : ""}`}
                    role="checkbox"
                    aria-checked={sameAddr}
                    tabIndex={0}
                    onClick={() => setSameAddr((v) => !v)}
                    onKeyDown={(e) => e.key === " " && setSameAddr((v) => !v)}
                  >
                    {sameAddr && (
                      <Check
                        width={9}
                        height={9}
                        strokeWidth={3}
                        color="#1A1712"
                      />
                    )}
                  </span>
                  <span className="sp-check-label">
                    Deliver back to same address
                  </span>
                </label>

                <AnimatePresence>
                  {!sameAddr && (
                    <motion.div
                      className="sp-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <label htmlFor="delivery" className="sp-label">
                        Delivery Address
                      </label>
                      <input
                        id="delivery"
                        className="sp-input"
                        autoComplete="street-address"
                        placeholder="Enter delivery address"
                        value={delivery}
                        onChange={(e) => setDelivery(e.target.value)}
                      />
                      {errors.delivery && (
                        <p className="sp-err">{errors.delivery}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Service */}
              <div className="sp-block">
                <div className="sp-block-label">
                  <Sparkles width={12} height={12} strokeWidth={1.5} />
                  Service Type
                </div>
                {errors.service && <p className="sp-err">{errors.service}</p>}
                <div className="svc-grid">
                  {SERVICES.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      className={`svc-card${service === svc.id ? " svc-card--on" : ""}`}
                      onClick={() => setService(svc.id)}
                    >
                      <span className="svc-emoji">{svc.emoji}</span>
                      <span className="svc-name">{svc.label}</span>
                      <span className="svc-sub">{svc.sublabel}</span>
                      <span className="svc-eta">{svc.turnaround}</span>
                      {service === svc.id && (
                        <span className="svc-tick">
                          <Check
                            width={8}
                            height={8}
                            strokeWidth={3}
                            color="#1A1712"
                          />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="sp-block">
                <div className="sp-block-label">
                  <Layers width={12} height={12} strokeWidth={1.5} />
                  Special Instructions
                </div>
                <div className="sp-field">
                  <label htmlFor="notes" className="sp-label">
                    Notes <span className="sp-optional">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    className="sp-textarea"
                    rows={3}
                    maxLength={300}
                    placeholder="e.g. fragile beading on gown, stain on collar, handle with care…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <span className="sp-char">{notes.length} / 300</span>
                </div>
              </div>
            </div>

            {/* ════ COL 2 — Items + live breakdown ════ */}
            <div className="sp-col">
              <div className="sp-block sp-block--sticky-header">
                <div className="sp-block-label">
                  <ShoppingBag width={12} height={12} strokeWidth={1.5} />
                  Add Items
                  {totalItems > 0 && (
                    <motion.span
                      className="items-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 28,
                      }}
                    >
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </motion.span>
                  )}
                </div>

                {/* Hint when no service selected */}
                <AnimatePresence>
                  {!service && (
                    <motion.div
                      className="items-hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Sparkles
                        width={22}
                        height={22}
                        strokeWidth={1}
                        color="rgba(201,168,76,0.35)"
                      />
                      <p>Select a service to see per-item pricing.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.items && <p className="sp-err">{errors.items}</p>}

                {/* Items list */}
                <div className="items-list">
                  {ITEMS.map((item) => {
                    const price = service ? PRICES[service][item.id] : 0;
                    const unavailable =
                      !!service && price === 0 && item.id !== "other";
                    return (
                      <ItemRow
                        key={item.id}
                        item={item}
                        qty={qtys[item.id]}
                        price={price}
                        unavailable={unavailable}
                        onInc={() => inc(item.id)}
                        onDec={() => dec(item.id)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Live price breakdown — appears when items added */}
              <AnimatePresence>
                {service && totalItems > 0 && (
                  <PriceBreakdown
                    qtys={qtys}
                    service={service as ServiceId}
                    total={total}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* ════ COL 3 — Date + Time + Summary ════ */}
            <div className="sp-col">
              {/* Calendar */}
              <div className="sp-block">
                <div className="sp-block-label">
                  <Calendar width={12} height={12} strokeWidth={1.5} />
                  Pickup Date
                </div>
                {errors.date && <p className="sp-err">{errors.date}</p>}

                <div className="cal-wrap">
                  <div className="cal-nav">
                    <button
                      type="button"
                      className="cal-nav-btn"
                      onClick={prevM}
                    >
                      <ChevronLeft width={14} height={14} strokeWidth={1.5} />
                    </button>
                    <span className="cal-month">
                      {MONTHS[calMonth]} {calYear}
                    </span>
                    <button
                      type="button"
                      className="cal-nav-btn"
                      onClick={nextM}
                    >
                      <ChevronRight width={14} height={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="cal-day-names">
                    {DAYS.map((d) => (
                      <div key={d} className="cal-day-name">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="cal-grid">
                    {cells.map((dt, i) => {
                      if (!dt) return <div key={`e${i}`} />;
                      const past = isPast(dt);
                      const sel = date ? sameDay(dt, date) : false;
                      const tod = sameDay(dt, today);
                      return (
                        <button
                          key={dt.toISOString()}
                          type="button"
                          disabled={past}
                          className={[
                            "cal-cell",
                            past ? "cal-cell--past" : "",
                            tod ? "cal-cell--today" : "",
                            sel ? "cal-cell--sel" : "",
                          ].join(" ")}
                          onClick={() => !past && setDate(dt)}
                        >
                          {dt.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time slots */}
              <div className="sp-block">
                <div className="sp-block-label">
                  <Clock width={12} height={12} strokeWidth={1.5} />
                  Pickup Window
                </div>
                {errors.slot && <p className="sp-err">{errors.slot}</p>}
                <div className="slots-list">
                  {TIME_SLOTS.map((ts) => (
                    <button
                      key={ts.id}
                      type="button"
                      disabled={!ts.available}
                      className={[
                        "slot",
                        !ts.available ? "slot--full" : "",
                        slot === ts.id ? "slot--on" : "",
                      ].join(" ")}
                      onClick={() => ts.available && setSlot(ts.id)}
                    >
                      <span className="slot-label">{ts.label}</span>
                      {!ts.available ? (
                        <span className="slot-tag slot-tag--full">Full</span>
                      ) : slot === ts.id ? (
                        <Check
                          width={12}
                          height={12}
                          strokeWidth={2}
                          color="#C9A84C"
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Order summary card ── */}
              <div className="summary-card">
                <div className="summary-title">Order Summary</div>

                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Service</span>
                    <span>
                      {service ? (
                        SERVICES.find((s) => s.id === service)?.label
                      ) : (
                        <em>Not selected</em>
                      )}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Items</span>
                    <span>
                      {totalItems > 0 ? (
                        `${totalItems} item${totalItems !== 1 ? "s" : ""}`
                      ) : (
                        <em>None yet</em>
                      )}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Date</span>
                    <span>
                      {date ? (
                        date.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      ) : (
                        <em>Not selected</em>
                      )}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span>Window</span>
                    <span>
                      {slot ? (
                        TIME_SLOTS.find((t) => t.id === slot)?.label
                      ) : (
                        <em>Not selected</em>
                      )}
                    </span>
                  </div>
                </div>

                <div className="summary-sep" />

                {/* Animated total */}
                <div className="summary-total">
                  <span className="summary-total-label">Estimated Total</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={total}
                      className="summary-total-val"
                      initial={{ y: -12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 12, opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        type: "spring",
                        stiffness: 480,
                        damping: 30,
                      }}
                    >
                      {total > 0 ? fmt(total) : "—"}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  className="sp-btn sp-btn--gold sp-btn--full"
                >
                  Confirm Booking
                  <ArrowRight
                    width={13}
                    height={13}
                    strokeWidth={1.5}
                    className="sp-btn-arrow"
                  />
                </button>

                <p className="summary-disclaimer">
                  Free cancellation up to 2 hours before pickup. No card
                  required to book.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

.sp-root{
  --cream:#F5F0E8;--ink:#1A1712;--gold:#C9A84C;--gold-l:#E8C97A;
  --mist:#8C8070;--card:#211D16;--card-h:#262118;
  --border:rgba(201,168,76,0.13);--bh:rgba(201,168,76,0.35);
  --ibg:#1E1A13;--red:#B45050;--green:#4AA06C;
  min-height:100vh;background:var(--ink);
  font-family:'DM Sans',sans-serif;color:var(--cream);
}
.sp-root--center{display:flex;align-items:center;justify-content:center;padding:48px 20px;}

/* container */
.sp-container{max-width:1200px;margin:0 auto;padding:0 40px;}

/* header */
.sp-header{padding:68px 0 44px;border-bottom:1px solid var(--border);margin-bottom:48px;}
.sp-eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);font-weight:300;margin-bottom:18px;}
.sp-eyebrow-line{width:22px;height:1px;background:var(--gold);flex-shrink:0;}
.sp-title{font-family:'Cormorant Garamond',serif;font-size:clamp(36px,4.2vw,62px);font-weight:300;color:var(--cream);line-height:1.05;margin-bottom:14px;}
.sp-title em{font-style:italic;color:var(--gold-l);}
.sp-sub{font-size:14px;color:var(--mist);font-weight:300;max-width:520px;line-height:1.75;}

/* 3-col grid */
.sp-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:36px;align-items:start;padding-bottom:80px;}
.sp-col{display:flex;flex-direction:column;gap:28px;}

/* blocks */
.sp-block{display:flex;flex-direction:column;gap:14px;}
.sp-block-label{display:inline-flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);font-weight:400;padding-bottom:12px;border-bottom:1px solid var(--border);}

/* fields */
.sp-field{display:flex;flex-direction:column;gap:7px;}
.sp-label{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--mist);font-weight:400;}
.sp-optional{font-style:italic;text-transform:none;letter-spacing:0;font-size:10px;}
.sp-err{font-size:11px;color:var(--red);}
.sp-input,.sp-textarea{
  background:var(--ibg);border:1px solid var(--border);
  color:var(--cream);font-family:'DM Sans',sans-serif;
  font-size:13px;font-weight:300;padding:11px 13px;
  outline:none;transition:border-color .2s;width:100%;resize:none;
}
.sp-input::placeholder,.sp-textarea::placeholder{color:#3A3428;}
.sp-input:focus,.sp-textarea:focus{border-color:rgba(201,168,76,.42);}
.sp-char{font-size:10px;color:#4A4238;text-align:right;}

/* checkbox */
.sp-check-row{display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;}
.sp-check{width:16px;height:16px;border:1px solid var(--bh);background:var(--ibg);display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;outline:none;transition:background .15s;}
.sp-check--on{background:var(--gold);border-color:var(--gold);}
.sp-check-label{font-size:12px;color:var(--mist);font-weight:300;}

/* service grid */
.svc-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;}
.svc-card{
  background:var(--card);border:1px solid var(--border);
  padding:11px 9px 9px;text-align:left;cursor:pointer;
  display:flex;flex-direction:column;gap:3px;
  font-family:'DM Sans',sans-serif;color:var(--cream);
  position:relative;transition:border-color .2s,background .2s;
}
.svc-card:hover{border-color:var(--bh);background:var(--card-h);}
.svc-card--on{border-color:var(--gold)!important;background:rgba(201,168,76,.06)!important;}
.svc-emoji{font-size:17px;margin-bottom:3px;display:block;}
.svc-name{font-size:11px;font-weight:500;color:var(--cream);}
.svc-sub{font-size:10px;color:var(--mist);font-weight:300;line-height:1.35;}
.svc-eta{font-size:10px;color:var(--gold);margin-top:4px;letter-spacing:.04em;}
.svc-tick{position:absolute;top:6px;right:6px;width:14px;height:14px;background:var(--gold);border-radius:50%;display:flex;align-items:center;justify-content:center;}

/* items */
.items-badge{margin-left:auto;background:rgba(201,168,76,.15);color:var(--gold);font-size:10px;padding:2px 8px;letter-spacing:.05em;}
.items-hint{display:flex;flex-direction:column;align-items:center;gap:10px;padding:28px 16px;background:rgba(255,255,255,.015);border:1px dashed rgba(201,168,76,.14);text-align:center;}
.items-hint p{font-size:13px;color:var(--mist);font-weight:300;line-height:1.6;}
.items-list{display:flex;flex-direction:column;gap:5px;}

.item-row{display:flex;align-items:center;gap:11px;padding:10px 13px;background:var(--card);border:1px solid var(--border);transition:border-color .2s,background .18s;}
.item-row:hover:not(.item-row--disabled){border-color:var(--bh);}
.item-row--active{border-color:rgba(201,168,76,.28);background:rgba(201,168,76,.035);}
.item-row--disabled{opacity:.32;pointer-events:none;}
.item-emoji{font-size:18px;flex-shrink:0;width:22px;text-align:center;line-height:1;}
.item-info{flex:1;min-width:0;}
.item-label{font-size:12px;font-weight:400;color:var(--cream);}
.item-sub{font-size:11px;color:var(--mist);font-weight:300;margin-top:1px;}
.item-price{color:var(--gold-l);font-weight:500;}
.item-na{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#3E3830;border:1px solid #2A2620;padding:2px 6px;flex-shrink:0;}
.item-controls{display:flex;align-items:center;flex-shrink:0;border:1px solid var(--border);}
.item-btn{width:26px;height:26px;background:none;border:none;color:var(--mist);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color .15s,background .15s;}
.item-btn:hover:not(:disabled){background:rgba(201,168,76,.1);color:var(--gold-l);}
.item-btn--dec:hover:not(:disabled){background:rgba(180,80,80,.1);color:var(--red);}
.item-btn:disabled{opacity:.25;cursor:not-allowed;}
.item-qty{width:26px;text-align:center;font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:400;color:var(--cream);display:flex;align-items:center;justify-content:center;}

/* price breakdown */
.pb-card{background:var(--card);border:1px solid rgba(201,168,76,.22);padding:18px 18px;}
.pb-head{display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);font-weight:400;margin-bottom:13px;}
.pb-lines{display:flex;flex-direction:column;gap:7px;}
.pb-line{display:flex;justify-content:space-between;align-items:center;font-size:12px;}
.pb-line-left{display:flex;align-items:center;gap:7px;color:var(--mist);font-weight:300;}
.pb-line-emoji{font-size:13px;width:16px;flex-shrink:0;}
.pb-line-qty{font-size:10px;color:#4A4238;margin-left:3px;}
.pb-line-right{font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:400;color:var(--cream);}
.pb-tbc{font-family:'DM Sans',sans-serif;font-size:11px;color:var(--mist);letter-spacing:.08em;}
.pb-sep{height:1px;background:var(--border);margin:13px 0;}
.pb-total-row{display:flex;justify-content:space-between;align-items:center;}
.pb-total-label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--mist);}
.pb-total-val{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;color:var(--gold-l);line-height:1;}
.pb-note{display:flex;align-items:flex-start;gap:6px;font-size:10px;color:#4A4238;font-style:italic;margin-top:10px;line-height:1.5;}

/* calendar */
.cal-wrap{background:var(--card);border:1px solid var(--border);padding:18px;}
.cal-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.cal-nav-btn{background:none;border:1px solid var(--border);color:var(--mist);width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .2s,color .2s;}
.cal-nav-btn:hover{border-color:var(--gold);color:var(--gold);}
.cal-month{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:400;color:var(--cream);}
.cal-day-names{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px;}
.cal-day-name{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#4A4238;text-align:center;padding:3px 0;}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.cal-cell{aspect-ratio:1;background:none;border:1px solid transparent;color:var(--cream);font-size:11px;font-family:'DM Sans',sans-serif;font-weight:300;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,background .15s;}
.cal-cell:not(.cal-cell--past):hover{border-color:var(--bh);background:rgba(201,168,76,.06);}
.cal-cell--past{color:#3A3328;cursor:not-allowed;}
.cal-cell--today{border-color:var(--bh);color:var(--gold-l);}
.cal-cell--sel{background:var(--gold)!important;border-color:var(--gold)!important;color:var(--ink)!important;font-weight:500!important;}

/* time slots */
.slots-list{display:flex;flex-direction:column;gap:6px;}
.slot{background:var(--card);border:1px solid var(--border);color:var(--cream);font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;padding:11px 13px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;transition:border-color .2s,background .2s;}
.slot:hover:not(:disabled){border-color:var(--bh);background:var(--card-h);}
.slot--on{border-color:var(--gold)!important;background:rgba(201,168,76,.06)!important;color:var(--gold-l)!important;}
.slot--full{color:#3A3328!important;cursor:not-allowed;}
.slot-label{flex:1;}
.slot-tag{font-size:9px;letter-spacing:.1em;text-transform:uppercase;padding:2px 6px;border:1px solid;}
.slot-tag--full{color:#3A3328;border-color:#2E2820;}

/* summary card */
.summary-card{background:var(--card);border:1px solid var(--border);padding:20px;display:flex;flex-direction:column;gap:0;}
.summary-title{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);font-weight:400;margin-bottom:16px;}
.summary-rows{display:flex;flex-direction:column;gap:10px;}
.summary-row{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:300;color:var(--mist);}
.summary-row span:last-child{color:var(--cream);font-weight:400;text-align:right;}
.summary-row em{color:#4A4238;font-style:italic;font-weight:300;}
.summary-sep{height:1px;background:var(--border);margin:16px 0;}
.summary-total{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.summary-total-label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--mist);}
.summary-total-val{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:600;color:var(--gold-l);line-height:1;}

/* button */
.sp-btn{background:none;border:none;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:9px;transition:filter .2s,transform .15s;padding:14px 24px;}
.sp-btn--gold{background:var(--gold);color:var(--ink);}
.sp-btn--gold:hover{filter:brightness(1.08);transform:translateY(-1px);}
.sp-btn--full{width:100%;justify-content:center;margin-bottom:12px;}
.sp-btn-arrow{transition:transform .2s;}
.sp-btn--gold:hover .sp-btn-arrow{transform:translateX(4px);}
.summary-disclaimer{font-size:11px;color:#4A4238;text-align:center;font-style:italic;line-height:1.6;}

/* success */
.success-card{max-width:480px;width:100%;display:flex;flex-direction:column;align-items:center;text-align:center;padding:48px 40px;background:var(--card);border:1px solid var(--border);}
.success-ring{width:76px;height:76px;border:1px solid var(--gold);background:rgba(201,168,76,.06);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:26px;}
.success-title{font-family:'Cormorant Garamond',serif;font-size:40px;font-weight:300;color:var(--cream);margin-bottom:12px;}
.success-title em{font-style:italic;color:var(--gold-l);}
.success-sub{font-size:14px;color:var(--mist);font-weight:300;line-height:1.7;margin-bottom:32px;}
.success-summary{width:100%;border:1px solid var(--border);padding:0 18px;margin-bottom:28px;text-align:left;}
.success-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;}
.success-row:last-child{border-bottom:none;}
.success-row span:first-child{color:var(--mist);font-weight:300;}
.success-row span:last-child{color:var(--cream);font-weight:400;}
.success-row--total span:last-child{color:var(--gold-l);font-family:'Cormorant Garamond',serif;font-size:18px;}
.success-back{font-size:12px;color:var(--mist);text-decoration:none;letter-spacing:.06em;transition:color .2s;margin-top:8px;}
.success-back:hover{color:var(--gold-l);}

/* responsive */
@media(max-width:1060px){.sp-grid{grid-template-columns:1fr 1fr;}.sp-col:last-child{grid-column:1/-1;}}
@media(max-width:680px){.sp-grid{grid-template-columns:1fr;}.sp-container{padding:0 20px;}.svc-grid{grid-template-columns:1fr 1fr 1fr;}}
@media(max-width:420px){.svc-grid{grid-template-columns:1fr 1fr;}}
`;
