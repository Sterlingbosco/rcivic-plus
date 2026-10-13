import { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { registerPwa } from './platform/pwa';
import './styles/tokens.css';
import './styles/components.css';
import './styles/screens.css';
import './styles/dark.css';
import { applyTheme, getThemePreference } from './platform/theme';

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="startup">
          <h1>Une interruption est survenue.</h1>
          <p>Votre sauvegarde n’a pas été effacée. Rechargez pour reprendre votre parcours.</p>
          <button className="button button-primary" onClick={() => window.location.reload()}>
            Recharger RCIVIC+
          </button>
        </main>
      );
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('Racine de l’application absente.');
applyTheme(getThemePreference());
createRoot(root).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
registerPwa();
