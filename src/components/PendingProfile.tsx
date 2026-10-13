import { profileInfo } from '../domain/profiles';
import type { Profile } from '../domain/schema';
import { Icon } from './Icon';

/** Profil dont la liste officielle n'est pas encore intégrée : on le dit, on ne remplit pas à vide. */
export function PendingProfile({ profile }: { profile: Profile }) {
  const info = profileInfo(profile);
  return (
    <div className="notice">
      <Icon name="clock" />
      <div>
        <strong>Le contenu du profil {info.name} est en préparation.</strong>
        <p>
          Aucun énoncé n’est encore publié pour ce profil : chaque réponse doit d’abord être
          vérifiée sur une source institutionnelle. Vous pouvez choisir un autre profil dans les
          paramètres.
        </p>
        <a className="button button-secondary" href="#/parametres">
          Changer de profil
        </a>
      </div>
    </div>
  );
}
