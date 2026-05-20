import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-4 p-8 text-center animate-fade-in">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Ops! Algo deu errado.</h2>
          <p className="max-w-[500px] text-sm text-muted-foreground">
            {this.state.error?.message ||
              'Ocorreu um erro inesperado ao processar os dados ou renderizar esta página. Nossa equipe já foi notificada.'}
          </p>
          <div className="mt-4 flex gap-4">
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null })
              }}
              variant="outline"
            >
              Tentar Novamente
            </Button>
            <Button onClick={() => window.location.reload()} variant="default">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Recarregar Página
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
