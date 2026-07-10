import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사주선물 — 생일 운세로 고르는 선물",
  description: "생년월일로 보는 올해의 기운과 딱 맞는 선물 3종 추천",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="starfield font-serif antialiased">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
