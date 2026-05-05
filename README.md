# Jul Access Quiz

Quiz interactif HTML/CSS/JavaScript sur Jul, pensé pour envoyer une place par
email après validation sécurisée via Netlify Function et Resend.

## Lancer le projet

Pour tester le quiz complet avec la fonction de déblocage, utilise Netlify Dev :

```bash
npm install
npx netlify dev
```

Puis ouvre l'URL locale avec un token :

```text
http://localhost:8888/?token=TOKEN-PERSONNE-1
```

Sans Netlify Dev, tu peux toujours ouvrir `index.html`, mais le déblocage
sécurisé ne fonctionnera pas car l'API `/.netlify/functions/unlock` ne sera pas
disponible.

## Fonctionnalites

- 12 questions QCM integrees
- Score et série en temps réel
- Déblocage serveur avec token personnel
- Envoi email via Resend après réussite
- Token marqué comme utilisé après envoi
- Rejouer le quiz
- Interface responsive desktop et mobile
- Sons personnalisables dans le dossier `audio/`
- Effets sonores générés avec la Web Audio API si aucun fichier audio n'est fourni

## Ajouter des sons

Pour ajouter tes propres sons autorisés, place des fichiers `.mp3` dans le dossier
`audio/` avec ces noms :

- `intro.mp3`
- `correct.mp3`
- `wrong.mp3`
- `unlock.mp3`

## Seuils de recompense

- 9 bonnes réponses et plus: place envoyée par email
- 7 à 8 bonnes réponses: pas de code, tu bredouilles la team
- Moins de 7 bonnes réponses: code bloqué

## Configuration Netlify

Dans Netlify, ajoute une variable d'environnement nommée `ACCESS_TOKENS_JSON`
avec le scope `Functions`.

Exemple de valeur :

```json
{
  "TOKEN-PERSONNE-1": {
    "email": "personne@example.com",
    "code": "SDF-JUL-PLACE-001",
    "expiresAt": "2026-06-30T23:59:59.000Z"
  },
  "TOKEN-PERSONNE-2": {
    "email": "autre-personne@example.com",
    "code": "SDF-JUL-PLACE-002",
    "expiresAt": "2026-06-30T23:59:59.000Z"
  }
}
```

Ajoute aussi ces variables Netlify, scope `Functions` :

```text
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=Jul Access Quiz <ton-adresse@ton-domaine.fr>
RESEND_REPLY_TO=ton-email@example.com
```

Pour Resend :

1. Crée un compte sur Resend.
2. Crée une clé API.
3. Vérifie ton domaine d'envoi si tu veux utiliser une adresse personnalisée.
4. En attendant, tu peux tester avec l'adresse fournie par Resend si ton compte l'autorise.

Envoie ensuite un lien unique par personne :

```text
https://ton-site.netlify.app/?token=TOKEN-PERSONNE-1
```

Les vrais codes ne doivent jamais être placés dans `script.js`. Ils restent
dans `ACCESS_TOKENS_JSON` côté Netlify, et l'utilisateur reçoit le code par
email uniquement après réussite.
