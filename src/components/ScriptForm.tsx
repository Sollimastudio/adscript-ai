"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface ScriptFormProps {
  plataforma: string;
  setPlataforma: (v: string) => void;
  emocao: string;
  setEmocao: (v: string) => void;
  assunto: string;
  setAssunto: (v: string) => void;
  nicho: string;
  setNicho: (v: string) => void;
  duracao: string;
  setDuracao: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PLATAFORMAS = [
  { id: "instagram", label: "Instagram Reels", icon: "📸" },
  { id: "tiktok", label: "TikTok", icon: "🎵" },
  { id: "youtube", label: "YouTube Shorts", icon: "▶️" },
  { id: "facebook", label: "Facebook", icon: "👥" },
];

const EMOCOES = [
  { id: "curiosidade", label: "Curiosidade", emoji: "🤔" },
  { id: "urgencia", label: "Urgência", emoji: "⚡" },
  { id: "fomo", label: "FOMO", emoji: "🔥" },
  { id: "empatia", label: "Empatia", emoji: "💛" },
  { id: "autoridade", label: "Autoridade", emoji: "👑" },
  { id: "inspiracao", label: "Inspiração", emoji: "✨" },
  { id: "humor", label: "Humor", emoji: "😂" },
  { id: "medo", label: "Medo", emoji: "😨" },
];

const DURACOES = [
  { value: "15", label: "Rápido" },
  { value: "30", label: "Padrão" },
  { value: "60", label: "Médio" },
  { value: "90", label: "Longo" },
];

export default function ScriptForm({
  plataforma,
  setPlataforma,
  emocao,
  setEmocao,
  assunto,
  setAssunto,
  nicho,
  setNicho,
  duracao,
  setDuracao,
  onSubmit,
  isLoading,
}: ScriptFormProps) {
  
  // States for the new Didactic Features
  const [recommendedEmotions, setRecommendedEmotions] = useState<string[]>([]);
  const [timeMessage, setTimeMessage] = useState("");
  const [isGeneratingTrend, setIsGeneratingTrend] = useState(false);
  const [trendError, setTrendError] = useState("");

  // Determine emotional recommendation based on time
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 11) {
      setRecommendedEmotions(["inspiracao", "autoridade"]);
      setTimeMessage("Bom dia! Pela manhã as pessoas buscam Inspiração e Direção (Autoridade).");
    } else if (hour >= 11 && hour < 14) {
      setRecommendedEmotions(["curiosidade", "humor"]);
      setTimeMessage("Horário de almoço! Aposte em Curiosidade rápida ou Humor.");
    } else if (hour >= 14 && hour < 18) {
      setRecommendedEmotions(["urgencia", "autoridade"]);
      setTimeMessage("Tarde! Momento ideal para quebrar procrastinação (Urgência) e Autoridade.");
    } else {
      setRecommendedEmotions(["fomo", "empatia", "medo"]);
      setTimeMessage("Noite! Público descontraído. Use Empatia ou gatilhos fortes (FOMO/Medo).");
    }
  }, []);

  const handleGenerateTrend = async () => {
    if (!nicho.trim()) {
      setTrendError("Por favor, preencha seu 'Nicho' primeiro (Passo 3) para a IA saber sobre o que pesquisar!");
      return;
    }
    
    setIsGeneratingTrend(true);
    setTrendError("");

    try {
      const response = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicho }),
      });

      const data = await response.json();
      if (data.success) {
        setAssunto(data.trend);
      } else {
        setTrendError(data.error || "Falha ao puxar assuntos.");
      }
    } catch (error) {
      setTrendError("Erro de conexão ao buscar trends.");
    } finally {
      setIsGeneratingTrend(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="form-section">
      <div className="glass-card elevated">
        
        {/* Platform Selection */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">1</span>
            Onde você vai postar?
          </label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px", marginTop: "-6px" }}>
            O algoritmo formata o vídeo de acordo com as regras exatas de cada rede.
          </p>
          <div className="platform-grid">
            {PLATAFORMAS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`platform-btn ${plataforma === p.id ? "active" : ""}`}
                onClick={() => setPlataforma(p.id)}
              >
                <span className="platform-icon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Emotion Selection */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">2</span>
            Qual emoção você quer causar no público?
          </label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px", marginTop: "-6px" }}>
            As pessoas compram ou interagem pela emoção. Escolha o gatilho principal.
          </p>
          
          <div style={{ padding: "8px 12px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", fontSize: "0.8rem", color: "#10b981", marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            🕒 {timeMessage}
          </div>

          <div className="emotion-grid">
            {EMOCOES.map((e) => {
              const isRecommended = recommendedEmotions.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  className={`emotion-btn ${emocao === e.id ? "active" : ""} ${isRecommended && emocao !== e.id ? "recommended-pulse" : ""}`}
                  style={isRecommended && emocao !== e.id ? { borderColor: "rgba(16, 185, 129, 0.5)" } : {}}
                  onClick={() => setEmocao(e.id)}
                >
                  <span className="emotion-emoji">{e.emoji}</span>
                  {e.label}
                  {isRecommended && <span style={{ fontSize: "0.6rem", color: "#10b981", marginLeft: "auto", fontWeight: 700 }}>🔥</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Niche - MOVED UP TO STEP 3 IN ORDER TO USE TREND BUTTON LOGICALLY */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">3</span>
            Quem você quer atingir? (Qual é o seu Nicho?)
          </label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px", marginTop: "-6px" }}>
            Exemplo: Empreendedorismo materno, Nutrição, Engenheiros, Autônomos.
          </p>
          <input
            type="text"
            className="form-input"
            placeholder="Ex: empreendedores digitais, mães, fitness, finanças pessoais..."
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
          />
        </div>

        {/* Subject */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">4</span>
            Qual é o assunto ou produto?
          </label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px", marginTop: "-6px" }}>
            Escreva sua ideia AQUI, ou peça para a IA sugerir uma tendência no seu Nicho!
          </p>
          
          <button
            type="button"
            onClick={handleGenerateTrend}
            disabled={isGeneratingTrend}
            style={{ marginBottom: "12px", background: "linear-gradient(90deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))", border: "1px solid rgba(139, 92, 246, 0.4)", borderRadius: "8px", padding: "10px 16px", color: "#f8fafc", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.2s" }}
            className="trend-button"
          >
            {isGeneratingTrend ? <Loader2 size={16} className="spin-anim" /> : <Sparkles size={16} color="#06b6d4" />}
            {isGeneratingTrend ? "Caçando assuntos em alta..." : "✨ Magia: Sugerir um Tema em Alta"}
          </button>
          
          {trendError && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "8px" }}>{trendError}</p>
          )}

          <textarea
            className="form-textarea"
            placeholder="A IA escreverá o tema sugerido aqui, ou você mesmo pode digitar sua ideia central (Ex: Por que dietas restritivas não funcionam no longo prazo...)"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            rows={4}
          />
        </div>

        {/* Duration */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">5</span>
            Qual será a duração do vídeo?
          </label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px", marginTop: "-6px" }}>
            Isso define o tamanho do texto que você terá que narrar.
          </p>
          <div className="duration-grid">
            {DURACOES.map((d) => (
               <button
                key={d.value}
                type="button"
                className={`duration-btn ${duracao === d.value ? "active" : ""}`}
                onClick={() => setDuracao(d.value)}
              >
                <span className="duration-value">{d.value}s</span>
                <span className="duration-label">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="submit-btn"
          disabled={isLoading || !assunto.trim() || isGeneratingTrend}
        >
          🚀 Gerar Roteiro Vencedor
        </button>
      </div>
    </form>
  );
}
