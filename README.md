# CvMentor AI

Application d'assistance RH avec IA pour l'analyse de CV, la simulation d'entretiens et le développement de compétences.

## 🔑 Configuration des clés API

### 1. Clé API Google AI (Gemini)

L'application utilise les modèles Google AI Gemini et nécessite une clé API :

1. **Obtenez votre clé API** sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Créez un fichier `.env`** à la racine du projet
3. **Ajoutez votre clé API** :

```env
# Clé API principale pour les modèles standards
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Clé API pour le mode live (optionnel)
# Si non définie, utilise la clé principale
VITE_GEMINI_LIVE_API_KEY=your_gemini_live_api_key_here
```

### 2. Modèles utilisés

- **`gemini-2.5-flash`** : Analyse de CV, lettres de motivation, questions d'entretien
- **`gemini-live-2.5-flash-preview`** : Entretiens en direct avec interactions vocales bidirectionnelles

### 3. Installation

```bash
npm install
npm run dev
```

### 4. Fonctionnalités

- **Analyse de CV** : Évaluation détaillée avec scores et recommandations
- **Simulation d'entretien** : Mode classique et mode live bidirectionnel
- **Lettres de motivation** : Génération personnalisée selon le ton
- **Développement de compétences** : Plans personnalisés basés sur les écarts

## 🔒 Sécurité

- Les clés API sont stockées dans des variables d'environnement
- Aucune clé n'est hardcodée dans le code source
- Utilisez le fichier `env.example` comme modèle pour votre configuration 