import React from 'react';
import { logger } from '../utils';

/**
 * Error Boundary Component
 * Captura errores en componentes hijos y muestra una UI de respaldo
 * en lugar de una pantalla en blanco
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // eslint-disable-next-line no-unused-vars
  static getDerivedStateFromError(error) {
    // Actualizar estado para mostrar UI de respaldo
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar error para debugging
    logger.error('🚨 Error capturado por ErrorBoundary:', error);
    logger.error('📍 Información del error:', errorInfo);

    // Guardar información del error en el estado
    this.setState({
      error,
      errorInfo,
    });

    // Opcional: enviar error a servicio de monitoreo
    // Ejemplo: Sentry.captureException(error);
  }

  handleReset = () => {
    // Resetear el estado y recargar la página
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // UI de respaldo cuando hay un error
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '600px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                fontSize: '64px',
                marginBottom: '20px',
              }}
            >
              😵
            </div>

            <h1
              style={{
                color: '#d32f2f',
                marginBottom: '16px',
                fontSize: '24px',
              }}
            >
              ¡Oops! Algo salió mal
            </h1>

            <p
              style={{
                color: '#666',
                marginBottom: '24px',
                lineHeight: '1.6',
              }}
            >
              La aplicación encontró un error inesperado. No te preocupes, puedes intentar recargar
              la página.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  marginTop: '20px',
                  textAlign: 'left',
                  backgroundColor: '#f9f9f9',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#d32f2f',
                    marginBottom: '12px',
                  }}
                >
                  Ver detalles del error (Solo en desarrollo)
                </summary>
                <div
                  style={{
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    color: '#333',
                    overflowX: 'auto',
                  }}
                >
                  <p>
                    <strong>Error:</strong>
                  </p>
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {this.state.error.toString()}
                  </pre>

                  {this.state.errorInfo && (
                    <>
                      <p style={{ marginTop: '16px' }}>
                        <strong>Stack Trace:</strong>
                      </p>
                      <pre
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: '12px',
                        }}
                      >
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={{
                marginTop: '24px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: '#1976d2',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={e => (e.target.style.backgroundColor = '#1565c0')}
              onMouseOut={e => (e.target.style.backgroundColor = '#1976d2')}
            >
              🔄 Recargar Página
            </button>

            <p
              style={{
                marginTop: '20px',
                fontSize: '14px',
                color: '#999',
              }}
            >
              Si el problema persiste, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      );
    }

    // Si no hay error, renderizar los componentes hijos normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;
