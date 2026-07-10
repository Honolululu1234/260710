// POST /api/divine — 생일+예산 → fortune 계산 + LLM 1회 호출 → 결과 JSON
// 계산은 서버에서 결정론적으로, LLM은 해석·카피만. 실패 시 fallback으로 데모 유지.
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  computeFortune,
  toJDN,
  dayBranchIndex,
  branchRelation,
} from "@/lib/fortune";
import { filterCandidates, VALID_GIFT_IDS, getGiftById } from "@/lib/gifts";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import { buildFallback } from "@/lib/fallback";
import type {
  PriceTier,
  CompatContext,
  LLMResponse,
  FortuneResult,
} from "@/types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

function dayBranchOf(f: FortuneResult): number {
  return dayBranchIndex(toJDN(f.input.year, f.input.month, f.input.day));
}

/** LLM 원문에서 JSON만 견고하게 추출 */
function parseLLMJson(text: string): LLMResponse | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    const obj = JSON.parse(text.slice(start, end + 1));
    if (!obj.narrative || !Array.isArray(obj.picks)) return null;
    return obj as LLMResponse;
  } catch {
    return null;
  }
}

/** picks의 giftId가 전부 유효한지 + 3개인지 검증 */
function validatePicks(llm: LLMResponse): boolean {
  if (!Array.isArray(llm.picks) || llm.picks.length !== 3) return false;
  return llm.picks.every(
    (p) => p.giftId && VALID_GIFT_IDS.has(p.giftId) && typeof p.reason === "string",
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const receiverBirth: string = body.receiverBirth;
    const senderBirth: string | undefined = body.senderBirth || undefined;
    const priceTier: PriceTier = body.priceTier || "1to3";

    if (!receiverBirth) {
      return NextResponse.json({ error: "receiverBirth 필요" }, { status: 400 });
    }

    // 1. 결정론적 계산
    const fortune = computeFortune(receiverBirth);

    let compat: CompatContext | undefined;
    if (senderBirth) {
      const sender = computeFortune(senderBirth);
      const rel = branchRelation(dayBranchOf(sender), dayBranchOf(fortune));
      compat = {
        sender,
        receiver: fortune,
        branchRelation: rel.grade,
        relationLabel: rel.label,
      };
    }

    // 2. 후보군 필터 (예산 + 보완오행)
    const candidates = filterCandidates(priceTier, fortune.ohaeng.lackingElement);

    // 3. LLM 1회 호출 (실패/무효 시 fallback)
    let llm: LLMResponse;
    let usedFallback = false;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      llm = buildFallback(fortune, candidates, compat);
      usedFallback = true;
    } else {
      try {
        const client = new Anthropic({ apiKey });
        const msg = await client.messages.create({
          model: MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            { role: "user", content: buildUserPrompt(fortune, candidates, compat) },
          ],
        });
        const text = msg.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { text: string }).text)
          .join("");
        const parsed = parseLLMJson(text);
        if (parsed && validatePicks(parsed)) {
          llm = parsed;
        } else {
          llm = buildFallback(fortune, candidates, compat);
          usedFallback = true;
        }
      } catch {
        llm = buildFallback(fortune, candidates, compat);
        usedFallback = true;
      }
    }

    // 4. picks에 실제 gift 데이터 결합
    const picks = llm.picks
      .map((p) => {
        const gift = getGiftById(p.giftId);
        return gift ? { gift, reason: p.reason } : null;
      })
      .filter((x): x is { gift: NonNullable<ReturnType<typeof getGiftById>>; reason: string } => x !== null);

    return NextResponse.json({
      fortune,
      compat: compat
        ? { relationLabel: compat.relationLabel, grade: compat.branchRelation, senderGanzhi: compat.sender.dayPillar.ganzhi }
        : null,
      narrative: llm.narrative,
      needs: llm.needs,
      picks,
      usedFallback,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "계산 실패" },
      { status: 500 },
    );
  }
}
