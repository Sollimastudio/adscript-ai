import { NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

type RiskLevel = 'alto' | 'medio' | 'baixo';

interface ScriptData {
  score: {
    total: number;
    relevancia: number;
    hookQuality: number;
    compliance: number;
    engajamento: number;
  };
  hook: {
    texto: string;
    acao: string;
  };
  roteiro: string;
  direcaoCena: string;
  dicasRetencao: Array<{
    momento: string;
    dica: string;
    risco: string;
  }>;
  compliance: Array<{
    item: string;
    status: string;
  }>;
  ctaFinal: string;
  frameworkUsado: string;
  preAprovador?: {
    status: 'aprovado' | 'revisado';
    riscoGeral: RiskLevel;
    pontuacao: number;
    resumo: string;
    problemas: Array<{
      regra: string;
      campo: 'hook' | 'roteiro' | 'ctaFinal';
      risco: RiskLevel;
      trecho: string;
      recomendacao: string;
    }>;
  };
}

type PreApproverIssue = {
  regra: string;
  campo: 'hook' | 'roteiro' | 'ctaFinal';
  risco: RiskLevel;
  trecho: string;
  recomendacao: string;
};

interface Rule {
  id: string;
  label: string;
  risk: RiskLevel;
  pattern: RegExp;
  recommendation: string;
}

const PRE_APPROVAL_RULES: Rule[] = [
  {
    id: 'promessa_absoluta',
    label: 'Promessa absoluta/garantia',
    risk: 'alto',
    pattern: /\b(100%|garantid[oa]s?|sem\s+erro|sem\s+falha|resultado\s+imediato)\b/i,
    recommendation: 'Trocar promessa absoluta por linguagem de probabilidade e consistencia.',
  },
  {
    id: 'claim_financeira_agressiva',
    label: 'Claim financeira agressiva',
    risk: 'alto',
    pattern: /\b(ganhe|fature)\s*r?\$?\s*[\d.,]+\b|\b(fique\s+rico|enrique[çc]a\s+r[aá]pido)\b/i,
    recommendation: 'Evitar promessa financeira direta e foco em beneficio pratico verificavel.',
  },
  {
    id: 'prazo_irreal',
    label: 'Prazo potencialmente irreal',
    risk: 'medio',
    pattern: /\bem\s*\d+\s*(dia|dias|hora|horas|semana|semanas)\b/i,
    recommendation: 'Remover prazo absoluto e usar janela realista com contexto.',
  },
  {
    id: 'atributo_pessoal_invasivo',
    label: 'Atributo pessoal invasivo',
    risk: 'alto',
    pattern: /\bvoc[eê]\s+(est[aá]|tem|sofre|[ée])\s+(depress[aã]o|ansiedade|d[ií]vida|obesidade|trauma|doente)\b/i,
    recommendation: 'Reformular para contexto geral sem apontar caracteristica pessoal sensivel.',
  },
  {
    id: 'clickbait_agressivo',
    label: 'Clickbait agressivo',
    risk: 'medio',
    pattern: /\b(segredo\s+proibido|ningu[eé]m\s+te\s+conta|chocante|imperd[ií]vel)\b/i,
    recommendation: 'Reduzir sensacionalismo e priorizar promessa clara de valor.',
  },
];

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(100, Math.round(parsed)));
    }
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function extractSnippet(text: string, pattern: RegExp): string {
  const match = new RegExp(pattern.source, pattern.flags.replace('g', '')).exec(text);
  if (!match) return '';
  const start = Math.max(0, match.index - 28);
  const end = Math.min(text.length, match.index + match[0].length + 28);
  return text.slice(start, end).trim();
}

function applyAutoFixes(text: string): string {
  let updated = text;
  updated = updated.replace(/\b100%\b/gi, 'alta chance');
  updated = updated.replace(/\bgarantid[oa]s?\b/gi, 'consistente');
  updated = updated.replace(/\b(ganhe|fature)\s*r?\$?\s*[\d.,]+\b/gi, 'gere resultado real');
  updated = updated.replace(/\b(fique\s+rico|enrique[çc]a\s+r[aá]pido)\b/gi, 'construa resultados sustentaveis');
  updated = updated.replace(/\bem\s*\d+\s*(dia|dias|hora|horas|semana|semanas)\b/gi, 'com consistencia');
  updated = updated.replace(
    /\bvoc[eê]\s+(est[aá]|tem|sofre|[ée])\s+(depress[aã]o|ansiedade|d[ií]vida|obesidade|trauma|doente)\b/gi,
    'muitas pessoas enfrentam esse cenario'
  );
  updated = updated.replace(/\b(segredo\s+proibido|ningu[eé]m\s+te\s+conta|chocante|imperd[ií]vel)\b/gi, 'insight pratico');
  return updated;
}

function normalizeScriptData(input: unknown): ScriptData | null {
  if (!input || typeof input !== 'object') return null;

  const raw = input as Record<string, unknown>;
  const scoreRaw = (raw.score && typeof raw.score === 'object') ? raw.score as Record<string, unknown> : {};
  const hookRaw = (raw.hook && typeof raw.hook === 'object') ? raw.hook as Record<string, unknown> : {};
  const tipsRaw = Array.isArray(raw.dicasRetencao) ? raw.dicasRetencao : [];
  const complianceRaw = Array.isArray(raw.compliance) ? raw.compliance : [];

  const normalized: ScriptData = {
    score: {
      total: toNumber(scoreRaw.total, 0),
      relevancia: toNumber(scoreRaw.relevancia, 0),
      hookQuality: toNumber(scoreRaw.hookQuality, 0),
      compliance: toNumber(scoreRaw.compliance, 0),
      engajamento: toNumber(scoreRaw.engajamento, 0),
    },
    hook: {
      texto: toStringValue(hookRaw.texto),
      acao: toStringValue(hookRaw.acao),
    },
    roteiro: toStringValue(raw.roteiro),
    direcaoCena: toStringValue(raw.direcaoCena),
    dicasRetencao: tipsRaw
      .filter((tip): tip is Record<string, unknown> => !!tip && typeof tip === 'object')
      .map((tip) => ({
        momento: toStringValue(tip.momento),
        dica: toStringValue(tip.dica),
        risco: toStringValue(tip.risco),
      }))
      .filter((tip) => tip.momento || tip.dica),
    compliance: complianceRaw
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item) => ({
        item: toStringValue(item.item),
        status: toStringValue(item.status),
      }))
      .filter((item) => item.item),
    ctaFinal: toStringValue(raw.ctaFinal),
    frameworkUsado: toStringValue(raw.frameworkUsado, 'AIDA'),
  };

  if (!normalized.hook.texto && !normalized.roteiro && !normalized.ctaFinal) {
    return null;
  }

  return normalized;
}

function runPreApprover(data: ScriptData): ScriptData {
  const issues: PreApproverIssue[] = [];
  const fields: Array<{ key: 'hook' | 'roteiro' | 'ctaFinal'; text: string }> = [
    { key: 'hook', text: data.hook.texto },
    { key: 'roteiro', text: data.roteiro },
    { key: 'ctaFinal', text: data.ctaFinal },
  ];

  for (const field of fields) {
    for (const rule of PRE_APPROVAL_RULES) {
      if (!field.text) continue;
      if (new RegExp(rule.pattern.source, rule.pattern.flags.replace('g', '')).test(field.text)) {
        issues.push({
          regra: rule.label,
          campo: field.key,
          risco: rule.risk,
          trecho: extractSnippet(field.text, rule.pattern),
          recomendacao: rule.recommendation,
        });
      }
    }
  }

  const correctedHook = applyAutoFixes(data.hook.texto);
  const correctedRoteiro = applyAutoFixes(data.roteiro);
  const correctedCta = applyAutoFixes(data.ctaFinal);

  const highRisk = issues.filter((issue) => issue.risco === 'alto').length;
  const mediumRisk = issues.filter((issue) => issue.risco === 'medio').length;
  const pontuacao = Math.max(0, 100 - (highRisk * 18 + mediumRisk * 8));

  const riscoGeral: RiskLevel = highRisk > 0 ? 'alto' : mediumRisk > 0 ? 'medio' : 'baixo';
  const status: 'aprovado' | 'revisado' = issues.length > 0 ? 'revisado' : 'aprovado';

  const resumo =
    status === 'aprovado'
      ? 'Nenhum padrao de risco foi detectado pelas regras internas de pre-aprovacao.'
      : `${issues.length} ajuste(s) aplicado(s) para reduzir risco de reprovacao e melhorar compliance.`;

  const nextCompliance = [
    ...data.compliance,
    {
      item: 'Pre-aprovador interno (regras deterministicas)',
      status,
    },
  ];

  return {
    ...data,
    hook: {
      ...data.hook,
      texto: correctedHook,
    },
    roteiro: correctedRoteiro,
    ctaFinal: correctedCta,
    compliance: nextCompliance,
    score: {
      ...data.score,
      compliance: Math.max(0, Math.round((data.score.compliance + pontuacao) / 2)),
      total: Math.max(0, Math.round((data.score.total + pontuacao) / 2)),
    },
    preAprovador: {
      status,
      riscoGeral,
      pontuacao,
      resumo,
      problemas: issues,
    },
  };
}

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
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OPENROUTER_API_KEY não configurada no servidor.' },
        { status: 500 }
      );
    }

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
    let parsedData: unknown;
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
      parsedData = JSON.parse(cleaned);
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

    const normalizedData = normalizeScriptData(parsedData);

    if (!normalizedData) {
      return NextResponse.json({
        success: true,
        data: {
          raw: rawContent,
          parseError: true,
          error: 'JSON recebido sem o formato minimo esperado.',
        }
      });
    }

    const enrichedData = runPreApprover(normalizedData);

    return NextResponse.json({ success: true, data: enrichedData });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("Generate error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
