"use client";

import { useEffect, useState } from "react";

// Purely decorative marketing copy — not wired to /api/diagnose or any real
// technique data. Cycles every ~3s with a fade+slide transition. Labeled
// "ILLUSTRATIVE EXAMPLE" on the card itself so a skeptical visitor can't
// mistake it for a live result or another customer's real data.
const EXAMPLES = [
  {
    badge: "LEADS GO COLD BEFORE QUOTING",
    title: "The Same-Day Callback",
    desc: "From auto dealerships → home services",
  },
  {
    badge: "NO REPEAT OR REFERRAL BUSINESS",
    title: "The Named-Tech Guarantee",
    desc: "From boutique hospitality → cleaning",
  },
  {
    badge: "SEASONAL DEMAND & CASH FLOW",
    title: "The Off-Peak Discount Window",
    desc: "From ski resorts → landscaping",
  },
  {
    badge: "LOW QUOTE-TO-CLOSE RATE",
    title: "This Price Holds for 7 Days",
    desc: "From SaaS pricing pages → estimates",
  },
  {
    badge: "PRICE-SHOPPING PRESSURE",
    title: "Sell the Outcome, Not the Part",
    desc: "From consultative B2B sales → service calls",
  },
];

const CYCLE_MS = 3000;
const TRANSITION_MS = 400;

export default function HeroExampleCard() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      const timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % EXAMPLES.length);
        setVisible(true);
      }, TRANSITION_MS);
      return () => clearTimeout(timeout);
    }, CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  const example = EXAMPLES[index];

  return (
    <div className="relative flex h-[260px] items-center justify-center">
      <div
        className="w-[230px] rounded-xl border border-ink-gold-border-soft bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-[10px] transition-all duration-[400ms] ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(8px)",
        }}
      >
        <span className="font-eyebrow text-[9px] font-semibold tracking-[0.08em] text-ink-gold">
          ILLUSTRATIVE EXAMPLE
        </span>
        <p className="mt-1.5 font-eyebrow text-[9px] font-semibold tracking-[0.08em] text-ink-gold/70">
          {example.badge}
        </p>
        <div className="mt-2.5 font-display text-lg leading-[1.3] text-ink-heading">
          {example.title}
        </div>
        <div className="mt-2 text-[11px] leading-[1.5] text-ink-muted">{example.desc}</div>
      </div>
    </div>
  );
}
