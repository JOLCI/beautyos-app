import { useState } from 'react'

export function BodyMap({ onNailClick, markedNails = [] }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-muted/10 rounded-xl border border-border/50">
      <h4 className="text-sm font-bold text-center mb-4">
        Mapa Corporal Interativo (Clique nas unhas)
      </h4>
      <div className="flex flex-wrap gap-8 justify-center">
        {/* Placeholder for Hand/Foot SVG. In a real app, this would be a complex SVG path map. */}
        {['mao_esquerda', 'mao_direita', 'pe_esquerdo', 'pe_direito'].map((part) => (
          <div key={part} className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold capitalize">{part.replace('_', ' ')}</span>
            <svg
              width="100"
              height="120"
              viewBox="0 0 100 120"
              className="border rounded-lg bg-white shadow-sm"
            >
              <rect x="20" y="20" width="60" height="80" rx="10" fill="#fde68a" opacity="0.5" />
              {/* Simulated 5 nails per hand/foot */}
              {[1, 2, 3, 4, 5].map((n) => {
                const isMarked = markedNails.find(
                  (m: any) => m.tipo_corpo === part && m.ungueal_numero === n,
                )
                return (
                  <circle
                    key={n}
                    cx={15 + n * 14}
                    cy={15}
                    r="5"
                    className={`cursor-pointer transition-colors hover:fill-primary ${isMarked ? 'fill-red-500 stroke-red-700 stroke-2' : 'fill-white stroke-border'}`}
                    onClick={() => onNailClick(part, n)}
                  />
                )
              })}
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}
