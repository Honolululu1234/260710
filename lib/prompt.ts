// prompt.ts — LLM 시스템/유저 프롬프트 빌더
// LLM은 "해석과 카피"만 담당. 계산 결과(FortuneResult)를 주입받아 JSON만 반환.
import type { FortuneResult, CompatContext, Gift } from "../types";
import { catalogForPrompt } from "./gifts";

export const SYSTEM_PROMPT = `당신은 사주·별자리·수비학을 유쾌하게 버무리는 "선물 운세 큐레이터"입니다.
주어진 운세 계산 결과(JSON)를 해석해 따뜻하고 재치 있는 한국어 카피를 씁니다.

반드시 지킬 규칙:
1. 출력은 오직 JSON 객체 하나. 마크다운·설명·코드펜스 금지.
2. picks는 정확히 3개. giftId는 반드시 제공된 "선물 카탈로그"의 id 중에서만 고른다. 카탈로그에 없는 id를 절대 만들지 않는다.
3. narrative는 3~4문장. 일주 캐릭터 + 2026 병오년 기운 + (궁합 정보가 있으면) 관계 한 줄을 하나의 자연스러운 이야기로 합성한다. 4개 레이어를 나열하지 말 것.
4. 근거를 은근히 녹이되 어렵게 쓰지 말 것. 점집이 아니라 센스있는 친구 톤.
5. 각 pick의 reason은 1~2문장. 왜 이 사람에게 이 선물인지 오행/성향과 연결.

출력 형식:
{"narrative":"...","needs":["태그1","태그2"],"picks":[{"giftId":"...","reason":"..."},{"giftId":"...","reason":"..."},{"giftId":"...","reason":"..."}]}`;

export function buildUserPrompt(
  fortune: FortuneResult,
  candidates: Gift[],
  compat?: CompatContext,
): string {
  const parts: string[] = [];

  parts.push("[받는 사람 운세 계산 결과]");
  parts.push(
    JSON.stringify(
      {
        일주: fortune.dayPillar.ganzhi,
        일간캐릭터: fortune.dayPillar.characterKey,
        일간오행: fortune.dayPillar.element,
        별자리: fortune.zodiacSign,
        띠: fortune.animal.name,
        "2026상성": `${fortune.animal.compat2026} (${fortune.animal.compatReason})`,
        생명수: fortune.lifeNumber,
        보완오행: fortune.ohaeng.lackingElement,
        성향태그: fortune.ohaeng.tags,
      },
      null,
      0,
    ),
  );

  if (compat) {
    parts.push("\n[궁합 — 보조 레이어. narrative에 한 줄만 녹일 것]");
    parts.push(
      JSON.stringify(
        {
          보내는사람_일주: compat.sender.dayPillar.ganzhi,
          보내는사람_띠: compat.sender.animal.name,
          두사람_일지관계: compat.relationLabel,
          관계등급: compat.branchRelation,
        },
        null,
        0,
      ),
    );
  }

  parts.push("\n[선물 카탈로그 — 이 안의 id만 사용]");
  parts.push(catalogForPrompt(candidates));

  parts.push(
    `\n위 사람에게 어울리는 선물 3종을 카탈로그에서 골라, 지정된 JSON 형식으로만 답하세요. 보완오행(${fortune.ohaeng.lackingElement})을 우선 고려하되 성향 태그와도 어울리게.`,
  );

  return parts.join("\n");
}
