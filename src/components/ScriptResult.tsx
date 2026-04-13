"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCcw } from "lucide-react";
import AlgorithmScore from "./AlgorithmScore";
import RetentionTimeline from "./RetentionTimeline";

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
    status: "aprovado" | "revisado";
    riscoGeral: "alto" | "medio" | "baixo";
    pontuacao: number;
    resumo: string;
    problemas: Array<{
      regra: string;
      campo: "hook" | "roteiro" | "ctaFinal";
      risco: "alto" | "medio" | "baixo";
      trecho: string;
      recomendacao: string;
    }>;
  };
}

interface ScriptResultProps {
  data: ScriptData;
  duracao: string;
  onNewScript: () => void;
}

export default function ScriptResult({ data, duracao, onNewScript }: ScriptResultProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const getRiskColor = (risk: "alto" | "medio" | "baixo") => {
    if (risk === "alto") return "var(--score-low)";
    if (risk === "medio") return "var(--score-medium)";
    return "var(--score-high)";
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const copyFullScript = () => {
    const full = `HOOK (0-3s):\n${data.hook.texto}\n\nROTEIRO COMPLETO:\n${data.roteiro}\n\nDIREÇÃO DE CENA:\n${data.direcaoCena}\n\nCTA FINAL:\n${data.ctaFinal}`;
    copyToClipboard(full, "full");
  };

  return (
    <div className="result-section">
      {/* Header */}
      <div className="result-header">
        <div>
          <h3 className="result-title">✅ Roteiro Aprovado</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "4px" }}>
            Framework: {data.frameworkUsado || "AIDA"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className={`copy-btn ${copiedSection === "full" ? "copied" : ""}`} onClick={copyFullScript}>
            {copiedSection === "full" ? <Check size={14} /> : <Copy size={14} />}
            {copiedSection === "full" ? "Copiado!" : "Copiar Tudo"}
          </button>
          <button className="new-script-btn" onClick={onNewScript}>
            <RotateCcw size={14} />
            Novo Roteiro
          </button>
        </div>
      </div>

      {/* Algorithm Score */}
      <AlgorithmScore score={data.score} />

      {/* Result Blocks */}
      <div className="result-blocks">
          {/* Internal Pre-Approver Block */}
          {data.preAprovador && (
            <div className="glass-card result-block">
              <div className="block-header">
                <div className="block-icon compliance">🛡️</div>
                <div>
                  <div className="block-title">Pré-aprovador Interno</div>
                  <div className="block-subtitle">Análise determinística para reduzir risco de reprovação</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    color: data.preAprovador.status === "aprovado" ? "var(--score-high)" : "var(--score-medium)",
                    border: `1px solid ${data.preAprovador.status === "aprovado" ? "var(--score-high)" : "var(--score-medium)"}`,
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  {data.preAprovador.status}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Score interno: <strong style={{ color: "var(--text-primary)" }}>{data.preAprovador.pontuacao}/100</strong>
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Risco geral: <strong style={{ color: getRiskColor(data.preAprovador.riscoGeral) }}>{data.preAprovador.riscoGeral}</strong>
                </span>
              </div>
              <p className="block-content" style={{ marginBottom: data.preAprovador.problemas.length ? "14px" : 0 }}>
                {data.preAprovador.resumo}
              </p>
              {data.preAprovador.problemas.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {data.preAprovador.problemas.map((problema, i) => (
                    <div
                      key={`${problema.regra}-${i}`}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderLeft: `3px solid ${getRiskColor(problema.risco)}`,
                        borderRadius: "8px",
                        padding: "10px 12px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                        <strong style={{ color: "var(--text-primary)" }}>{problema.regra}</strong>
                        <span style={{ color: getRiskColor(problema.risco), textTransform: "uppercase", fontSize: "0.68rem", fontWeight: 700 }}>
                          {problema.risco}
                        </span>
                      </div>
                      <div style={{ color: "var(--text-secondary)", marginBottom: "4px" }}>
                        Campo: <strong style={{ color: "var(--text-primary)" }}>{problema.campo}</strong>
                      </div>
                      {problema.trecho && (
                        <div style={{ color: "var(--text-secondary)", marginBottom: "4px" }}>
                          Trecho: &ldquo;{problema.trecho}&rdquo;
                        </div>
                      )}
                      <div style={{ color: "var(--text-secondary)" }}>
                        Ajuste: {problema.recomendacao}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Hook Block */}
        <div className="glass-card result-block hook-block">
          <div className="block-header">
            <div className="block-icon hook">🪝</div>
            <div>
              <div className="block-title">HOOK — Primeiros 3 Segundos</div>
              <div className="block-subtitle">O momento mais importante do vídeo</div>
            </div>
            <button
              className={`copy-btn ${copiedSection === "hook" ? "copied" : ""}`}
              onClick={() => copyToClipboard(data.hook.texto, "hook")}
              style={{ marginLeft: "auto" }}
            >
              {copiedSection === "hook" ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <div className="block-content" style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "12px" }}>
            &ldquo;{data.hook.texto}&rdquo;
          </div>
          <div style={{
            padding: "10px 14px",
            background: "rgba(236, 72, 153, 0.08)",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.7)"
          }}>
            🎬 <strong>Ação:</strong> {data.hook.acao}
          </div>
        </div>

        {/* Full Script Block */}
        <div className="glass-card result-block">
          <div className="block-header">
            <div className="block-icon script">📝</div>
            <div>
              <div className="block-title">Roteiro Completo para Narrar</div>
              <div className="block-subtitle">Leia em voz alta olhando para a câmera</div>
            </div>
            <button
              className={`copy-btn ${copiedSection === "roteiro" ? "copied" : ""}`}
              onClick={() => copyToClipboard(data.roteiro, "roteiro")}
              style={{ marginLeft: "auto" }}
            >
              {copiedSection === "roteiro" ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <div className="block-content">{data.roteiro}</div>
        </div>

        {/* Scene Direction Block */}
        <div className="glass-card result-block">
          <div className="block-header">
            <div className="block-icon direction">🎬</div>
            <div>
              <div className="block-title">Direção de Cena</div>
              <div className="block-subtitle">Movimentos de câmera, gestos e expressões</div>
            </div>
          </div>
          <div className="block-content">{data.direcaoCena}</div>
        </div>

        {/* Retention Tips Block */}
        <div className="glass-card result-block">
          <div className="block-header">
            <div className="block-icon retention">💡</div>
            <div>
              <div className="block-title">Timeline de Retenção</div>
              <div className="block-subtitle">Risco de perda de atenção por momento do vídeo</div>
            </div>
          </div>
          {data.dicasRetencao && data.dicasRetencao.length > 0 && (
            <RetentionTimeline items={data.dicasRetencao} duracao={duracao} />
          )}
        </div>

        {/* Compliance Checklist Block */}
        <div className="glass-card result-block">
          <div className="block-header">
            <div className="block-icon compliance">✅</div>
            <div>
              <div className="block-title">Checklist do Algoritmo</div>
              <div className="block-subtitle">Verificação de compliance para aprovação</div>
            </div>
          </div>
          <div className="compliance-list">
            {data.compliance?.map((item, i) => (
              <div key={i} className="compliance-item">
                <div className={`compliance-icon ${item.status === "aprovado" ? "pass" : "warn"}`}>
                  {item.status === "aprovado" ? "✓" : "!"}
                </div>
                <span>{item.item}</span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: item.status === "aprovado" ? "var(--score-high)" : "var(--score-medium)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final Block */}
        <div className="glass-card result-block">
          <div className="block-header">
            <div className="block-icon cta">📋</div>
            <div>
              <div className="block-title">CTA Final</div>
              <div className="block-subtitle">Como encerrar o vídeo</div>
            </div>
          </div>
          <div className="block-content" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            &ldquo;{data.ctaFinal}&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
}
