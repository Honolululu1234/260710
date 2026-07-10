"use client";
import { useEffect, useState, useCallback } from "react";
import type { DivineResult, PriceTier } from "@/types";
import BirthInput from "@/components/BirthInput";
import ShuffleLoader from "@/components/ShuffleLoader";
import FortuneNarrative from "@/components/FortuneNarrative";
import GiftCard from "@/components/GiftCard";
import ShareCard from "@/components/ShareCard";

type Step = "input" | "loading" | "result";

export default function Page() {
  const [step, setStep] = useState<Step>("input");
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState<DivineResult | null>(null);
  const [error, setError] = useState("");
  const [preset, setPreset] = useState<string | undefined>();

  // URL 프리셋 ?b=1997-03-15 (리허설용)
  useEffect(() => {
    const b = new URLSearchParams(window.location.search).get("b");
    if (b && /^\d{4}-\d{2}-\d{2}$/.test(b)) setPreset(b);
  }, []);

  // 로딩 메시지 순환
  useEffect(() => {
    if (step !== "loading") return;
    const t = setInterval(() => setLoadStep((s) => s + 1), 900);
    return () => clearInterval(t);
  }, [step]);

  const run = useCallback(
    async (receiverBirth: string, senderBirth: string | null, tier: PriceTier) => {
      setStep("loading");
      setLoadStep(0);
      setError("");
      const started = Date.now();
      try {
        const res = await fetch("/api/divine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverBirth, senderBirth, priceTier: tier }),
        });
        if (!res.ok) throw new Error((await res.json()).error || "요청 실패");
        const data: DivineResult = await res.json();
        // 셔플 애니메이션 최소 1.6초 확보
        const wait = Math.max(0, 1600 - (Date.now() - started));
        setTimeout(() => {
          setResult(data);
          setStep("result");
        }, wait);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류");
        setStep("input");
      }
    },
    [],
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      {step === "input" && (
        <>
          <BirthInput initialBirth={preset} onSubmit={run} />
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        </>
      )}

      {step === "loading" && <ShuffleLoader step={loadStep} />}

      {step === "result" && result && (
        <div className="w-full max-w-md mx-auto space-y-5 animate-floatUp pb-10">
          <FortuneNarrative data={result} />

          <div>
            <div className="text-center text-sm text-mystic mb-3">
              당신을 위한 선물 3종 · 카드를 탭해보세요 🎴
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.picks.map((p, i) => (
                <GiftCard key={p.gift.id} gift={p.gift} reason={p.reason} index={i} />
              ))}
            </div>
          </div>

          <ShareCard data={result} />

          {result.usedFallback && (
            <p className="text-center text-[10px] text-white/30">
              * 데모 모드: AI 코멘트 대신 기본 해석을 표시 중
            </p>
          )}

          <button
            onClick={() => {
              setResult(null);
              setStep("input");
            }}
            className="w-full text-center text-sm text-mystic hover:text-gold transition py-2"
          >
            ← 다른 생일로 다시 보기
          </button>
        </div>
      )}
    </main>
  );
}
