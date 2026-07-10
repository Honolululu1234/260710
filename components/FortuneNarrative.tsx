"use client";
import type { DivineResult } from "@/types";

const GRADE_BADGE: Record<string, { label: string; cls: string }> = {
  best: { label: "대길 상성", cls: "bg-emerald-400/20 text-emerald-200 border-emerald-300/40" },
  good: { label: "길한 상성", cls: "bg-sky-400/20 text-sky-200 border-sky-300/40" },
  neutral: { label: "무난한 흐름", cls: "bg-white/10 text-white/70 border-white/20" },
  clash: { label: "변화의 기운", cls: "bg-rose-400/20 text-rose-200 border-rose-300/40" },
};

const ELEMENT_EMOJI: Record<string, string> = {
  목: "🌳", 화: "🔥", 토: "⛰️", 금: "⚜️", 수: "💧",
};

export default function FortuneNarrative({ data }: { data: DivineResult }) {
  const { fortune, narrative, compat } = data;
  const badge = GRADE_BADGE[fortune.animal.compat2026];

  return (
    <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-gold/20 p-6 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="text-4xl">{ELEMENT_EMOJI[fortune.dayPillar.element]}</div>
        <div>
          <div className="text-xs text-mystic">일주 · 나의 캐릭터</div>
          <div className="text-2xl font-extrabold text-gold">
            {fortune.dayPillar.ganzhi}일주
          </div>
        </div>
        <span className={`ml-auto text-[11px] px-2.5 py-1 rounded-full border ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
        <Chip>{fortune.zodiacSign}</Chip>
        <Chip>{fortune.animal.name}</Chip>
        <Chip>생명수 {fortune.lifeNumber}</Chip>
        <Chip>오행 {fortune.dayPillar.element}</Chip>
        <Chip highlight>보완 {fortune.ohaeng.lackingElement}</Chip>
        {compat && <Chip>궁합 {compat.relationLabel}</Chip>}
      </div>

      <p className="mt-5 text-[15px] leading-7 text-white/90">{narrative}</p>
    </div>
  );
}

function Chip({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full border ${
        highlight
          ? "bg-gold/20 text-gold border-gold/40"
          : "bg-cosmos/50 text-white/80 border-white/15"
      }`}
    >
      {children}
    </span>
  );
}
