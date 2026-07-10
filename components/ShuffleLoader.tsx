"use client";

const MESSAGES = [
  "천간지지를 헤아리는 중…",
  "60갑자 수레바퀴를 돌리는 중…",
  "별자리와 오행을 맞춰보는 중…",
  "올해의 기운을 읽는 중…",
];

export default function ShuffleLoader({ step = 0 }: { step?: number }) {
  return (
    <div className="flex flex-col items-center justify-center animate-floatUp">
      <div className="relative h-56 w-56 flex items-center justify-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute h-40 w-28 rounded-2xl border border-gold/40 bg-gradient-to-br from-cosmos to-ink shadow-xl animate-shuffle"
            style={{
              animationDelay: `${i * 0.15}s`,
              transform: `translateX(${(i - 2) * 14}px) rotate(${(i - 2) * 6}deg)`,
              zIndex: 5 - Math.abs(i - 2),
            }}
          >
            <div className="h-full w-full rounded-2xl flex items-center justify-center text-3xl text-gold/70">
              ✦
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-mystic animate-glow text-center">
        {MESSAGES[step % MESSAGES.length]}
      </p>
    </div>
  );
}
