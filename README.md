# 사주선물 🎁🔮

생년월일 → 운세 내러티브 → 선물 추천 3종 + 공유 카드. 경진대회 라이브 데모용 싱글페이지 웹앱.

## 스택
- Next.js (App Router) + Tailwind CSS
- Anthropic API 1회 호출 (내러티브 + 추천 카피 동시 생성)
- DB 없음 · 선물 시드는 `/data/gifts.json`

## 아키텍처 — 역할 분리
1. **Fortune 계산 = 100% 순수 TS** (`lib/fortune.ts`, 결정론적, LLM 미사용)
   - 일주(60갑자) · 별자리 · 띠 + 2026 병오년 상성 · 생명수 · 보완 오행
2. **LLM = 해석·카피만** — 계산 JSON을 주입받아 `{ narrative, needs, picks×3 }` 반환
3. picks는 `gifts.json`의 id 중에서만 선택 (환각 방지)

## 화면 흐름 (한 페이지 3스텝)
입력(생일 + 예산 + 옵션 상대 생일) → 셔플 로딩 → 결과(내러티브 + 선물 카드 뒤집기 + 공유 PNG)

## 로컬 실행
```bash
npm install
npm run dev
```

프리셋: `?b=1997-03-15` · 예산/궁합 모드 지원.
