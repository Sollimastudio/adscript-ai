"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import ScriptForm from "@/components/ScriptForm";
import ScriptResult from "@/components/ScriptResult";

type AppState = "form" | "loading" | "result" | "error";

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
}

const LOADING_STEPS = [
  "Analisando critérios de aprovação...",
  "Selecionando framework de copywriting...",
  "Engenheirando hook de retenção...",
  "Gerando roteiro otimizado...",
  "Verificando compliance do algoritmo...",
  "Calculando score de aprovação...",
];

export default function Home() {
  // Form state
  const [plataforma, setPlataforma] = useState("instagram");
  const [emocao, setEmocao] = useState("curiosidade");
  const [assunto, setAssunto] = useState("");
  const [nicho, setNicho] = useState("");
  const [duracao, setDuracao] = useState("30");

  // App state
  const [appState, setAppState] = useState<AppState>("form");
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [error, setError] = useState("");
  const [activeLoadingStep, setActiveLoadingStep] = useState(0);

  // Loading step animation
  useEffect(() => {
    if (appState !== "loading") return;

    const interval = setInterval(() => {
      setActiveLoadingStep((prev) => {
        if (prev >= LOADING_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [appState]);

  const handleGenerate = async () => {
    if (!assunto.trim()) return;

    setAppState("loading");
    setActiveLoadingStep(0);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plataforma, emocao, assunto, nicho, duracao }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.parseError) {
          // Fallback: show raw text
          setError("A IA retornou uma resposta não-estruturada. Tente novamente.");
          setAppState("error");
        } else {
          setScriptData(result.data);
          setAppState("result");
        }
      } else {
        setError(result.error || "Erro ao gerar roteiro.");
        setAppState("error");
      }
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
      setAppState("error");
    }
  };

  const handleNewScript = () => {
    setAppState("form");
    setScriptData(null);
    setAssunto("");
    setActiveLoadingStep(0);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <Zap size={22} color="#fff" />
          </div>
          <div>
            <h1>AdScript AI</h1>
            <p className="app-logo-subtitle">Roteiros que Vencem o Algoritmo</p>
          </div>
        </div>
        <div className="header-badge">
          <span className="dot"></span>
          IA Ativa
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero - only show in form state */}
        {appState === "form" && (
          <section className="hero-section">
            <h2>
              Gere roteiros que o
              <br />
              <span className="highlight">algoritmo já aprova</span>
            </h2>
            <p>
              Pare de tentar e errar. A IA entende os critérios de aprovação e gera
              o roteiro vencedor na primeira tentativa — pronto para narrar.
            </p>
          </section>
        )}

        {/* Form */}
        {appState === "form" && (
          <ScriptForm
            plataforma={plataforma}
            setPlataforma={setPlataforma}
            emocao={emocao}
            setEmocao={setEmocao}
            assunto={assunto}
            setAssunto={setAssunto}
            nicho={nicho}
            setNicho={setNicho}
            duracao={duracao}
            setDuracao={setDuracao}
            onSubmit={handleGenerate}
            isLoading={false}
          />
        )}

        {/* Loading */}
        {appState === "loading" && (
          <div className="glass-card elevated">
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Processando pelo Algoritmo...</div>
              <div className="loading-subtext">
                Engenheirando o roteiro perfeito para o seu conteúdo
              </div>
              <div className="loading-steps">
                {LOADING_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`loading-step ${i === activeLoadingStep ? "active" : ""} ${i < activeLoadingStep ? "done" : ""}`}
                  >
                    <span className="step-dot"></span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {appState === "result" && scriptData && (
          <ScriptResult
            data={scriptData}
            duracao={duracao}
            onNewScript={handleNewScript}
          />
        )}

        {/* Error */}
        {appState === "error" && (
          <div className="glass-card elevated" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>⚠️</div>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: "8px" }}>
              Algo deu errado
            </h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.9rem" }}>
              {error}
            </p>
            <button className="submit-btn" onClick={handleNewScript} style={{ maxWidth: "300px", margin: "0 auto" }}>
              🔄 Tentar Novamente
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center",
        padding: "20px",
        fontSize: "0.75rem",
        color: "var(--text-muted)",
        position: "relative",
        zIndex: 1
      }}>
        AdScript AI — Engenharia Reversa do Algoritmo de Ads
      </footer>
    </div>
  );
}
