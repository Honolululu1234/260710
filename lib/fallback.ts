// fallback.ts — LLM 실패 시 데모가 끊기지 않도록 하는 목업 응답 생성기
// 계산 결과 기반으로 그럴듯한 내러티브와 picks를 결정론적으로 구성.
import type { FortuneResult, LLMResponse, Gift, CompatContext } from "../types";

const ELEMENT_STORY: Record<string, string> = {
  목: "뻗어나가는 나무처럼 성장의 기운",
  화: "타오르는 불꽃 같은 열정의 기운",
  토: "든든한 대지처럼 안정된 기운",
  금: "잘 벼려진 금속 같은 단단한 기운",
  수: "흐르는 물처럼 유연한 기운",
};

const COMPAT_LINE: Record<string, string> = {
  best: "2026 병오년과 삼합으로 크게 어울려 올해 운이 활짝 열립니다.",
  good: "2026 병오년과 육합의 인연이라 잔잔한 행운이 따릅니다.",
  neutral: "2026 병오년의 기운은 무난해, 스스로 만드는 흐름이 중요한 해입니다.",
  clash: "2026 병오년과는 부딪히는 기운이라, 오히려 변화를 즐기면 득이 되는 해입니다.",
};

export function buildFallback(
  fortune: FortuneResult,
  candidates: Gift[],
  compat?: CompatContext,
): LLMResponse {
  const el = fortune.dayPillar.element;
  const lack = fortune.ohaeng.lackingElement;

  // 보완오행 매칭 우선 3개 (candidates는 이미 매칭 우선 정렬됨)
  const picks = candidates.slice(0, 3);

  let narrative =
    `${fortune.dayPillar.ganzhi}일에 태어난 당신은 ${ELEMENT_STORY[el]}을 품은 ${fortune.zodiacSign} ${fortune.animal.name}. ` +
    `${COMPAT_LINE[fortune.animal.compat2026]} ` +
    `올해는 ${lack}의 기운을 더해주면 균형이 살아나요.`;

  if (compat) {
    const rel =
      compat.branchRelation === "best" || compat.branchRelation === "good"
        ? "서로를 북돋우는 좋은 인연"
        : compat.branchRelation === "clash"
          ? "티격태격해도 끌리는 인연"
          : "잔잔히 오래가는 인연";
    narrative += ` 두 분은 ${compat.relationLabel}, ${rel}이에요.`;
  }

  return {
    narrative,
    needs: [lack, ...fortune.ohaeng.tags.slice(0, 2)],
    picks: picks.map((g) => ({
      giftId: g.id,
      reason: `${g.ohaeng.join("·")} 기운의 ${g.name} — 부족한 ${lack} 기운을 채워주는 선택이에요.`,
    })),
  };
}
