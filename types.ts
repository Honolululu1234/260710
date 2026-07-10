// 공유 타입 정의 — fortune 계산 결과, LLM 응답, 선물 시드

/** 오행 5요소 */
export type OhaengType = "목" | "화" | "토" | "금" | "수";

/** 2026 병오년(午·말) 상성 등급 */
export type CompatGrade = "best" | "good" | "neutral" | "clash";

/** 예산 구간 */
export type PriceTier = "under1" | "1to3" | "3to5"; // ~1만 / 1~3만 / 3~5만

/** 일주(日柱) — 60갑자 */
export interface DayPillar {
  stem: string; // 일간 라벨 예: "병(丙)"
  branch: string; // 일지 라벨 예: "진(辰)"
  ganzhi: string; // "병진"
  element: OhaengType; // 일간의 오행
  characterKey: string; // 일간 캐릭터 키 (UI·프롬프트용)
}

/** 띠 + 2026 상성 */
export interface AnimalFortune {
  name: string; // "용띠"
  branch: string; // "진(辰)"
  compat2026: CompatGrade;
  compatReason: string; // "삼합 화국" 등 근거 라벨
}

/** 오행 분석 */
export interface OhaengAnalysis {
  dayElement: OhaengType; // 일간 오행
  lackingElement: OhaengType; // 보완이 필요한 오행 (일간을 生하는 오행)
  tags: string[]; // 성향 태그 시드 (LLM 힌트)
}

/** fortune.ts 최종 출력 — 100% 결정론적 */
export interface FortuneResult {
  input: { year: number; month: number; day: number };
  dayPillar: DayPillar;
  zodiacSign: string; // 별자리 "물고기자리"
  animal: AnimalFortune;
  lifeNumber: number; // 생명수 1~9 또는 마스터수 11·22
  ohaeng: OhaengAnalysis;
}

/** 궁합 모드 — 보내는 사람 fortune (보조 레이어) */
export interface CompatContext {
  sender: FortuneResult;
  receiver: FortuneResult;
  branchRelation: CompatGrade; // 두 사람 일지 관계
  relationLabel: string;
}

/** 선물 시드 항목 */
export interface Gift {
  id: string;
  category: string;
  priceTier: PriceTier;
  ohaeng: OhaengType[]; // 오행 태그
  traits: string[]; // 성향 태그 (체험형/실용형/감성형 등)
  name: string; // 대표 상품명
  kakaoLink: string; // 카카오 선물하기 검색 딥링크
}

/** LLM이 반환해야 하는 JSON 형태 */
export interface LLMResponse {
  narrative: string; // 올해의 기운 해석 (일주 캐릭터 + 기운 + 궁합 합성)
  needs: string[]; // 보완 오행/성향 태그
  picks: Array<{ giftId: string; reason: string }>; // 정확히 3개
}
