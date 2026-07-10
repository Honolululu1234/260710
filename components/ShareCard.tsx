"use client";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { DivineResult } from "@/types";

const ELEMENT_EMOJI: Record<string, string> = {
  목: "🌳", 화: "🔥", 토: "⛰️", 금: "⚜️", 수: "💧",
};

export default function ShareCard({ data }: { data: DivineResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const { fortune, picks } = data;

  async function save() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#140a24",
      });
      const a = document.createElement("a");
      a.download = `사주선물_${fortune.dayPillar.ganzhi}.png`;
      a.href = dataUrl;
      a.click();
    } catch (e) {
      console.error("이미지 저장 실패", e);
      alert("이미지 저장에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* 캡처 대상 카드 */}
      <div
        ref={ref}
        className="rounded-3xl p-6 border border-gold/30"
        style={{ background: "linear-gradient(160deg,#241645,#140a24)" }}
      >
        <div className="text-center">
          <div className="text-3xl">{ELEMENT_EMOJI[fortune.dayPillar.element]}✨</div>
          <div className="mt-1 text-xs text-mystic">2026 병오년 · 나의 선물 운세</div>
          <div className="text-2xl font-extrabold text-gold mt-1">
            {fortune.dayPillar.ganzhi}일주 · {fortune.animal.name}
          </div>
          <div className="text-[11px] text-white/60 mt-1">
            {fortune.zodiacSign} · 생명수 {fortune.lifeNumber} · 보완오행 {fortune.ohaeng.lackingElement}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {picks.map((p, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <div className="text-gold font-bold text-sm">{i + 1}</div>
              <div className="text-sm text-white/90 font-semibold flex-1">{p.gift.name}</div>
              <div className="text-[10px] text-white/50">{p.gift.category}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center text-[10px] text-gold/60 tracking-widest">사주선물 · SAJU GIFT</div>
      </div>

      <button
        onClick={save}
        disabled={busy}
        className="mt-4 w-full rounded-xl bg-white/10 border border-white/20 text-white font-bold py-3 hover:bg-white/15 active:scale-[0.98] transition disabled:opacity-50"
      >
        {busy ? "이미지 만드는 중…" : "🖼️ 카드 이미지로 저장·공유"}
      </button>
    </div>
  );
}
