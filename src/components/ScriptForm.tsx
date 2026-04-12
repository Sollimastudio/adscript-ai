"use client";

import React from "react";

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
            <span className="label-icon">📱</span>
            Plataforma
          </label>
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
            <span className="label-icon">🎭</span>
            Emoção que você quer causar
          </label>
          <div className="emotion-grid">
            {EMOCOES.map((e) => (
              <button
                key={e.id}
                type="button"
                className={`emotion-btn ${emocao === e.id ? "active" : ""}`}
                onClick={() => setEmocao(e.id)}
              >
                <span className="emotion-emoji">{e.emoji}</span>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">💡</span>
            Assunto ou Insight
          </label>
          <textarea
            className="form-textarea"
            placeholder="Ex: As pessoas compram por emoção e justificam com lógica. Por isso, quem vende lógica perde para quem vende desejo..."
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            rows={4}
          />
        </div>

        {/* Niche */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">🎯</span>
            Nicho / Público-alvo
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Ex: empreendedores digitais, mães, fitness, finanças pessoais..."
            value={nicho}
            onChange={(e) => setNicho(e.target.value)}
          />
        </div>

        {/* Duration */}
        <div className="form-group">
          <label className="form-label">
            <span className="label-icon">⏱️</span>
            Duração do Vídeo
          </label>
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
          disabled={isLoading || !assunto.trim()}
        >
          🚀 Gerar Roteiro Vencedor
        </button>
      </div>
    </form>
  );
}
