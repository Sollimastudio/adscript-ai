"use client";

import React from "react";

interface ScoreData {
  total: number;
  relevancia: number;
  hookQuality: number;
  compliance: number;
  engajamento: number;
}

interface AlgorithmScoreProps {
  score: ScoreData;
}

export default function AlgorithmScore({ score }: AlgorithmScoreProps) {
  const total = score.total || 0;
  const circumference = 2 * Math.PI * 54; // radius = 54
  const offset = circumference - (total / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 85) return "var(--score-high)";
    if (val >= 60) return "var(--score-medium)";
    return "var(--score-low)";
  };

  const getScoreGradient = (val: number) => {
    if (val >= 85) return "url(#scoreGradientHigh)";
    if (val >= 60) return "url(#scoreGradientMed)";
    return "url(#scoreGradientLow)";
  };

  const breakdown = [
    { label: "Relevância", value: score.relevancia || 0 },
    { label: "Hook", value: score.hookQuality || 0 },
    { label: "Compliance", value: score.compliance || 0 },
    { label: "Engajamento", value: score.engajamento || 0 },
  ];

  return (
    <div className="score-section">
      <div className="glass-card elevated score-card">
        {/* Circular Gauge */}
        <div className="score-gauge-wrapper">
          <svg className="score-gauge" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="scoreGradientHigh" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="scoreGradientMed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="scoreGradientLow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            <circle
              className="score-gauge-bg"
              cx="60" cy="60" r="54"
            />
            <circle
              className="score-gauge-fill"
              cx="60" cy="60" r="54"
              stroke={getScoreGradient(total)}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="score-value">
            <div className="score-number" style={{ color: getScoreColor(total) }}>
              {total}
            </div>
            <div className="score-label">Score</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="score-breakdown">
          {breakdown.map((item) => (
            <div key={item.label} className="score-item">
              <div className="score-item-label">{item.label}</div>
              <div className="score-item-bar">
                <div
                  className="score-item-fill"
                  style={{
                    width: `${item.value}%`,
                    background: getScoreColor(item.value),
                  }}
                />
              </div>
              <div className="score-item-value" style={{ color: getScoreColor(item.value) }}>
                {item.value}/100
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
