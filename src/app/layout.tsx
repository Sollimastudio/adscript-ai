import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdScript AI — Roteiros que o Algoritmo Aprova",
  description: "Gere roteiros vencedores para vídeos de ads. O algoritmo de IA analisa, otimiza e entrega o conteúdo aprovado na primeira tentativa.",
  keywords: "roteiro ads, script video, algoritmo ads, conteúdo aprovado, marketing digital, reels, tiktok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="animated-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
