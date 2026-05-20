import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Hand, Footprints } from 'lucide-react'

// Map interface
interface Mark {
  id: string
  x: number
  y: number
  body_type: string
  ungueal_number: number
  alteration_type: string
  description: string
}

interface InteractiveBodyMapProps {
  value: Mark[]
  onChange: (marks: Mark[]) => void
}

export function InteractiveBodyMap({ value = [], onChange }: InteractiveBodyMapProps) {
  const [activeTab, setActiveTab] = useState<'hands' | 'feet'>('hands')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentMark, setCurrentMark] = useState<Partial<Mark> | null>(null)

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>, bodyType: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Guess ungueal number based on X (simplistic approach for demo)
    const ungueal_number = Math.max(1, Math.min(5, Math.ceil(x * 5)))

    setCurrentMark({
      id: crypto.randomUUID(),
      x,
      y,
      body_type: bodyType,
      ungueal_number,
      alteration_type: 'Outro',
      description: '',
    })
    setModalOpen(true)
  }

  const saveMark = () => {
    if (currentMark && currentMark.id) {
      onChange([...value, currentMark as Mark])
      setModalOpen(false)
      setCurrentMark(null)
    }
  }

  const removeMark = (id: string) => {
    onChange(value.filter((m) => m.id !== id))
  }

  // Render marks on the SVG
  const renderMarks = (filterBodyType: string) => {
    return value
      .filter((m) => m.body_type.includes(filterBodyType))
      .map((m) => (
        <circle
          key={m.id}
          cx={`${m.x * 100}%`}
          cy={`${m.y * 100}%`}
          r="5"
          fill="red"
          stroke="white"
          strokeWidth="2"
          className="cursor-pointer hover:r-6 transition-all shadow-md"
          onClick={(e) => {
            e.stopPropagation()
            setCurrentMark(m)
            setModalOpen(true)
          }}
        />
      ))
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
              <span className="absolute top-2 text-xs text-muted-foreground">Mão Esquerda</span>
              <svg
                className="w-full h-full cursor-crosshair"
                onClick={(e) => handleSvgClick(e, 'mao_esquerda')}
              >
                {/* SVG simplificado de uma mão para marcação */}
                <path
                  d="M40 180 C 40 180, 20 120, 20 80 C 20 60, 40 60, 40 80 L 45 120 L 50 40 C 50 20, 70 20, 70 40 L 75 110 L 85 30 C 85 10, 105 10, 105 30 L 110 110 L 125 50 C 125 30, 145 30, 145 50 L 140 130 C 140 170, 120 220, 90 220 C 60 220, 40 180, 40 180 Z"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  strokeWidth="2"
                />
                {renderMarks('mao_esquerda')}
              </svg>
            </div>
            <div className="relative w-40 h-60 border-2 border-dashed rounded-lg bg-background flex items-center justify-center">
              <span className="absolute top-2 text-xs text-muted-foreground">Mão Direita</span>
              <svg
                className="w-full h-full cursor-crosshair transform -scale-x-100"
                onClick={(e) => handleSvgClick(e, 'mao_direita')}
              >
                <path
                  d="M40 180 C 40 180, 20 120, 20 80 C 20 60, 40 60, 40 80 L 45 120 L 50 40 C 50 20, 70 20, 70 40 L 75 110 L 85 30 C 85 10, 105 10, 105 30 L 110 110 L 125 50 C 125 30, 145 30, 145 50 L 140 130 C 140 170, 120 220, 90 220 C 60 220, 40 180, 40 180 Z"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  strokeWidth="2"
                />
                {renderMarks('mao_direita')}
              </svg>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-40 h-60 border-2 border-dashed rounded-lg bg-background flex items-center justify-center">
              <span className="absolute top-2 text-xs text-muted-foreground">Pé Esquerdo</span>
              <svg
                className="w-full h-full cursor-crosshair"
                onClick={(e) => handleSvgClick(e, 'pe_esquerdo')}
              >
                <path
                  d="M50 200 C 30 200, 30 150, 40 100 C 50 50, 70 30, 90 30 C 110 30, 130 50, 130 100 C 140 150, 130 200, 110 200 C 90 200, 70 200, 50 200 Z"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  strokeWidth="2"
                />
                {/* Dedos simplificados */}
                <circle cx="105" cy="20" r="12" fill="#fde0c4" stroke="#d4a373" />
                <circle cx="80" cy="15" r="9" fill="#fde0c4" stroke="#d4a373" />
                <circle cx="60" cy="20" r="8" fill="#fde0c4" stroke="#d4a373" />
                <circle cx="45" cy="30" r="7" fill="#fde0c4" stroke="#d4a373" />
                <circle cx="32" cy="45" r="6" fill="#fde0c4" stroke="#d4a373" />
                {renderMarks('pe_esquerdo')}
              </svg>
            </div>
            <div className="relative w-40 h-60 border-2 border-dashed rounded-lg bg-background flex items-center justify-center">
              <span className="absolute top-2 text-xs text-muted-foreground">Pé Direito</span>
              <svg
                className="w-full h-full cursor-crosshair transform -scale-x-100"
                onClick={(e) => handleSvgClick(e, 'pe_direito')}
              >
                <path
                  d="M50 200 C 30 200, 30 150, 40 100 C 50 50, 70 30, 90 30 C 110 30, 130 50, 130 100 C 140 150, 130 200, 110 200 C 90 200, 70 200, 50 200 Z"
                  fill="#fde0c4"
                  stroke="#d4a373"
                  strokeWidth="2"
                />
                <circle cx="105" cy="20" r="12" fill="#fde0c4" stroke="#d4a373" />
                <circle cx="80" cy="15" r="9" fill="#fde0c4" stroke="#d4a373" />
                <circle cx="60" cy="20" r="8" fill="#fde0c4" stroke="#d4a373" />
                <circle cx="45" cy="30" r="7" fill="#fde0c4" stroke="#d4a373" />
                <circle cx="32" cy="45" r="6" fill="#fde0c4" stroke="#d4a373" />
                {renderMarks('pe_direito')}
              </svg>
            </div>
          </>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhe da Marcação</DialogTitle>
          </DialogHeader>
          {currentMark && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tipo de Alteração</Label>
                <Select
                  value={currentMark.alteration_type}
                  onValueChange={(v) => setCurrentMark({ ...currentMark, alteration_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quebrada">Quebrada</SelectItem>
                    <SelectItem value="Trincada">Trincada</SelectItem>
                    <SelectItem value="Onicomicose">Onicomicose (Fungo)</SelectItem>
                    <SelectItem value="Curvatura Excessiva">Curvatura Excessiva</SelectItem>
                    <SelectItem value="Mancha">Mancha</SelectItem>
                    <SelectItem value="Descolamento">Descolamento</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição Adicional</Label>
                <Textarea
                  value={currentMark.description}
                  onChange={(e) => setCurrentMark({ ...currentMark, description: e.target.value })}
                  placeholder="Ex: Lascou na lateral direita..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between w-full sm:justify-between">
            <Button
              variant="destructive"
              type="button"
              onClick={() => {
                if (currentMark?.id) removeMark(currentMark.id)
                setModalOpen(false)
              }}
            >
              Remover
            </Button>
            <Button type="button" onClick={saveMark}>
              Salvar Marcação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
