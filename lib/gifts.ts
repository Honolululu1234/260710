// gifts.ts — 선물 시드 로더 + 필터/조회 헬퍼
import giftsData from "../data/gifts.json";
import type { Gift, OhaengType, PriceTier } from "../types";

export const GIFTS: Gift[] = giftsData as Gift[];

const byId = new Map(GIFTS.map((g) => [g.id, g]));

/** id로 선물 조회 (LLM picks 검증용) */
export function getGiftById(id: string): Gift | undefined {
  return byId.get(id);
}

/** 유효한 gift id 집합 — LLM 환각 차단에 사용 */
export const VALID_GIFT_IDS = new Set(GIFTS.map((g) => g.id));

/**
 * 예산 + 보완오행으로 후보군 필터링.
 * 보완오행을 가진 선물을 우선, 예산 구간 일치. 후보가 너무 적으면 예산만으로 폴백.
 */
export function filterCandidates(
  priceTier: PriceTier,
  lackingElement: OhaengType,
): Gift[] {
  const inBudget = GIFTS.filter((g) => g.priceTier === priceTier);
  const matched = inBudget.filter((g) => g.ohaeng.includes(lackingElement));
  // 보완오행 매칭 우선, 그 뒤 나머지 예산 내 항목 (다양성 확보)
  const rest = inBudget.filter((g) => !g.ohaeng.includes(lackingElement));
  return [...matched, ...rest];
}

/** LLM 프롬프트에 넣을 축약 카탈로그 (토큰 절약) */
export function catalogForPrompt(candidates: Gift[]): string {
  return candidates
    .map(
      (g) =>
        `${g.id} | ${g.category} | ${g.name} | 오행:${g.ohaeng.join("·")} | 성향:${g.traits.join("·")}`,
    )
    .join("\n");
}
