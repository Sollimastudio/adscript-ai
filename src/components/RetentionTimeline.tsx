"use client";

import React from "react";

interface TimelineItem {
  momento: string;
  dica: string;
  risco: string;
}

interface RetentionTimelineProps {
  items: TimelineItem[];
  duracao: string;
}

export default function RetentionTimeline({ items, duracao }: RetentionTimelineProps) {
  const totalSeconds = parseInt(duracao) || 30;

  const getSegmentColor = (risco: string) => {
    switch (risco.toLowerCase()) {
      case "alto":
        return "linear-gradient(135deg, #ef4444, #ec4899)";
      case "medio":
        return "linear-gradient(135deg, #f59e0b, #f97316)";
      case "baixo":
        return "linear-gradient(135deg, #10b981, #06b6d4)";
      default:
        return "linear-gradient(135deg, #8b5cf6, #06b6d4)";
    }
  };

  const getRiscoLabel = (risco: string) => {
    switch (risco.toLowerCase()) {
      case "alto": return "⚠️ Alto risco";
      case "medio": return "🟡 Médio";
      case "baixo": return "✅ Seguro";
      default: return risco;
    }
  };

  // Calculate segment widths based on time ranges
  const getSegmentWidth = (momento: string) => {
    const match = momento.match(/(\d+)-(\d+)/);
    if (match) {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      return ((end - start) / totalSeconds) * 100;
    }
    return 100 / (items.length || 1);
  };

  return (
    <div className="retention-timeline">
      <div className="timeline-bar">
        {items.map((item, i) => (
          <div
            key={i}
            className="timeline-segment"
            style={{
              width: `${getSegmentWidth(item.momento)}%`,
              background: getSegmentColor(item.risco),
            }}
            title={`${item.momento}: ${item.dica}`}
          >
            {item.momento}
          </div>
        ))}
      </div>
      <div className="timeline-labels">
        <span className="timeline-label">0s</span>
        <span className="timeline-label">{Math.round(totalSeconds / 2)}s</span>
        <span className="timeline-label">{totalSeconds}s</span>
      </div>

      {/* Detailed tips */}
      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "8px",
              borderLeft: `3px solid ${item.risco === "alto" ? "#ef4444" : item.risco === "medio" ? "#f59e0b" : "#10b981"}`,
              fontSize: "0.85rem",
            }}
          >
            <span style={{ fontWeight: 600, minWidth: "60px", color: "var(--text-secondary)" }}>
              {item.momento}
            </span>
            <span style={{ flex: 1, color: "rgba(255,255,255,0.85)" }}>{item.dica}</span>
            <span style={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}>{getRiscoLabel(item.risco)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
