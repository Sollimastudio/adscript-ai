import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `Você é um Analista de Tendências e Estrategista Chefe de Redes Sociais Tropicais (focado no Brasil).
Sua função é identificar o que está viralizando EXATAMENTE AGORA para o Nicho fornecido e ditar o próximo grande Insight.

REGRAS OBRIGATÓRIAS DE RETORNO:
1. Retorne APENAS um texto puro, direto, sem introduções de "Aqui está". 
2. Você fornecerá UM tema altamente disruptivo que o público daquele nicho engaja muito agora.
3. Junto ao tema, entregue 3 palavras-chave de ouro que estão em alta (para o algoritmo entregar o vídeo).

Formato de Resposta (Mantenha EXATAMENTE este molde, preenchendo as informações):
Assunto Forte: [Escreva o insight disruptivo ou a dor urgente relacionada ao nicho]
Palavras-chave: [Palavra 1], [Palavra 2], [Palavra 3]`;

export async function POST(req: Request) {
  try {
    const { nicho } = await req.json();

    if (!nicho || !nicho.trim()) {
      return NextResponse.json(
        { success: false, error: 'É necessário preencher o "Nicho / Público-alvo" primeiro.' },
        { status: 400 }
      );
    }

    const payload = {
      model: "qwen/qwen3.6-plus:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Nicho: ${nicho}. Qual o tema viral agora?` }
      ],
      temperature: 0.9,
      max_tokens: 300
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
        "X-Title": "AdScript AI - Trends",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("OpenRouter error no /api/trends:", errText);
        return NextResponse.json(
            { success: false, error: "Erro na API de tendências." },
            { status: response.status }
        );
    }

    const data = await response.json();
    const trendText = data.choices[0].message.content.trim();

    return NextResponse.json({ success: true, trend: trendText });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Trend generation error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
