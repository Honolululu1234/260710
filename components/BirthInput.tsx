"use client";
import { useState } from "react";
import type { PriceTier } from "@/types";

const TIERS: Array<{ key: PriceTier; label: string; sub: string }> = [
  { key: "under1", label: "~1만원", sub: "가볍게" },
  { key: "1to3", label: "1~3만원", sub: "무난하게" },
  { key: "3to5", label: "3~5만원", sub: "정성껏" },
];

export default function BirthInput({
  initialBirth,
  onSubmit,
}: {
  initialBirth?: string;
  onSubmit: (receiverBirth: string, senderBirth: string | null, tier: PriceTier) => void;
}) {
  const [receiver, setReceiver] = useState(initialBirth ?? "");
  const [sender, setSender] = useState("");
  const [compatMode, setCompatMode] = useState(false);
  const [tier, setTier] = useState<PriceTier>("1to3");
  const [error, setError] = useState("");

  const valid = /^\d{4}-\d{2}-\d{2}$/.test(receiver);

  function handleGo() {
    if (!valid) {
      setError("받는 사람 생년월일을 YYYY-MM-DD로 입력해 주세요.");
      return;
    }
    if (compatMode && sender && !/^\d{4}-\d{2}-\d{2}$/.test(sender)) {
      setError("보내는 사람 생년월일 형식을 확인해 주세요.");
      return;
    }
    setError("");
    onSubmit(receiver, compatMode && sender ? sender : null, tier);
  }

  return (
    <div className="w-full max-w-md mx-auto animate-floatUp">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🔮</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gold">사주선물</h1>
        <p className="mt-2 text-sm text-mystic/90">
          생년월일에 담긴 올해의 기운으로
          <br />딱 맞는 선물을 골라드려요
        </p>
      </div>

      <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 shadow-2xl">
        <label className="block text-sm text-gold/90 mb-2">받는 사람 생년월일 (양력)</label>
        <input
          type="date"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="w-full rounded-xl bg-cosmos/60 border border-white/15 px-4 py-3 text-lg text-white outline-none focus:border-gold/70 transition"
        />

        <button
          onClick={() => setCompatMode((v) => !v)}
          className="mt-4 text-xs text-mystic hover:text-gold transition flex items-center gap-1"
        >
          {compatMode ? "▾" : "▸"} 보내는 사람 생일도 넣어 궁합 보기 (선택)
        </button>
        {compatMode && (
          <input
            type="date"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="mt-2 w-full rounded-xl bg-cosmos/60 border border-white/15 px-4 py-3 text-white outline-none focus:border-gold/70 transition animate-floatUp"
          />
        )}

        <label className="block text-sm text-gold/90 mt-6 mb-2">예산</label>
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTier(t.key)}
              className={`rounded-xl py-3 border transition ${
                tier === t.key
                  ? "bg-gold text-ink border-gold font-bold"
                  : "bg-white/5 border-white/15 text-white/80 hover:border-gold/50"
              }`}
            >
              <div className="text-sm">{t.label}</div>
              <div className="text-[10px] opacity-70">{t.sub}</div>
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          onClick={handleGo}
          disabled={!valid}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-gold to-amber-400 text-ink font-extrabold py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] transition"
        >
          운세 카드 펼치기 ✨
        </button>
      </div>
    </div>
  );
}
