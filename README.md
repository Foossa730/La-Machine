# Jul Access Quiz

Quiz interactif HTML/CSS/JavaScript sur Jul, pensé pour débloquer un code
directement à la fin du quiz.

## Lancer le projet

Ouvrir `index.html` dans un navigateur moderne ou publier le dossier sur un
hébergeur statique gratuit.

## Déploiement Netlify

Le site fonctionne directement sur Netlify comme site statique. Il n'y a plus
de DNS Resend, d'email, de variable d'environnement ou de Function à configurer.

Après chaque modification, pousse le code sur GitHub puis laisse Netlify
redéployer le site.

## Fonctionnalites

- 12 questions QCM integrees
- Score et série en temps réel
- Code affiché directement à la fin si le score est suffisant
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

- 9 bonnes réponses et plus: code affiché
- 7 à 8 bonnes réponses: pas de code, tu bredouilles la team
- Moins de 7 bonnes réponses: code bloqué

## Important

Cette version est simple à publier, mais le code affiché à la fin est visible
dans le JavaScript. Elle convient pour un usage simple ou une démo, pas pour une
distribution très sécurisée de vraies places.
