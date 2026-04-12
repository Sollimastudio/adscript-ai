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
            <span className="label-icon">3</span>
            Qual é o assunto, a ideia ou o produto?
          </label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px", marginTop: "-6px" }}>
            Escreva do seu jeito a mensagem central do vídeo. A inteligência artificial vai organizar isso no formato vencedor.
          </p>
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
            <span className="label-icon">4</span>
            Quem você quer atingir? (Público-alvo)
          </label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px", marginTop: "-6px" }}>
            Definir o público ajuda a IA a escolher as palavras que mais conectam com eles.
          </p>
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
          disabled={isLoading || !assunto.trim()}
        >
          🚀 Gerar Roteiro Vencedor
        </button>
      </div>
    </form>
  );
}
