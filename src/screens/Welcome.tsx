import { useState } from 'react';
import { navigate, useApp } from '../app-context';
import { Icon } from '../components/Icon';
import { PROFILES } from '../domain/profiles';
import type { Profile } from '../domain/schema';
import { LearningArt } from '../components/Primitives';

export function Welcome() {
  const { progress, commit, saving } = useApp();
  const [goal, setGoal] = useState<5 | 10 | 20 | 30>(10);
  const [profile, setProfile] = useState<Profile>('CSP');
  async function begin() {
    await commit({
      ...progress,
      preferences: { ...progress.preferences, dailyGoal: goal, onboarded: true, profile },
    });
    navigate('accueil');
  }
  return (
    <section className="welcome-card">
      <span className="tag tag-blue">BIENVENUE DANS RCIVIC+</span>
      <LearningArt />
      <h1 tabIndex={-1}>
        Votre avenir se prépare.
        <br />
        <span>Une notion à la fois.</span>
      </h1>
      <p className="subtitle">
        Un coach pour comprendre, pratiquer et mémoriser les repères de l’examen civique. Pas besoin
        de compte, juste l’envie d’avancer.
      </p>
      <div className="welcome-points">
        <span>
          <Icon name="book" size={18} />
          Des explications simples
        </span>
        <span>
          <Icon name="review" size={18} />
          Des révisions utiles
        </span>
        <span>
          <Icon name="shield" size={18} />
          Votre progression privée
        </span>
      </div>
      <fieldset className="profile-options">
        <legend>Pour quel examen vous préparez-vous ?</legend>
        {PROFILES.map((option) => (
          <label
            className={
              profile === option.id
                ? 'setting-option profile-option selected'
                : 'setting-option profile-option'
            }
            key={option.id}
          >
            <input
              type="radio"
              name="welcomeProfile"
              checked={profile === option.id}
              onChange={() => setProfile(option.id)}
            />
            <span>
              <strong>{option.name}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <fieldset className="setting-options">
        <legend>Combien de temps souhaitez-vous vous réserver ?</legend>
        {([5, 10, 20, 30] as const).map((value) => (
          <label
            className={goal === value ? 'setting-option selected' : 'setting-option'}
            key={value}
          >
            <input
              type="radio"
              name="welcomeGoal"
              checked={goal === value}
              onChange={() => setGoal(value)}
            />
            {value} min
          </label>
        ))}
      </fieldset>
      <button className="button button-primary" disabled={saving} onClick={() => void begin()}>
        Commencer
        <Icon name="arrow" size={18} />
      </button>
      <p className="content-disclaimer">
        Application indépendante · premier lot introductif · aucun résultat ne garantit la réussite
        à l’examen.
      </p>
    </section>
  );
}
