# Configuration des Sections Masquées

Ce document explique comment masquer certaines sections de la navigation en utilisant une variable d'environnement.

## Variable d'environnement

### VITE_HIDE_SECTIONS

Cette variable permet de masquer des sections spécifiques de la navigation en spécifiant leurs clés séparées par des virgules.

**Format :** `VITE_HIDE_SECTIONS=section1,section2,section3`

## Sections disponibles

Voici les clés des sections qui peuvent être masquées :

- `scheduler` - Scheduler
- `emails` - Emails  
- `live-chat` - Live Chat
- `quality-assurance` - Quality Assurance
- `operations` - Operations
- `analytics` - Analytics
- `integrations` - Integrations

## Configuration par défaut

Par défaut, les sections suivantes sont masquées :
```
VITE_HIDE_SECTIONS=scheduler,emails,live-chat,quality-assurance,operations,analytics,integrations
```

## Comment configurer

### Option 1 : Variable d'environnement

Créez un fichier `.env` à la racine du projet et ajoutez :

```env
VITE_HIDE_SECTIONS=scheduler,emails,live-chat,quality-assurance,operations,analytics,integrations
```

### Option 2 : Configuration par défaut

Si aucune variable d'environnement n'est définie, le système utilisera la configuration par défaut définie dans `src/config/sections.ts`.

## Exemples

### Masquer seulement Scheduler et Emails
```env
VITE_HIDE_SECTIONS=scheduler,emails
```

### Masquer toutes les sections sauf Settings
```env
VITE_HIDE_SECTIONS=scheduler,emails,live-chat,quality-assurance,operations,analytics,integrations
```

### Afficher toutes les sections
```env
VITE_HIDE_SECTIONS=
```

## Redémarrage requis

Après avoir modifié la variable d'environnement, vous devez redémarrer le serveur de développement :

```bash
npm run dev
```

## Notes

- Les sections masquées ne seront pas visibles dans la navigation latérale
- Les routes correspondantes restent accessibles directement via l'URL
- Cette configuration n'affecte que l'affichage de la navigation, pas la fonctionnalité des composants
