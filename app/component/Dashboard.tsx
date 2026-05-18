/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Plus,
  //   ArrowRight,
  Shirt,
  Wind,
  Sparkles,
  Layers,
  Scissors,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Bell,
  ChevronRight,
  Calendar,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "Processing" | "Shipped" | "Out for Delivery" | "Delivered";

interface ActiveOrder {
  orderId: string;
  product: string;
  status: OrderStatus;
  eta: string;
}

interface RecentOrder {
  id: string;
  service: string;
  serviceId: string;
  date: string;
  items: number;
  total: string;
  status: "Completed" | "Cancelled" | "Processing";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// const ACTIVE_ORDERS: ActiveOrder[] = [
//   {
//     orderId: "4582",
//     product: "2× Suits, 1× Evening Gown",
//     status: "Out for Delivery",
//     eta: "Today, 4–6 pm",
//   },
//   {
//     orderId: "4571",
//     product: "Cashmere overcoat, 3× Shirts",
//     status: "Shipped",
//     eta: "Tomorrow, 10 am–12 pm",
//   },
//   {
//     orderId: "4563",
//     product: "Silk blouse, Linen trousers",
//     status: "Processing",
//     eta: "Thu, 14 Apr",
//   },
// ];

function formatStatus(status: string): OrderStatus {
  switch (status) {
    case "PENDING":
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "OUT_FOR_DELIVERY":
      return "Out for Delivery";
    case "DELIVERED":
      return "Delivered";
    default:
      return "Processing";
  }
}

function formatETA(date: string, slot: string) {
  const d = new Date(date);

  const formattedDate = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const slotMap: Record<string, string> = {
    SLOT_08_10: "8–10 am",
    SLOT_10_12: "10 am–12 pm",
    SLOT_14_16: "2–4 pm",
    SLOT_16_18: "4–6 pm",
    SLOT_18_20: "6–8 pm",
  };

  return `${formattedDate}, ${slotMap[slot] || ""}`;
}

// const RECENT_ORDERS: RecentOrder[] = [
//   {
//     id: "4551",
//     service: "Dry Clean",
//     serviceId: "dry-clean",
//     date: "28 Mar 2026",
//     items: 4,
//     total: "£74.00",
//     status: "Completed",
//   },
//   {
//     id: "4539",
//     service: "Wash & Fold",
//     serviceId: "wash-fold",
//     date: "21 Mar 2026",
//     items: 8,
//     total: "£36.00",
//     status: "Completed",
//   },
//   {
//     id: "4528",
//     service: "Alterations",
//     serviceId: "alterations",
//     date: "14 Mar 2026",
//     items: 2,
//     total: "£55.00",
//     status: "Completed",
//   },
//   {
//     id: "4512",
//     service: "Leather Care",
//     serviceId: "leather",
//     date: "6 Mar 2026",
//     items: 1,
//     total: "£45.00",
//     status: "Completed",
//   },
//   {
//     id: "4498",
//     service: "Press Only",
//     serviceId: "press-only",
//     date: "27 Feb 2026",
//     items: 5,
//     total: "£40.00",
//     status: "Cancelled",
//   },
// ];

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "dry-clean": <Wind width={14} height={14} strokeWidth={1.5} />,
  "wash-fold": <Shirt width={14} height={14} strokeWidth={1.5} />,
  alterations: <Scissors width={14} height={14} strokeWidth={1.5} />,
  leather: <Package width={14} height={14} strokeWidth={1.5} />,
  "press-only": <Sparkles width={14} height={14} strokeWidth={1.5} />,
  household: <Layers width={14} height={14} strokeWidth={1.5} />,
};

const STATUS_STEPS: OrderStatus[] = [
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

// ─── Parallax Card ────────────────────────────────────────────────────────────

function ParallaxOrderCard({
  order,
  index,
}: {
  order: ActiveOrder;
  index: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const translateZImg = useTransform(ySpring, [-0.5, 0.5], [-30, 30]);
  const translateZContent = useTransform(ySpring, [-0.5, 0.5], [20, -20]);
  const translateZProgress = useTransform(ySpring, [-0.5, 0.5], [30, -30]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const activeStep = STATUS_STEPS.indexOf(order.status);

  const statusColors: Record<
    OrderStatus,
    { bg: string; text: string; dot: string }
  > = {
    Processing: {
      bg: "rgba(140,128,112,0.15)",
      text: "#8C8070",
      dot: "#8C8070",
    },
    Shipped: { bg: "rgba(201,168,76,0.12)", text: "#C9A84C", dot: "#C9A84C" },
    "Out for Delivery": {
      bg: "rgba(201,168,76,0.22)",
      text: "#E8C97A",
      dot: "#E8C97A",
    },
    Delivered: { bg: "rgba(74,160,108,0.15)", text: "#4AA06C", dot: "#4AA06C" },
  };
  const sc = statusColors[order.status];

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: 0.15 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="db-card-outer"
    >
      <div
        className="db-card-inner"
        style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
      >
        {/* Icon visual */}
        <motion.div
          style={{ translateY: translateZImg }}
          className="db-card-visual"
        >
          <div className="db-card-truck-ring">
            <Truck width={28} height={28} strokeWidth={1.2} color="#C9A84C" />
          </div>
          <div className="db-card-order-num">#{order.orderId}</div>
        </motion.div>

        {/* Order info */}
        <motion.div
          style={{ translateY: translateZContent }}
          className="db-card-body"
        >
          <p className="db-card-product">{order.product}</p>
          <span
            className="db-card-badge"
            style={{ background: sc.bg, color: sc.text }}
          >
            <span className="db-card-dot" style={{ background: sc.dot }} />
            {order.status}
          </span>
          <div className="db-card-eta">
            <Clock width={11} height={11} strokeWidth={1.5} />
            {order.eta}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          style={{ translateY: translateZProgress }}
          className="db-card-progress"
        >
          <div className="db-progress-labels">
            {STATUS_STEPS.map((s, i) => (
              <span
                key={s}
                className={`db-progress-label ${i === activeStep ? "db-progress-label--active" : ""}`}
              >
                {s === "Out for Delivery" ? "Out for\nDelivery" : s}
              </span>
            ))}
          </div>
          <div className="db-progress-track">
            {STATUS_STEPS.map((_, i) => (
              <div
                key={i}
                className="db-progress-seg"
                style={{
                  background:
                    i <= activeStep ? "#C9A84C" : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  sub,
  delay,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub?: string;
  delay: number;
}) {
  return (
    <motion.div
      className="db-stat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="db-stat-icon">{icon}</div>
      <div className="db-stat-value">{value}</div>
      <div className="db-stat-label">{label}</div>
      {sub && <div className="db-stat-sub">{sub}</div>}
    </motion.div>
  );
}
const SERVICE_LABELS_FRONTEND: Record<string, string> = {
  WASH_FOLD: "Wash & Fold",
  DRY_CLEAN: "Dry Clean",
  PRESS_ONLY: "Press Only",
  HOUSEHOLD: "Household",
  ALTERATIONS: "Alterations",
  LEATHER_CARE: "Leather Care",
};
// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "cancelled">(
    "all",
  );
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders", {
          credentials: "include",
        });

        const data = await res.json();

        const orders = data.data.orders;

        // ACTIVE ORDERS
        const active = orders.filter(
          (o: any) => o.status !== "DELIVERED" && o.status !== "CANCELLED",
        );

        const mappedActive = active.map((o: any) => ({
          orderId: o.orderNumber,
          product: `${o.itemCount ?? 1} item(s)`,
          status: formatStatus(o.status),
          eta: formatETA(o.pickupDate, o.pickupSlot),
        }));

        setActiveOrders(mappedActive);

        // RECENT ORDERS
        const recent = orders.filter((o: any) =>
          ["DELIVERED", "CANCELLED"].includes(o.status),
        );

        const mappedRecent = recent.map((o: any) => ({
          id: o.orderNumber,

          service: SERVICE_LABELS_FRONTEND[o.serviceType] ?? "Laundry Service",

          serviceId: o.serviceType.toLowerCase().replace(/_/g, "-"),

          date: new Date(o.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),

          items: o.itemCount ?? 1,

          total: `${o.currency === "GBP" ? "£" : "$"}${Number(
            o.finalPrice ?? o.estimatedPrice ?? 0,
          ).toFixed(2)}`,

          status: o.status === "DELIVERED" ? "Completed" : "Cancelled",
        }));

        setRecentOrders(mappedRecent);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);
  const filteredOrders = recentOrders.filter((o) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return o.status === "Completed";
    if (activeTab === "cancelled") return o.status === "Cancelled";
    return true;
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Root ── */
        .db-root {
          --cream: #F5F0E8;
          --ink: #1A1712;
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --mist: #8C8070;
          --card: #211D16;
          --card-hover: #2A2419;
          --border: rgba(201,168,76,0.13);
          --border-hover: rgba(201,168,76,0.35);
          min-height: 100vh;
          background: var(--ink);
          font-family: 'DM Sans', sans-serif;
          color: var(--cream);
          position: relative;
          overflow-x: hidden;
        }

        /* Subtle background texture */
        .db-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.03;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Layout ── */
        .db-layout {
          display: flex;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        /* ── Sidebar ── */
        .db-sidebar {
          width: 220px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .db-sidebar-logo {
          padding: 0 24px 32px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 8px;
        }
        .db-logo-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          color: var(--cream);
          line-height: 1;
          letter-spacing: 0.02em;
        }
        .db-logo-tagline {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--gold);
          margin-top: 4px;
          font-weight: 300;
        }
        .db-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 300;
          color: var(--mist);
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          border-left: 2px solid transparent;
        }
        .db-nav-item:hover { color: var(--cream); background: rgba(255,255,255,0.03); }
        .db-nav-item--active {
          color: var(--gold-light);
          border-left-color: var(--gold);
          background: rgba(201,168,76,0.06);
        }
        .db-sidebar-bottom {
          margin-top: auto;
          padding: 24px;
          border-top: 1px solid var(--border);
        }
        .db-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .db-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: rgba(201,168,76,0.15);
          border: 1px solid rgba(201,168,76,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          font-weight: 500;
          color: var(--gold);
          flex-shrink: 0;
        }
        .db-user-name { font-size: 13px; color: var(--cream); font-weight: 400; }
        .db-user-plan { font-size: 11px; color: var(--mist); font-weight: 300; }

        /* ── Main content ── */
        .db-main {
          flex: 1;
          min-width: 0;
          padding: 48px 48px 80px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        /* ── Top bar ── */
        .db-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }
        .db-greeting-eyebrow {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 300;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-greeting-line { width: 20px; height: 1px; background: var(--gold); }
        .db-greeting-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3vw, 44px);
          font-weight: 300;
          color: var(--cream);
          line-height: 1.1;
        }
        .db-greeting-title em { font-style: italic; color: var(--gold-light); }
        .db-greeting-sub {
          font-size: 14px;
          color: var(--mist);
          font-weight: 300;
          margin-top: 8px;
        }
        .db-topbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          padding-top: 8px;
        }
        .db-icon-btn {
          width: 40px; height: 40px;
          border: 1px solid var(--border);
          background: var(--card);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--mist);
          transition: border-color 0.2s, color 0.2s;
          border-radius: 2px;
        }
        .db-icon-btn:hover { border-color: var(--border-hover); color: var(--cream); }
        .db-schedule-btn {
          background: var(--gold);
          color: var(--ink);
          border: none;
          padding: 12px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: filter 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .db-schedule-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }

        /* ── Stats row ── */
        .db-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .db-stat {
          background: var(--card);
          border: 1px solid var(--border);
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.2s;
          cursor: default;
        }
        .db-stat:hover { border-color: var(--border-hover); }
        .db-stat-icon { color: var(--gold); margin-bottom: 4px; }
        .db-stat-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 400;
          color: var(--cream);
          line-height: 1;
        }
        .db-stat-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--mist);
          font-weight: 300;
        }
        .db-stat-sub { font-size: 12px; color: var(--gold); margin-top: 2px; }

        /* ── Section heading ── */
        .db-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .db-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 300;
          color: var(--cream);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .db-section-count {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 0.1em;
          color: var(--mist);
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          padding: 2px 10px;
          font-weight: 300;
        }
        .db-section-link {
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .db-section-link:hover { color: var(--gold-light); }

        /* ── Active orders ── */
        .db-active-orders {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          padding-bottom: 12px;
          scrollbar-width: none;
        }
        .db-active-orders::-webkit-scrollbar { display: none; }

        /* ── Parallax card ── */
        .db-card-outer {
          flex-shrink: 0;
          width: 280px;
          height: 340px;
          perspective: 800px;
        }
        .db-card-inner {
          position: absolute;
          inset: 0;
          background: var(--card);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 22px 20px;
          cursor: default;
          transition: border-color 0.2s;
          border-radius: 2px;
        }
        .db-card-inner:hover { border-color: var(--border-hover); }
        .db-card-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .db-card-truck-ring {
          width: 64px; height: 64px;
          border-radius: 50%;
          border: 1px solid rgba(201,168,76,0.25);
          background: rgba(201,168,76,0.06);
          display: flex; align-items: center; justify-content: center;
        }
        .db-card-order-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          color: var(--cream);
          letter-spacing: 0.06em;
        }
        .db-card-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
        }
        .db-card-product {
          font-size: 13px;
          color: var(--mist);
          font-weight: 300;
          line-height: 1.5;
        }
        .db-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          font-size: 11px;
          letter-spacing: 0.1em;
          font-weight: 400;
          text-transform: uppercase;
          border-radius: 0;
        }
        .db-card-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .db-card-eta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--mist);
          font-weight: 300;
          letter-spacing: 0.04em;
        }
        .db-card-progress { display: flex; flex-direction: column; gap: 6px; }
        .db-progress-labels {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
        }
        .db-progress-label {
          font-size: 9px;
          letter-spacing: 0.06em;
          text-align: center;
          color: #4A4238;
          text-transform: uppercase;
          white-space: pre-line;
          line-height: 1.3;
        }
        .db-progress-label--active { color: var(--gold); }
        .db-progress-track {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3px;
        }
        .db-progress-seg {
          height: 2px;
          transition: background 0.3s;
          border-radius: 1px;
        }

        /* ── Recent orders table ── */
        .db-recent {
          background: var(--card);
          border: 1px solid var(--border);
          overflow: hidden;
        }
        .db-table-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          padding: 0 24px;
        }
        .db-tab {
          padding: 16px 16px 14px;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--mist);
          cursor: pointer;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
          margin-bottom: -1px;
        }
        .db-tab:hover { color: var(--cream); }
        .db-tab--active { color: var(--gold-light); border-bottom-color: var(--gold); }

        /* Table */
        .db-table { width: 100%; border-collapse: collapse; }
        .db-table th {
          padding: 14px 24px;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--mist);
          font-weight: 400;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .db-table td {
          padding: 16px 24px;
          font-size: 13px;
          color: var(--cream);
          font-weight: 300;
          border-bottom: 1px solid rgba(201,168,76,0.06);
          vertical-align: middle;
        }
        .db-table tr:last-child td { border-bottom: none; }
        .db-table tr:hover td { background: rgba(255,255,255,0.015); }

        .db-order-id {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 400;
          color: var(--cream);
          letter-spacing: 0.03em;
        }
        .db-service-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-service-icon-wrap {
          width: 28px; height: 28px;
          background: rgba(201,168,76,0.08);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold);
          flex-shrink: 0;
        }
        .db-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          font-size: 11px;
          letter-spacing: 0.08em;
          font-weight: 400;
        }
        .db-status-pill--completed {
          background: rgba(74,160,108,0.1);
          color: #4AA06C;
        }
        .db-status-pill--cancelled {
          background: rgba(180,80,80,0.1);
          color: #B45050;
        }
        .db-status-pill--processing {
          background: rgba(201,168,76,0.1);
          color: var(--gold);
        }
        .db-reorder-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--mist);
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 6px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: border-color 0.2s, color 0.2s;
        }
        .db-reorder-btn:hover { border-color: var(--border-hover); color: var(--gold-light); }

        /* ── Empty state ── */
        .db-empty {
          padding: 48px;
          text-align: center;
          color: var(--mist);
          font-size: 13px;
          font-weight: 300;
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .db-stats-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .db-sidebar { display: none; }
          .db-main { padding: 32px 24px 64px; }
          .db-topbar { flex-direction: column; align-items: flex-start; gap: 16px; }
        }
        @media (max-width: 600px) {
          .db-stats-row { grid-template-columns: 1fr 1fr; }
          .db-table th:nth-child(3),
          .db-table td:nth-child(3),
          .db-table th:nth-child(4),
          .db-table td:nth-child(4) { display: none; }
        }
      `}</style>

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
      />

      <div className="db-root">
        <div className="db-layout">
          {/* ── Sidebar ── */}
          <aside className="db-sidebar">
            <div className="db-sidebar-logo">
              <div className="db-logo-name">Prestige</div>
              <div className="db-logo-tagline">Dry Cleaning</div>
            </div>

            {[
              {
                icon: <Package width={15} height={15} strokeWidth={1.5} />,
                label: "Dashboard",
                active: true,
              },
              {
                icon: <Calendar width={15} height={15} strokeWidth={1.5} />,
                label: "Schedule Pickup",
                active: false,
              },
              {
                icon: <Clock width={15} height={15} strokeWidth={1.5} />,
                label: "Order History",
                active: false,
              },
              {
                icon: <Sparkles width={15} height={15} strokeWidth={1.5} />,
                label: "Services",
                active: false,
              },
            ].map((nav) => (
              <div
                key={nav.label}
                className={`db-nav-item ${nav.active ? "db-nav-item--active" : ""}`}
              >
                {nav.icon}
                {nav.label}
              </div>
            ))}

            <div className="db-sidebar-bottom">
              <div className="db-user-row">
                <div className="db-avatar">JD</div>
                <div>
                  <div className="db-user-name">James Dunmore</div>
                  <div className="db-user-plan">Prestige member</div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="db-main">
            {/* Top bar */}
            <motion.div
              className="db-topbar"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div>
                <div className="db-greeting-eyebrow">
                  <span className="db-greeting-line" />
                  {new Date().toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
                <h1 className="db-greeting-title">
                  {greeting},<br />
                  <em>James.</em>
                </h1>
                <p className="db-greeting-sub">
                  You have {activeOrders.length} active orders in progress.
                </p>
              </div>

              <div className="db-topbar-actions">
                <button className="db-icon-btn" aria-label="Notifications">
                  <Bell width={16} height={16} strokeWidth={1.5} />
                </button>
                <Link href="/schedule">
                  <button className="db-schedule-btn" type="button">
                    <Plus width={14} height={14} strokeWidth={2} />
                    Schedule Pickup
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="db-stats-row">
              <StatCard
                icon={<Package width={16} height={16} strokeWidth={1.5} />}
                value={activeOrders.length.toString()}
                label="Active Orders"
                sub="1 arriving today"
                delay={0.1}
              />
              <StatCard
                icon={<CheckCircle2 width={16} height={16} strokeWidth={1.5} />}
                value="47"
                label="Completed"
                sub="Since Jan 2024"
                delay={0.18}
              />
              <StatCard
                icon={<Sparkles width={16} height={16} strokeWidth={1.5} />}
                value="£840"
                label="Lifetime spend"
                delay={0.26}
              />
              <StatCard
                icon={<Clock width={16} height={16} strokeWidth={1.5} />}
                value="24h"
                label="Avg. turnaround"
                sub="Express available"
                delay={0.34}
              />
            </div>

            {/* Active orders */}
            <div>
              <div className="db-section-head">
                <div className="db-section-title">
                  Active Orders
                  <span className="db-section-count">
                    {activeOrders.length}
                  </span>
                </div>
                <button className="db-section-link" type="button">
                  View all{" "}
                  <ChevronRight width={12} height={12} strokeWidth={2} />
                </button>
              </div>

              <div className="db-active-orders">
                {loading ? (
                  <div className="db-empty">Loading...</div>
                ) : activeOrders.length === 0 ? (
                  <div className="db-empty">No active orders.</div>
                ) : (
                  activeOrders.map((order, i) => (
                    <ParallaxOrderCard
                      key={order.orderId}
                      order={order}
                      index={i}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Recent orders */}
            <div>
              <div className="db-section-head">
                <div className="db-section-title">Recent Orders</div>
                <button className="db-section-link" type="button">
                  Full history{" "}
                  <ChevronRight width={12} height={12} strokeWidth={2} />
                </button>
              </div>

              <div className="db-recent">
                {/* Tabs */}
                <div className="db-table-tabs">
                  {(["all", "completed", "cancelled"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={`db-tab ${activeTab === tab ? "db-tab--active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === "all"
                        ? "All"
                        : tab === "completed"
                          ? "Completed"
                          : "Cancelled"}
                    </button>
                  ))}
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="db-empty">No orders in this category.</div>
                ) : (
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, i) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.06 }}
                        >
                          <td>
                            <span className="db-order-id">#{order.id}</span>
                          </td>
                          <td>
                            <div className="db-service-cell">
                              <div className="db-service-icon-wrap">
                                {SERVICE_ICONS[order.serviceId]}
                              </div>
                              {order.service}
                            </div>
                          </td>
                          <td style={{ color: "var(--mist)" }}>{order.date}</td>
                          <td style={{ color: "var(--mist)" }}>
                            {order.items} item{order.items !== 1 ? "s" : ""}
                          </td>
                          <td
                            style={{
                              color: "var(--gold-light)",
                              fontWeight: 400,
                            }}
                          >
                            {order.total}
                          </td>
                          <td>
                            <span
                              className={`db-status-pill db-status-pill--${order.status.toLowerCase()}`}
                            >
                              <span
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background:
                                    order.status === "Completed"
                                      ? "#4AA06C"
                                      : order.status === "Cancelled"
                                        ? "#B45050"
                                        : "var(--gold)",
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <button className="db-reorder-btn" type="button">
                              <RotateCcw
                                width={11}
                                height={11}
                                strokeWidth={2}
                              />
                              Reorder
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
