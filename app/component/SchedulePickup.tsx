/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
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
  Info,
  Tag,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  label: string;
  description: string;
  // price: string;
  icon: React.ReactNode;
  turnaround: string;
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
  qtys: Record<ItemId, number>;
}

type ItemId =
  | "shirt"
  | "suit"
  | "trousers"
  | "dress"
  | "coat"
  | "bedding"
  | "other";

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

const PRICES: Record<string, Record<ItemId, number>> = {
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

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICES: ServiceOption[] = [
  {
    id: "WASH_FOLD",
    label: "Wash & Fold",
    description: "Everyday laundry, fresh & folded",
    turnaround: "24h",
    icon: <Shirt width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "DRY_CLEAN",
    label: "Dry Clean",
    description: "Suits, dresses & delicates",
    turnaround: "48h",
    icon: <Wind width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "PRESS_ONLY",
    label: "Press Only",
    description: "Crisp finish, no wash",
    turnaround: "24h",
    icon: <Sparkles width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "HOUSEHOLD",
    label: "Household",
    description: "Bedding, curtains & linens",
    turnaround: "48h",
    icon: <Layers width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "ALTERATIONS",
    label: "Alterations",
    description: "Tailoring & repairs",
    turnaround: "5–7d",
    icon: <Scissors width={20} height={20} strokeWidth={1.5} />,
  },
  {
    id: "LEATHER",
    label: "Leather & Suede",
    description: "Specialist leather care",
    turnaround: "5–7d",
    icon: <Home width={20} height={20} strokeWidth={1.5} />,
  },
];

const TIME_SLOTS: TimeSlot[] = [
  { id: "SLOT_08_10", label: "8:00 – 10:00 am", available: true },
  { id: "SLOT_10_12", label: "10:00 – 12:00 pm", available: true },
  { id: "SLOT_14_16", label: "2:00 – 4:00 pm", available: true },
  { id: "SLOT_16_18", label: "4:00 – 6:00 pm", available: true },
  { id: "SLOT_18_20", label: "6:00 – 8:00 pm", available: true },
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
  // here under service
  qtys: Record<ItemId, number>;
  service: string;
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
    qtys: { ...EMPTY_QTYS },
  });

  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const inc = (id: ItemId) =>
    setForm((prev) => ({
      ...prev,
      qtys: {
        ...prev.qtys,
        [id]: (prev.qtys[id] || 0) + 1,
      },
    }));

  const dec = (id: ItemId) =>
    setForm((prev) => ({
      ...prev,
      qtys: {
        ...prev.qtys,
        [id]: Math.max(0, (prev.qtys[id] || 0) - 1),
      },
    }));

  // Live pricing
  const { total, totalItems } = useMemo(() => {
    if (!form.serviceType) return { total: 0, totalItems: 0 };

    let t = 0;
    let n = 0;

    ITEMS.forEach((it) => {
      const q = form.qtys[it.id] || 0;

      if (q > 0) {
        t += q * PRICES[form.serviceType][it.id];
        n += q;
      }
    });

    return { total: t, totalItems: n };
  }, [form.serviceType, form.qtys]);
  function validate() {
    const e: Record<string, string> = {};
    if (!form.pickupAddress.trim()) e.pickup = "Pickup address is required";
    if (!form.sameAsPickup && !form.deliveryAddress.trim())
      e.delivery = "Delivery address is required";
    if (!form.serviceType) e.service = "Select a service";
    if (totalItems === 0) e.items = "Add at least one item";
    if (!form.date) e.date = "Select a pickup date";
    if (!form.timeSlot) e.slot = "Select a time slot";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // ✅ Get token
      const token = localStorage.getItem("token");

      console.log("TOKEN:", token);

      if (!token) {
        throw new Error("Not authenticated");
      }

      // ✅ Create pickup address
      const pickupRes = await fetch("http://localhost:3000/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          line1: form.pickupAddress,
          city: "Abuja",
          postcode: "000000",
          country: "NG",
        }),
      });

      const pickupJson = await pickupRes.json();

      console.log("Pickup Response:", pickupJson);

      if (!pickupRes.ok) {
        throw new Error(
          pickupJson?.message ||
            pickupJson?.error ||
            "Failed to create pickup address",
        );
      }

      const pickupAddressId = pickupJson.data.id;

      // ✅ Delivery address
      let deliveryAddressId = pickupAddressId;

      if (!form.sameAsPickup) {
        const deliveryRes = await fetch("http://localhost:3000/api/addresses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            line1: form.deliveryAddress,
            city: "Abuja",
            postcode: "000000",
            country: "NG",
          }),
        });

        const deliveryJson = await deliveryRes.json();

        console.log("Delivery Response:", deliveryJson);

        if (!deliveryRes.ok) {
          throw new Error(
            deliveryJson?.message ||
              deliveryJson?.error ||
              "Failed to create delivery address",
          );
        }

        deliveryAddressId = deliveryJson.data.id;
      }

      // ✅ Calculate item count
      const itemCount = Object.values(form.qtys).reduce((a, b) => a + b, 0);

      // ✅ Create order
      const orderRes = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType: form.serviceType,
          pickupAddressId,
          deliveryAddressId,
          pickupDate: form.date!.toISOString(),
          pickupSlot: form.timeSlot,
          notes: form.notes,
          itemCount,
          itemBreakdown: form.qtys,
          estimatedPrice: total,
        }),
      });

      const orderJson = await orderRes.json();

      console.log("Order Response:", orderJson);

      if (!orderRes.ok) {
        throw new Error(
          orderJson?.message || orderJson?.error || "Failed to create order",
        );
      }

      // ✅ Success
      setSubmitted(true);
    } catch (err: any) {
      console.error("SUBMIT ERROR:", err);

      alert(err.message || "Something went wrong");
    }
  }
  const selectedService = SERVICES.find((s) => s.id === form.serviceType);
  function reset() {
    setForm({
      pickupAddress: "",
      deliveryAddress: "",
      sameAsPickup: false,
      serviceType: "",
      date: null,
      timeSlot: "",
      notes: "",
      qtys: { ...EMPTY_QTYS },
    });

    setErrors({});
    setSubmitted(false);
  }

  // ── Submitted confirmation screen ────────────────────────────────────────
  // if (submitted) {
  //   return (
  //     <>
  //       <Fonts />
  //       <div className="sp-root">
  //         <div className="sp-confirm">
  //           <div className="sp-confirm-icon">
  //             <Check width={28} height={28} strokeWidth={2} color="#C9A84C" />
  //           </div>
  //           <h2 className="sp-confirm-title">Booking Confirmed</h2>
  //           <p className="sp-confirm-sub">
  //             We&apos;ll send a confirmation to your email. Our driver will
  //             arrive during your chosen slot.
  //           </p>
  //           <div className="sp-confirm-details">
  //             {form.date && (
  //               <div className="sp-confirm-row">
  //                 <span className="sp-confirm-label">Date</span>
  //                 <span className="sp-confirm-val">
  //                   {form.date.toLocaleDateString("en-GB", {
  //                     weekday: "long",
  //                     day: "numeric",
  //                     month: "long",
  //                   })}
  //                 </span>
  //               </div>
  //             )}
  //             {form.timeSlot && (
  //               <div className="sp-confirm-row">
  //                 <span className="sp-confirm-label">Time</span>
  //                 <span className="sp-confirm-val">
  //                   {TIME_SLOTS.find((t) => t.id === form.timeSlot)?.label}
  //                 </span>
  //               </div>
  //             )}
  //             {selectedService && (
  //               <div className="sp-confirm-row">
  //                 <span className="sp-confirm-label">Service</span>
  //                 <span className="sp-confirm-val">
  //                   {selectedService.label}
  //                 </span>
  //               </div>
  //             )}
  //             {form.pickupAddress && (
  //               <div className="sp-confirm-row">
  //                 <span className="sp-confirm-label">Pickup</span>
  //                 <span className="sp-confirm-val">{form.pickupAddress}</span>
  //               </div>
  //             )}
  //           </div>
  //           <button
  //             type="button"
  //             className="sp-btn-primary"
  //             onClick={() => setSubmitted(false)}
  //           >
  //             Schedule Another
  //           </button>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

  if (submitted) {
    const svcLabel =
      SERVICES.find((s) => s.id === form.serviceType)?.label ?? "";

    const slotLabel =
      TIME_SLOTS.find((t) => t.id === form.timeSlot)?.label ?? "";

    return (
      <>
        {/* <style>{CSS}</style> */}
        <Fonts />

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
              We&apos;ll send a confirmation to your email. Our driver will
              arrive during your chosen window.
            </p>

            <div className="success-summary">
              {[
                ["Service", svcLabel],

                [
                  "Date",
                  form.date?.toLocaleDateString("en-GB", {
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

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <>
      <Fonts />
      <div className="sp-root">
        {/* ── Page header ── */}
        <header className="sp-header">
          <motion.div
            className="sp-header-inner"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </motion.div>
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

                <AnimatePresence>
                  {!form.sameAsPickup && (
                    <motion.div
                      className="sp-field sp-field--animated"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
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
                      <div className="sp-service-turnaround">
                        {svc.turnaround}
                      </div>
                      2
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
                  {!form.serviceType && (
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
                    const price = form.serviceType
                      ? PRICES[form.serviceType][item.id]
                      : 0;
                    const unavailable =
                      !!form.serviceType && price === 0 && item.id !== "other";
                    return (
                      <ItemRow
                        key={item.id}
                        item={item}
                        qty={form.qtys[item.id]}
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
                {form.serviceType && totalItems > 0 && (
                  <PriceBreakdown
                    qtys={form.qtys}
                    service={form.serviceType as string}
                    total={total}
                  />
                )}
              </AnimatePresence>
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
              <div className="sp-summary">
                <div className="sp-summary-title">Order sp-Summary</div>

                <div className="sp-summary-rows">
                  <div className="sp-summary-row">
                    <span>Service</span>

                    <span>
                      {form.serviceType ? (
                        SERVICES.find((s) => s.id === form.serviceType)?.label
                      ) : (
                        <em>Not selected</em>
                      )}
                    </span>
                  </div>

                  <div className="sp-summary-row">
                    <span>Items</span>

                    <span>
                      {totalItems > 0 ? (
                        `${totalItems} item${totalItems !== 1 ? "s" : ""}`
                      ) : (
                        <em>None yet</em>
                      )}
                    </span>
                  </div>

                  <div className="sp-summary-row">
                    <span>Date</span>

                    <span>
                      {form.date ? (
                        form.date.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      ) : (
                        <em>Not selected</em>
                      )}
                    </span>
                  </div>

                  <div className="sp-summary-row">
                    <span>Window</span>

                    <span>
                      {form.timeSlot ? (
                        TIME_SLOTS.find((t) => t.id === form.timeSlot)?.label
                      ) : (
                        <em>Not selected</em>
                      )}
                    </span>
                  </div>
                </div>

                <div className="sp-summary-sep" />

                {/* Animated total */}
                <div className="sp-summary-total">
                  <span className="sp-summary-total-label">
                    Estimated Total
                  </span>

                  <AnimatePresence mode="wait">
                    <motion.span
                      key={total}
                      className="sp-summary-total-val"
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
              </div>
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
        .sp-service-turnaround {
          // font-size: 11px;
          // color: var(--gold);
          // margin-top: 4px;
          // letter-spacing: 0.04em;
          // font-weight: 400;
          font-size:10px;color:var(--gold);margin-top:4px;letter-spacing:.04em;
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

   .sp-block{display:flex;flex-direction:column;gap:14px;}
.sp-block-label{display:inline-flex;align-items:center;gap:8px;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);font-weight:400;padding-bottom:12px;border-bottom:1px solid var(--border);}

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
        .sp-summary-turnaround { color: var(--gold); font-weight: 400; }
        .sp-summary-time { color: var(--cream); }
        .sp-summary-divider { height: 1px; background: var(--border); margin: 12px 0; }
.sp-summary-sep{height:1px;background:var(--border);margin:16px 0;}
.sp-summary-total{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;}
.sp-summary-total-label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--mist);}
.sp-summary-total-val{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:600;color:var(--gold-l);line-height:1;}

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
