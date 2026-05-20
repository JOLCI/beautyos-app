import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Hand, Footprints } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BodyMapProps {
  markedNails: any[]
  onNailClick: (part: string, n: number) => void
}

export function BodyMap({ markedNails = [], onNailClick }: BodyMapProps) {
  const [activeTab, setActiveTab] = useState<'hands' | 'feet'>('hands')

  // Render clickable invisible nails overlaid on the SVG for precision
  const renderNailTargets = (part: string) => {
    // These coordinates are approximations of the finger/toe tips on the simplified SVGs
    // Hand layout (1 to 5 mapping thumb to pinky approx)
    const layouts: any = {
      mao_esquerda: [
        { cx: '25%', cy: '35%', n: 1 },
        { cx: '45%', cy: '15%', n: 2 },
        { cx: '65%', cy: '15%', n: 3 },
        { cx: '85%', cy: '25%', n: 4 },
        { cx: '90%', cy: '45%', n: 5 },
      ],
      mao_direita: [
        { cx: '75%', cy: '35%', n: 1 },
        { cx: '55%', cy: '15%', n: 2 },
        { cx: '35%', cy: '15%', n: 3 },
        { cx: '15%', cy: '25%', n: 4 },
        { cx: '10%', cy: '45%', n: 5 },
      ],
      pe_esquerdo: [
        { cx: '75%', cy: '10%', n: 1 },
        { cx: '57%', cy: '7%', n: 2 },
        { cx: '43%', cy: '10%', n: 3 },
        { cx: '32%', cy: '15%', n: 4 },
        { cx: '23%', cy: '22%', n: 5 },
      ],
      pe_direito: [
        { cx: '25%', cy: '10%', n: 1 },
        { cx: '43%', cy: '7%', n: 2 },
        { cx: '57%', cy: '10%', n: 3 },
        { cx: '68%', cy: '15%', n: 4 },
        { cx: '77%', cy: '22%', n: 5 },
      ],
    }

    const targets = layouts[part] || []

    return targets.map((t: any) => {
      const isMarked = markedNails.some((m) => m.tipo_corpo === part && m.ungueal_numero === t.n)
      return (
        <circle
          key={t.n}
          cx={t.cx}
          cy={t.cy}
          r="12"
          fill={isMarked ? '#ea580c' : 'transparent'} // Orange highlight if marked
          stroke={isMarked ? 'white' : 'transparent'}
          strokeWidth="2"
          className={cn(
            'cursor-pointer transition-all hover:stroke-orange-300',
            !isMarked && 'hover:fill-orange-100/50',
          )}
          onClick={(e) => {
            e.stopPropagation()
            onNailClick(part, t.n)
          }}
        />
      )
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center mb-4">
        <Button
          variant={activeTab === 'hands' ? 'default' : 'outline'}
          onClick={() => setActiveTab('hands')}
          type="button"
        >
          <Hand className="w-4 h-4 mr-2" /> Mãos
        </Button>
        <Button
          variant={activeTab === 'feet' ? 'default' : 'outline'}
          onClick={() => setActiveTab('feet')}
          type="button"
        >
          <Footprints className="w-4 h-4 mr-2" /> Pés
        </Button>
      </div>

      <div className="flex justify-center gap-8 bg-muted/20 p-6 rounded-xl border relative overflow-hidden">
        {activeTab === 'hands' ? (
          <>
            <div className="relative w-40 h-60 border-2 border-dashed rounded-lg bg-background flex items-center justify-center">
              <span className="absolute top-2 text-xs text-muted-foreground pointer-events-none">
                Mão Esquerda
              </span>
              <svg className="w-full h-full">
                <path
                  d="M40 180 C 40 180, 20 120, 20 80 C 20 60, 40 60, 40 80 L 45 120 L 50 40 C 50 20, 70 20, 70 40 L 75 110 L 85 30 C 85 10, 105 10, 105 30 L 110 110 L 125 50 C 125 30, 145 30, 145 50 L 140 130 C 140 170, 120 220, 90 220 C 60 220, 40 180, 40 180 Z"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
                {renderNailTargets('mao_esquerda')}
              </svg>
            </div>
            <div className="relative w-40 h-60 border-2 border-dashed rounded-lg bg-background flex items-center justify-center">
              <span className="absolute top-2 text-xs text-muted-foreground pointer-events-none">
                Mão Direita
              </span>
              <svg className="w-full h-full transform -scale-x-100">
                <path
                  d="M40 180 C 40 180, 20 120, 20 80 C 20 60, 40 60, 40 80 L 45 120 L 50 40 C 50 20, 70 20, 70 40 L 75 110 L 85 30 C 85 10, 105 10, 105 30 L 110 110 L 125 50 C 125 30, 145 30, 145 50 L 140 130 C 140 170, 120 220, 90 220 C 60 220, 40 180, 40 180 Z"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
                {renderNailTargets('mao_direita')}
              </svg>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-40 h-60 border-2 border-dashed rounded-lg bg-background flex items-center justify-center">
              <span className="absolute top-2 text-xs text-muted-foreground pointer-events-none">
                Pé Esquerdo
              </span>
              <svg className="w-full h-full">
                <path
                  d="M50 200 C 30 200, 30 150, 40 100 C 50 50, 70 30, 90 30 C 110 30, 130 50, 130 100 C 140 150, 130 200, 110 200 C 90 200, 70 200, 50 200 Z"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
                {/* Dedos simplificados */}
                <circle
                  cx="105"
                  cy="20"
                  r="12"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                <circle
                  cx="80"
                  cy="15"
                  r="9"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                <circle
                  cx="60"
                  cy="20"
                  r="8"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                <circle
                  cx="45"
                  cy="30"
                  r="7"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                <circle
                  cx="32"
                  cy="45"
                  r="6"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                {renderNailTargets('pe_esquerdo')}
              </svg>
            </div>
            <div className="relative w-40 h-60 border-2 border-dashed rounded-lg bg-background flex items-center justify-center">
              <span className="absolute top-2 text-xs text-muted-foreground pointer-events-none">
                Pé Direito
              </span>
              <svg className="w-full h-full transform -scale-x-100">
                <path
                  d="M50 200 C 30 200, 30 150, 40 100 C 50 50, 70 30, 90 30 C 110 30, 130 50, 130 100 C 140 150, 130 200, 110 200 C 90 200, 70 200, 50 200 Z"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
                <circle
                  cx="105"
                  cy="20"
                  r="12"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                <circle
                  cx="80"
                  cy="15"
                  r="9"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                <circle
                  cx="60"
                  cy="20"
                  r="8"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                <circle
                  cx="45"
                  cy="30"
                  r="7"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                <circle
                  cx="32"
                  cy="45"
                  r="6"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  className="pointer-events-none"
                />
                {renderNailTargets('pe_direito')}
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
