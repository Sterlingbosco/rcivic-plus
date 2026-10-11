import type { ReactNode } from 'react';
import { getSource } from '../data/content';
import { speak } from '../platform/audio';
import { Icon } from './Icon';

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 tabIndex={-1}>{title}</h1>
        {description && <p className="subtitle">{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function SourceLink({ id }: { id: string }) {
  const source = getSource(id);
  return (
    <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
      <Icon name="link" size={16} />
      {source.title}
      <span className="sr-only"> — {source.organization}, nouvelle fenêtre</span>
    </a>
  );
}
export function AudioButton({ text }: { text: string }) {
  if (!('speechSynthesis' in window)) return null;
  return (
    <button className="button button-quiet" onClick={() => speak(text)}>
      <Icon name="audio" size={18} /> Écouter
    </button>
  );
}
export function LearningArt() {
  return (
    <svg className="learning-art" viewBox="0 0 280 220" fill="none" aria-hidden="true">
      <circle cx="155" cy="111" r="88" fill="#e9eeff" />
      <circle cx="220" cy="43" r="14" fill="#ffd8b9" />
      <path
        d="M45 179C72 198 241 198 257 170"
        stroke="#cbd6fa"
        strokeWidth="2"
        strokeDasharray="4 7"
      />
      <rect
        x="93"
        y="40"
        width="123"
        height="150"
        rx="15"
        fill="#cfdaff"
        transform="rotate(12 93 40)"
      />
      <rect
        x="65"
        y="32"
        width="126"
        height="159"
        rx="15"
        fill="white"
        transform="rotate(-9 65 32)"
      />
      <path
        d="m99 69 9 7 14-21"
        stroke="#2457d6"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m98 104 61-10m-57 29 42-7m-38 28 53-8"
        stroke="#b8c7ef"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="204" cy="149" r="30" fill="#172554" />
      <path
        d="m192 149 8 8 17-18"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M43 92h16m-8-8v16" stroke="#dbaa80" strokeWidth="3" strokeLinecap="round" />
      <circle cx="237" cy="94" r="4" fill="#8da5ee" />
    </svg>
  );
}
