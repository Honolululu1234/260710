"use client";
import { useState } from "react";
import type { Gift } from "@/types";

const TIER_LABEL: Record<string, string> = {
  under1: "~1만원",
  "1to3": "1~3만원",
  "3to5": "3~5만원",
};

export default function GiftCard({
  gift,
  reason,
  index,
}: {
  gift: Gift;
  reason: string;
  index: number;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="card-3d h-64 animate-floatUp cursor-pointer select-none"
      style={{ animationDelay: `${index * 0.12}s` }}
      onClick={() => setFlipped((v) => !v)}
    >
      <div className={`card-inner ${flipped ? "flipped" : ""}`}>
        {/* 앞면 — 뒤집기 전 */}
        <div className="card-face rounded-2xl border border-gold/30 bg-gradient-to-br from-cosmos to-ink p-4 flex flex-col items-center justify-center text-center shadow-xl">
          <div className="text-xs text-mystic">Pick {index + 1}</div>
          <div className="my-3 text-4xl">🎴</div>
          <div className="text-sm text-gold font-bold">{gift.category}</div>
          <div className="mt-1 text-[11px] text-white/50">탭하면 추천 이유가 열려요</div>
          <div className="mt-3 flex gap-1">
            {gift.ohaeng.map((o) => (
              <span key={o} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                {o}
              </span>
            ))}
          </div>
        </div>

        {/* 뒷면 — 추천 이유 */}
        <div className="card-face card-back rounded-2xl border border-gold/50 bg-gradient-to-br from-[#2a1c4d] to-[#1c1436] p-4 flex flex-col shadow-xl">
          <div className="text-sm font-bold text-gold leading-snug">{gift.name}</div>
          <div className="text-[10px] text-white/50 mt-0.5">
            {gift.category} · {TIER_LABEL[gift.priceTier]}
          </div>
          <p className="mt-2 text-[12px] leading-5 text-white/85 flex-1 overflow-auto">{reason}</p>
          <a
            href={gift.kakaoLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 block text-center rounded-lg bg-[#FEE500] text-[#3c1e1e] text-sm font-bold py-2 hover:brightness-105 active:scale-95 transition"
          >
            카카오 선물하기 →
          </a>
        </div>
      </div>
    </div>
  );
}
