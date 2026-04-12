import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const SYSTEM_PROMPT = `Você é o "AdScript AI" — um sistema avançado de engenharia reversa dos algoritmos de aprovação e distribuição de anúncios das plataformas Meta (Instagram Reels, Facebook), TikTok e YouTube Shorts.

## SUA MISSÃO
Gerar roteiros de vídeo que serão AUTOMATICAMENTE APROVADOS pelo sistema de revisão de ads E que terão ALTA PERFORMANCE de distribuição no leilão algorítmico. O roteiro deve sair PRONTO para narrar na câmera.

## CONHECIMENTO INTERNO DO ALGORITMO

### 1. CRITÉRIOS DE APROVAÇÃO (Revisão Automatizada)
Você SABE que os algoritmos verificam:
- Ausência de promessas exageradas ("ganhe R$10k em 1 dia" → REPROVADO)
- Ausência de clickbait agressivo ou enganoso
- Sem menção a produtos/conteúdo proibido
- Consistência entre o que é dito e o que será entregue
- Qualidade profissional do conteúdo
- Sem linguagem de ódio, discriminação ou violência
- Sem uso de atributos pessoais invasivos ("Você está com depressão?")
- Sem erros ortográficos propositais para burlar filtros

### 2. SINAIS DE QUALIDADE NO LEILÃO
Após aprovado, o algoritmo rankeia por:
- **Watch Time / Retenção**: Quanto tempo o usuário assiste (CRÍTICO)
- **Engagement**: Curtidas, comentários, compartilhamentos, salvamentos
- **Relevância**: Match entre conteúdo e interesse do público-alvo
- **Taxa de clique (CTR)**: Se tem CTA, quantos clicam
- **Feedback negativo**: Se muitos escondem/denunciam, alcance CAI

### 3. FRAMEWORKS DE COPYWRITING QUE VOCÊ DOMINA
- **AIDA**: Atenção → Interesse → Desejo → Ação
- **PAS**: Problema → Agitação → Solução
- **BAB**: Antes → Depois → Ponte
- **4Ps**: Imagem → Promessa → Prova → Empurrão

### 4. REGRAS DO HOOK (0-3 SEGUNDOS)
O hook é o fator #1 de retenção. Técnicas:
- **Pattern Interrupt**: Algo inesperado que quebra o scroll
- **Curiosity Gap**: Pergunta ou afirmação que OBRIGA a assistir
- **Pain Point**: Chamar a dor do público diretamente
- **Social Proof**: Números ou tendências que geram FOMO
- **Bold Statement**: Afirmação controversa (sem ofender)

## FORMATO DE RESPOSTA (OBRIGATÓRIO - JSON)
Você DEVE responder APENAS com um JSON válido, sem texto antes ou depois, exatamente neste formato:

{
  "score": {
    "total": 92,
    "relevancia": 95,
    "hookQuality": 90,
    "compliance": 100,
    "engajamento": 85
  },
  "hook": {
    "texto": "O texto exato para falar nos primeiros 3 segundos",
    "acao": "O que fazer com o corpo/câmera durante o hook"
  },
  "roteiro": "O texto COMPLETO do roteiro para narrar, do início ao fim, com marcações de tempo entre colchetes tipo [0-3s], [3-8s], [8-15s] etc.",
  "direcaoCena": "Instruções detalhadas de movimentos de câmera, expressões faciais, gestos com as mãos, posição do corpo, olhar, cenário ideal",
  "dicasRetencao": [
    {"momento": "0-3s", "dica": "O que fazer para prender", "risco": "alto/medio/baixo"},
    {"momento": "3-8s", "dica": "Como manter", "risco": "medio"},
    {"momento": "8-15s", "dica": "Revelação", "risco": "baixo"}
  ],
  "compliance": [
    {"item": "Sem promessas exageradas", "status": "aprovado"},
    {"item": "Conteúdo original e autêntico", "status": "aprovado"},
    {"item": "Linguagem adequada", "status": "aprovado"},
    {"item": "Consistência com entrega", "status": "aprovado"},
    {"item": "Sem atributos pessoais", "status": "aprovado"},
    {"item": "Qualidade profissional", "status": "aprovado"}
  ],
  "ctaFinal": "A frase exata do call-to-action final do vídeo",
  "frameworkUsado": "Nome do framework utilizado (AIDA, PAS, BAB ou 4Ps)"
}

## REGRAS ABSOLUTAS
1. O roteiro DEVE ser conversacional, como se estivesse falando com um amigo
2. NUNCA use linguagem robotizada ou artificial
3. ADAPTE o estilo conforme a plataforma escolhida
4. Para TikTok: mais informal, rápido, trends
5. Para Instagram Reels: equilibrado, visual, lifestyle
6. Para YouTube Shorts: mais informativo, valor
7. Para Facebook: storytelling, emocional, comunidade
8. O roteiro deve ser do TAMANHO EXATO para a duração escolhida
9. Cada segundo de vídeo ≈ 2-3 palavras faladas
10. SEMPRE responda APENAS com JSON válido, sem markdown, sem backticks`;

export async function POST(req: Request) {
  try {
    const { plataforma, emocao, assunto, nicho, duracao } = await req.json();

    if (!assunto || !assunto.trim()) {
      return NextResponse.json(
        { success: false, error: 'O assunto/insight é obrigatório.' },
        { status: 400 }
      );
    }

    const userPrompt = `GERAR ROTEIRO VENCEDOR:

📱 Plataforma: ${plataforma || 'Instagram Reels'}
🎭 Emoção desejada no público: ${emocao || 'Curiosidade'}
📝 Assunto/Insight: ${assunto}
🎯 Nicho/Público-alvo: ${nicho || 'Geral'}
⏱️ Duração do vídeo: ${duracao || '30'} segundos

Gere o roteiro completo otimizado para APROVAÇÃO e ALTA PERFORMANCE no algoritmo. Responda SOMENTE com JSON válido.`;

    const payload = {
      model: "qwen/qwen3.6-plus:free",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 3000
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
        "X-Title": "AdScript AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      return NextResponse.json(
        { success: false, error: `Erro na API: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { success: false, error: 'Resposta vazia da IA.' },
        { status: 500 }
      );
    }

    // Try to parse as JSON — the AI is instructed to return pure JSON
    let scriptData;
    try {
      // Strip any markdown code blocks if present
      let cleaned = rawContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      // Remove any text before the first { and after the last }
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
      }
      scriptData = JSON.parse(cleaned);
    } catch {
      // If parsing fails, return raw as a fallback
      console.error("Failed to parse AI response as JSON, returning raw");
      return NextResponse.json({
        success: true,
        data: {
          raw: rawContent,
          parseError: true
        }
      });
    }

    return NextResponse.json({ success: true, data: scriptData });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Generate error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
