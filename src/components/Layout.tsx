import { useEffect, useState, type ReactNode } from 'react';
import { useApp } from '../app-context';
import { profileInfo } from '../domain/profiles';
import { getStreak } from '../domain/progress';
import { Icon } from './Icon';

const links = [
  { path: 'accueil', label: 'Mon espace', icon: 'home' },
  { path: 'themes', label: 'Apprendre', icon: 'book' },
  { path: 'revision', label: 'Réviser', icon: 'review' },
  { path: 'progression', label: 'Progression', icon: 'chart' },
];
export function Layout({ route, children }: { route: string; children: ReactNode }) {
  const { progress } = useApp();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  const active =
    route.startsWith('theme') ||
    route.startsWith('lecon') ||
    route === 'quiz' ||
    route === 'resultat'
      ? 'themes'
      : route === 'erreurs'
        ? 'revision'
        : route;
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Aller au contenu
      </a>
      <aside className="sidebar">
        <a className="brand" href="#/accueil" aria-label="RCIVIC+ — accueil">
          <span className="brand-mark">
            c<span>+</span>
          </span>
          <span>
            RCIVIC<span className="brand-plus">+</span>
            <small>Comprendre. Progresser.</small>
          </span>
        </a>
        <p className="sidebar-label">VOTRE PRÉPARATION</p>
        <nav className="primary-nav" aria-label="Navigation principale">
          {links.map((link) => (
            <a
              key={link.path}
              href={`#/${link.path}`}
              className={active === link.path ? 'nav-link active' : 'nav-link'}
              aria-current={active === link.path ? 'page' : undefined}
            >
              <Icon name={link.icon} />
              <span>{link.label}</span>
              {active === link.path && <i />}
            </a>
          ))}
        </nav>
        <div className="sidebar-secondary">
          <a
            className="nav-link"
            href="#/examen"
            aria-current={route === 'examen' ? 'page' : undefined}
          >
            <Icon name="target" />
            Examen blanc
          </a>
          <a className="nav-link" href="#/situations">
            <Icon name="balance" />
            Situations
          </a>
        </div>
        <div className="sidebar-bottom">
          <div className="privacy-note">
            <Icon name="shield" />
            <strong>Votre espace, rien qu’à vous.</strong>
            <p>Sans compte. Votre progression reste sur cet appareil.</p>
          </div>
          <a className="nav-link" href="#/parametres">
            <Icon name="settings" />
            Paramètres
          </a>
          <a className="nav-link" href="#/sources">
            <Icon name="link" />
            Sources et à propos
          </a>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <a className="mobile-brand" href="#/accueil">
            RCIVIC<span>+</span>
          </a>
          <span className="topbar-label">
            Mon parcours{' '}
            <span className="divider" aria-hidden="true">
              /
            </span>{' '}
            <strong>Examen civique {profileInfo(progress.preferences.profile).shortName}</strong>
          </span>
          <div className="topbar-stats">
            <span className="connection-status">
              <i className={online ? 'online-dot' : 'offline-dot'} />
              {online ? 'Sur cet appareil' : 'Hors connexion'}
            </span>
            <span className="mini-stat">
              <Icon name="flame" size={18} />
              {getStreak(progress.activityDays)} <span className="desktop-only">jours</span>
            </span>
            <span className="xp-pill">
              <Icon name="spark" size={16} />
              {progress.xp} XP
            </span>
            <a className="settings-shortcut" href="#/parametres" aria-label="Paramètres">
              <Icon name="settings" size={20} />
            </a>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          Un apprentissage à votre rythme.{' '}
          <a href="#/sources">RCIVIC+ est une application indépendante.</a>
        </footer>
      </div>
    </div>
  );
}
