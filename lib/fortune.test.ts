import { describe, it, expect } from "vitest";
import {
  toJDN,
  computeDayPillar,
  computeZodiac,
  animalBranchIndex,
  compatWith2026,
  computeAnimal,
  reduceToLifeNumber,
  computeLifeNumber,
  lackingElement,
  branchRelation,
  computeFortune,
} from "./fortune";

describe("toJDN — 율리우스일수 표준값", () => {
  it("2000-01-01 = 2451545", () => {
    expect(toJDN(2000, 1, 1)).toBe(2451545);
  });
  it("1997-03-15 = 2450523", () => {
    expect(toJDN(1997, 3, 15)).toBe(2450523);
  });
});

describe("일주 60갑자", () => {
  it("2000-01-01 → 무오일 (무토)", () => {
    const p = computeDayPillar(2000, 1, 1);
    expect(p.ganzhi).toBe("무오");
    expect(p.element).toBe("토");
  });
  it("1997-03-15 → 병진일 (병화)", () => {
    const p = computeDayPillar(1997, 3, 15);
    expect(p.ganzhi).toBe("병진");
    expect(p.element).toBe("화");
  });
  it("연속한 날은 천간·지지 각각 +1씩 순환", () => {
    const a = computeDayPillar(2024, 6, 1);
    const b = computeDayPillar(2024, 6, 2);
    // 갑자 인덱스가 정확히 1 증가하는지 (경계 안전)
    expect(b.stem).not.toBe(a.stem);
    expect(b.branch).not.toBe(a.branch);
  });
});

describe("별자리 경계일", () => {
  it("3/20 물고기자리, 3/21 양자리", () => {
    expect(computeZodiac(3, 20)).toBe("물고기자리");
    expect(computeZodiac(3, 21)).toBe("양자리");
  });
  it("1/19 염소자리, 1/20 물병자리", () => {
    expect(computeZodiac(1, 19)).toBe("염소자리");
    expect(computeZodiac(1, 20)).toBe("물병자리");
  });
  it("12/21 사수자리, 12/22 염소자리(래핑)", () => {
    expect(computeZodiac(12, 21)).toBe("사수자리");
    expect(computeZodiac(12, 22)).toBe("염소자리");
  });
});

describe("띠 + 2026 병오년 상성", () => {
  it("2020 쥐띠, 2026 말띠", () => {
    expect(animalBranchIndex(2020)).toBe(0);
    expect(animalBranchIndex(2026)).toBe(6);
  });
  it("범·개띠 삼합 best, 양띠 육합 good, 쥐띠 자오충 clash", () => {
    expect(compatWith2026(2).grade).toBe("best"); // 범
    expect(compatWith2026(10).grade).toBe("best"); // 개
    expect(compatWith2026(7).grade).toBe("good"); // 양
    expect(compatWith2026(0).grade).toBe("clash"); // 쥐
    expect(compatWith2026(6).grade).toBe("neutral"); // 말(동일)
  });
  it("computeAnimal(1997) → 소띠", () => {
    expect(computeAnimal(1997).name).toBe("소띠");
  });
});

describe("생명수 (마스터수 유지)", () => {
  it("35 → 8", () => {
    expect(reduceToLifeNumber(35)).toBe(8);
  });
  it("29 → 11 (마스터수 유지)", () => {
    expect(reduceToLifeNumber(29)).toBe(11);
  });
  it("22 유지, 11 유지", () => {
    expect(reduceToLifeNumber(22)).toBe(22);
    expect(reduceToLifeNumber(11)).toBe(11);
  });
  it("1997-03-15 → 8", () => {
    expect(computeLifeNumber(1997, 3, 15)).toBe(8);
  });
});

describe("오행 보완 (일간을 生하는 오행)", () => {
  it("화 → 목, 목 → 수, 수 → 금", () => {
    expect(lackingElement("화")).toBe("목");
    expect(lackingElement("목")).toBe("수");
    expect(lackingElement("수")).toBe("금");
  });
});

describe("두 사람 일지 관계", () => {
  it("자-오 충, 오-미 육합, 인-오 삼합, 자-축 육합", () => {
    expect(branchRelation(0, 6).grade).toBe("clash");
    expect(branchRelation(6, 7).grade).toBe("good");
    expect(branchRelation(2, 6).grade).toBe("best");
    expect(branchRelation(0, 1).grade).toBe("good");
  });
});

describe("computeFortune 통합", () => {
  it("1997-03-15 전체 결과", () => {
    const f = computeFortune("1997-03-15");
    expect(f.dayPillar.ganzhi).toBe("병진");
    expect(f.dayPillar.element).toBe("화");
    expect(f.zodiacSign).toBe("물고기자리");
    expect(f.animal.name).toBe("소띠");
    expect(f.lifeNumber).toBe(8);
    expect(f.ohaeng.lackingElement).toBe("목");
  });
  it("잘못된 형식은 예외", () => {
    expect(() => computeFortune("1997/03/15")).toThrow();
  });
});
