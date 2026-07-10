// fortune.ts — 사주 운세 계산 코어
// 원칙: 100% 순수 함수, 결정론적, LLM 미사용. 모든 계산 함수를 export하여 유닛테스트 가능.
//
// ⚠️ 정확도 스코프 (MVP):
//   - 입춘(立春) 경계 보정 생략 → 띠는 "양력 연도" 기준 (사용자 확인 완료)
//   - 시주(태어난 시각) 미사용 → 일주까지만 계산
//   - 절기 기반 월주도 미사용
//   위 근사는 데모 목적상 의도된 단순화입니다.

import type {
  OhaengType,
  CompatGrade,
  DayPillar,
  AnimalFortune,
  OhaengAnalysis,
  FortuneResult,
} from "../types";

// ── 상수 테이블 ────────────────────────────────────────────────

/** 천간 10 — index 0=갑 */
export const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
export const STEMS_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/** 지지 12 — index 0=자 */
export const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
export const BRANCHES_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/** 12지 동물 (지지 index 순서) */
export const ANIMALS = [
  "쥐", "소", "범", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지",
];

/** 천간 → 오행 (index 0=갑) : 갑을=목, 병정=화, 무기=토, 경신=금, 임계=수 */
export const STEM_ELEMENT: OhaengType[] = [
  "목", "목", "화", "화", "토", "토", "금", "금", "수", "수",
];

/** 오행 상생(生) 순환: 목→화→토→금→수→목. generator[X] = X를 生하는 오행 */
export const ELEMENT_GENERATOR: Record<OhaengType, OhaengType> = {
  목: "수", // 수生목
  화: "목", // 목生화
  토: "화", // 화生토
  금: "토", // 토生금
  수: "금", // 금生수
};

/** 2026 병오년 기준 지지 = 午(말), index 6 */
export const YEAR_2026_BRANCH = 6;

// ── 1. 율리우스일수 (JDN) ──────────────────────────────────────

/**
 * 그레고리력 날짜 → 율리우스일수(정수). 60갑자 일주 계산의 기반.
 * 검증: 2000-01-01 → 2451545 (표준값).
 */
export function toJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// ── 2. 일주 (60갑자) ───────────────────────────────────────────

/**
 * 일간(천간) index 0~9. stem = (JDN + 9) mod 10, 0=갑.
 * 지지 index = (JDN + 1) mod 12, 0=자.
 * 두 식은 (JDN + 49) mod 60 갑자 인덱스와 내부 일치.
 */
export function dayStemIndex(jdn: number): number {
  return (((jdn + 9) % 10) + 10) % 10;
}
export function dayBranchIndex(jdn: number): number {
  return (((jdn + 1) % 12) + 12) % 12;
}

export function computeDayPillar(year: number, month: number, day: number): DayPillar {
  const jdn = toJDN(year, month, day);
  const si = dayStemIndex(jdn);
  const bi = dayBranchIndex(jdn);
  const element = STEM_ELEMENT[si];
  return {
    stem: `${STEMS[si]}(${STEMS_HANJA[si]})`,
    branch: `${BRANCHES[bi]}(${BRANCHES_HANJA[bi]})`,
    ganzhi: `${STEMS[si]}${BRANCHES[bi]}`,
    element,
    characterKey: `${STEMS[si]}${element}`, // 예: "병화"
  };
}

// ── 3. 별자리 ──────────────────────────────────────────────────

/** 월/일 → 서양 별자리. 경계일 포함. */
export function computeZodiac(month: number, day: number): string {
  const ranges: Array<[number, number, string]> = [
    [1, 20, "염소자리"], [2, 19, "물병자리"], [3, 21, "물고기자리"],
    [4, 20, "양자리"], [5, 21, "황소자리"], [6, 22, "쌍둥이자리"],
    [7, 23, "게자리"], [8, 23, "사자자리"], [9, 23, "처녀자리"],
    [10, 23, "천칭자리"], [11, 22, "전갈자리"], [12, 22, "사수자리"],
  ];
  // 각 항목 [경계월, 경계일, "그 경계일 이전(=전달 별자리)"]. day < 경계일 → 전 별자리.
  const [, boundaryDay, sign] = ranges[month - 1];
  if (day < boundaryDay) {
    return sign;
  }
  // 경계일 이상 → 다음 별자리
  return ranges[month % 12][2];
}

// ── 4. 띠 + 2026 상성 ──────────────────────────────────────────

/** 양력 연도 → 띠 지지 index. (year - 4) mod 12, 0=자. 검증: 2020→0(쥐), 2026→6(말). */
export function animalBranchIndex(year: number): number {
  return (((year - 4) % 12) + 12) % 12;
}

/**
 * 병오년(午·6) 대비 상성 계산.
 *  - 삼합 화국(인2·오6·술10): 인·술 → best
 *  - 육합(오미): 미7 → good
 *  - 자오충: 자0 → clash
 *  - 오6(동일 말띠) → neutral ("병존")
 *  - 그 외 → neutral
 */
export function compatWith2026(branch: number): { grade: CompatGrade; reason: string } {
  if (branch === 2 || branch === 10) return { grade: "best", reason: "삼합 화국(寅午戌)" };
  if (branch === 7) return { grade: "good", reason: "육합(午未)" };
  if (branch === 0) return { grade: "clash", reason: "자오충(子午沖)" };
  if (branch === 6) return { grade: "neutral", reason: "동일 말띠(午 병존)" };
  return { grade: "neutral", reason: "무해무득" };
}

export function computeAnimal(year: number): AnimalFortune {
  const bi = animalBranchIndex(year);
  const { grade, reason } = compatWith2026(bi);
  return {
    name: `${ANIMALS[bi]}띠`,
    branch: `${BRANCHES[bi]}(${BRANCHES_HANJA[bi]})`,
    compat2026: grade,
    compatReason: reason,
  };
}

// ── 5. 생명수 (수비학) ─────────────────────────────────────────

/** 한 자리 될 때까지 자릿수 합산. 단 11·22 마스터수는 유지. */
export function reduceToLifeNumber(n: number): number {
  while (n > 9 && n !== 11 && n !== 22) {
    n = String(n)
      .split("")
      .reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

/** 생년월일 전 자릿수 합산 → 생명수. 예: 1997-03-15 → 35 → 8. */
export function computeLifeNumber(year: number, month: number, day: number): number {
  const digits = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
  const sum = digits.split("").reduce((s, d) => s + Number(d), 0);
  return reduceToLifeNumber(sum);
}

// ── 6. 오행 분석 (보완 오행 + 성향 태그) ───────────────────────

/** 일간 오행 → 보완 오행(일간을 生하는 오행). 예: 화 → 목. */
export function lackingElement(dayElement: OhaengType): OhaengType {
  return ELEMENT_GENERATOR[dayElement];
}

/** 오행별 성향 태그 시드 */
const ELEMENT_TRAITS: Record<OhaengType, string[]> = {
  목: ["성장지향", "체험형", "진취적"],
  화: ["열정적", "감성형", "표현력"],
  토: ["안정지향", "실용형", "포용력"],
  금: ["원칙적", "실용형", "완성도"],
  수: ["유연함", "감성형", "통찰력"],
};

/** 생명수별 보조 성향 태그 */
function lifeNumberTrait(n: number): string {
  const map: Record<number, string> = {
    1: "리더형", 2: "조화형", 3: "표현형", 4: "성실형", 5: "자유형",
    6: "돌봄형", 7: "탐구형", 8: "성취형", 9: "이상형", 11: "직관형", 22: "실현형",
  };
  return map[n] ?? "균형형";
}

export function computeOhaeng(dayElement: OhaengType, lifeNumber: number): OhaengAnalysis {
  const lack = lackingElement(dayElement);
  return {
    dayElement,
    lackingElement: lack,
    tags: [...ELEMENT_TRAITS[dayElement], lifeNumberTrait(lifeNumber)],
  };
}

// ── 7. 두 사람 궁합 (일지 관계) ────────────────────────────────

/** 두 지지 index의 관계 등급. 삼합/육합=best·good, 충=clash, 그 외 neutral. */
export function branchRelation(a: number, b: number): { grade: CompatGrade; label: string } {
  if (a === b) return { grade: "neutral", label: "동일 지지" };
  const SAMHAP = [[8, 0, 4], [5, 9, 1], [2, 6, 10], [11, 3, 7]];
  const YUKHAP = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  const norm = (x: number, y: number) => [Math.min(x, y), Math.max(x, y)];
  const [lo, hi] = norm(a, b);
  if ((hi - lo) === 6) return { grade: "clash", label: "충(沖)" };
  if (YUKHAP.some(([x, y]) => x === lo && y === hi)) return { grade: "good", label: "육합(六合)" };
  if (SAMHAP.some((g) => g.includes(a) && g.includes(b))) return { grade: "best", label: "삼합(三合)" };
  return { grade: "neutral", label: "무해무득" };
}

// ── 8. 최종 조합 ───────────────────────────────────────────────

/**
 * 생년월일 → FortuneResult (결정론적).
 * @param birth "YYYY-MM-DD"
 */
export function computeFortune(birth: string): FortuneResult {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birth.trim());
  if (!m) throw new Error(`잘못된 생년월일 형식: ${birth} (YYYY-MM-DD 필요)`);
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`잘못된 날짜: ${birth}`);
  }

  const dayPillar = computeDayPillar(year, month, day);
  const zodiacSign = computeZodiac(month, day);
  const animal = computeAnimal(year);
  const lifeNumber = computeLifeNumber(year, month, day);
  const ohaeng = computeOhaeng(dayPillar.element, lifeNumber);

  return {
    input: { year, month, day },
    dayPillar,
    zodiacSign,
    animal,
    lifeNumber,
    ohaeng,
  };
}
