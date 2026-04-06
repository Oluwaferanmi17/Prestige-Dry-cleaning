// lib/utils.ts
// ─── Shared server utilities ──────────────────────────────────────────────────

import crypto from "crypto";

// ─── Order number  e.g. PC-2026-4582 ─────────────────────────────────────────

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PC-${year}-${rand}`;
}

// ─── Secure random token (for password reset / email verify) ─────────────────

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ─── Slot label map ───────────────────────────────────────────────────────────

export const SLOT_LABELS: Record<string, string> = {
  SLOT_08_10: "8:00 – 10:00 am",
  SLOT_10_12: "10:00 – 12:00 pm",
  SLOT_14_16: "2:00 – 4:00 pm",
  SLOT_16_18: "4:00 – 6:00 pm",
  SLOT_18_20: "6:00 – 8:00 pm",
};

// ─── Service label map ────────────────────────────────────────────────────────

export const SERVICE_LABELS: Record<string, string> = {
  WASH_FOLD: "Wash & Fold",
  DRY_CLEAN: "Dry Clean",
  PRESS_ONLY: "Press Only",
  HOUSEHOLD: "Household",
  ALTERATIONS: "Alterations",
  LEATHER_CARE: "Leather & Suede",
};

// ─── Address snapshot helper ──────────────────────────────────────────────────

export function addressToString(addr: {
  line1: string;
  line2?: string | null;
  city: string;
  postcode: string;
}): string {
  return [addr.line1, addr.line2, addr.city, addr.postcode]
    .filter(Boolean)
    .join(", ");
}
