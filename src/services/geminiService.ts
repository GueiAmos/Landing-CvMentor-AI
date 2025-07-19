import { GoogleGenerativeAI } from '@google/generative-ai';
import { CVAnalysis, JobOffer, CVJobMatch, CoverLetter, InterviewQuestion, InterviewFeedback, SkillGap } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Clé API Gemini manquante');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeCV(cvText: string): Promise<CVAnalysis> {
    const prompt = `
Analysez ce CV en tant qu'expert RH spécialisé dans le marché de l'emploi africain. 

CV à analyser :
${cvText}

Fournissez une analyse complète au format JSON avec cette structure exacte :
{
  "globalScore": number (entre 1 et 10),
  "detailedScores": {
    "clarity": number (entre 1 et 10),
    "impact": number (entre 1 et 10), 
    "structure": number (entre 1 et 10)
  },
  "strengths": [array de 3-5 points forts concrets],
  "improvements": [array de 3-5 suggestions d'amélioration],
  "missingKeywords": [array de 5-8 mots-clés importants manquants],
  "formatRecommendations": [array de 3-4 conseils de mise en forme]
}

Critères d'évaluation :
- Clarté : Lisibilité, organisation des informations, cohérence
- Impact : Pertinence des expériences, quantification des résultats, valeur ajoutée
- Structure : Hiérarchie visuelle, sections logiques, progression chronologique

IMPORTANT : 
- Utilisez un vocabulaire simple et accessible, évitez les termes techniques complexes
- Rédigez dans un langage facilement compréhensible dès la première lecture
- Mettez les mots importants entre **double astérisques** pour les mettre en gras
- Soyez constructif et donnez des conseils pratiques et concrets
- Adaptez vos conseils au contexte professionnel africain
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraire le JSON de la réponse
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Format de réponse invalide');
    } catch (error) {
      console.error('Erreur analyse CV Gemini:', error);
      throw new Error('Erreur lors de l\'analyse du CV');
    }
  }

  async analyzePDFCV(pdfBase64: string): Promise<CVAnalysis> {
    const prompt = `
Analysez ce CV en tant qu'expert RH spécialisé dans le marché de l'emploi africain. 

Le CV est fourni sous forme de document PDF. Analysez son contenu complet.

Fournissez une analyse complète au format JSON avec cette structure exacte :
{
  "globalScore": number (entre 1 et 10),
  "detailedScores": {
    "clarity": number (entre 1 et 10),
    "impact": number (entre 1 et 10), 
    "structure": number (entre 1 et 10)
  },
  "strengths": [array de 3-5 points forts concrets],
  "improvements": [array de 3-5 suggestions d'amélioration],
  "missingKeywords": [array de 5-8 mots-clés importants manquants],
  "formatRecommendations": [array de 3-4 conseils de mise en forme]
}

Critères d'évaluation :
- Clarté : Lisibilité, organisation des informations, cohérence
- Impact : Pertinence des expériences, quantification des résultats, valeur ajoutée
- Structure : Hiérarchie visuelle, sections logiques, progression chronologique

IMPORTANT : 
- Utilisez un vocabulaire simple et accessible, évitez les termes techniques complexes
- Rédigez dans un langage facilement compréhensible dès la première lecture
- Mettez les mots importants entre **double astérisques** pour les mettre en gras
- Soyez constructif et donnez des conseils pratiques et concrets
- Adaptez vos conseils au contexte professionnel africain
`;

    try {
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: pdfBase64,
            mimeType: 'application/pdf'
          }
        }
      ]);
      const response = await result.response;
      const text = response.text();
      
      // Extraire le JSON de la réponse
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Format de réponse invalide');
    } catch (error) {
      console.error('Erreur analyse CV Gemini:', error);
      throw new Error('Erreur lors de l\'analyse du CV');
    }
  }

  async matchCVWithJob(cvText: string, jobOffer: JobOffer): Promise<CVJobMatch> {
    const prompt = `
Tu es un DRH expérimenté dans le secteur concerné par l’offre d’emploi ci-dessous.
Analyse le CV et l’offre d’emploi suivants :

CV du candidat :
${cvText}

Offre d'emploi :
Titre : ${jobOffer.title}
Entreprise : ${jobOffer.company}
Description : ${jobOffer.description}
Compétences requises : ${jobOffer.skills.join(', ')}

1. Extraction structurée de l'offre :
- Intitulé du poste
- Exigences (expérience, niveau d’étude, certifications, etc.)
- Compétences attendues
- Missions principales

2. Matching raisonné façon DRH :
- Liste des compétences du CV qui correspondent à l’offre (points forts, expliquer pourquoi)
- Liste des compétences manquantes ou à renforcer (expliquer leur importance pour le poste)
- Score global de compatibilité RH (sur 100)

3. Conseils personnalisés :
- Conseils pour adapter ou enrichir le CV pour ce poste
- Suggestions de formations/certifications reconnues pour combler les écarts
- Conseils d’adaptation (mots-clés à ajouter, expériences à valoriser, etc.)

Réponds uniquement avec un JSON structuré de la forme :
{
  "compatibilityRate": number (pourcentage entre 0 et 100),
  "alignedSkills": [array des compétences du candidat qui correspondent],
  "gaps": [array des compétences manquantes spécifiquement pour ce poste],
  "adaptationTips": [array de conseils pour améliorer la candidature],
  "cvSkills": [array des compétences extraites du CV],
  "offerSkills": [array des compétences extraites de l'offre],
  "rhAdvice": "conseils RH personnalisés pour adapter le CV à l'offre (texte)",
  "trainingSuggestions": [array ou texte de suggestions de formations/certifications],
  "cvTips": "conseils pour enrichir ou reformuler le CV (texte)"
}

Sois critique, constructif, et adopte le point de vue d’un recruteur métier. Utilise un langage simple et accessible.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Format de réponse invalide');
    } catch (error) {
      console.error('Erreur matching Gemini:', error);
      throw new Error('Erreur lors de l\'analyse de compatibilité');
    }
  }

  async generateCoverLetter(
    cvText: string, 
    jobOffer: JobOffer, 
    tone: 'formal' | 'dynamic' | 'creative'
  ): Promise<CoverLetter> {
    const toneInstructions = {
      formal: 'Adoptez un style formel et professionnel, avec des formules de politesse classiques.',
      dynamic: 'Utilisez un ton moderne et énergique, montrant la motivation et l\'enthousiasme.',
      creative: 'Soyez original et personnalisé, avec une approche créative adaptée au secteur.'
    };

    const prompt = `
Rédigez une lettre de motivation professionnelle en français basée sur ces éléments :

CV du candidat :
${cvText}

Offre d'emploi :
Titre : ${jobOffer.title}
Entreprise : ${jobOffer.company}
Description : ${jobOffer.description}

Instructions de style : ${toneInstructions[tone]}

Exigences :
- Lettre complète de 250-350 mots
- Structure : en-tête, introduction, développement (2 paragraphes), conclusion
- Personnalisée selon le profil et l'offre
- Vocabulaire simple et accessible
- Mettez en valeur les compétences alignées avec le poste
- Montrez la motivation et la valeur ajoutée du candidat
- Utilisez **double astérisques** pour mettre en gras les éléments importants

Répondez uniquement avec le contenu de la lettre, sans commentaires additionnels.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text().trim();
      
      return {
        content,
        tone
      };
    } catch (error) {
      console.error('Erreur génération lettre Gemini:', error);
      throw new Error('Erreur lors de la génération de la lettre');
    }
  }

  async generateInterviewQuestions(jobOffer: JobOffer, difficulty: string): Promise<InterviewQuestion[]> {
    const prompt = `
Tu es un DRH expérimenté du secteur concerné par l'offre ci-dessous. Génère 8 questions d'entretien réalistes et variées pour ce poste, adaptées au marché de l'emploi africain et au niveau d'expérience demandé.

Offre d'emploi :
Titre : ${jobOffer.title}
Entreprise : ${jobOffer.company}
Description : ${jobOffer.description}
Niveau de difficulté : ${difficulty}

Pour chaque question, précise le type (general, behavioral, technical) et adapte le contenu au contexte du poste (missions, compétences, exigences, secteur).

Fournis un JSON avec cette structure :
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "type": "general|behavioral|technical",
      "timeLimit": number (en secondes)
    }
  ]
}

Répartition souhaitée :
- 3 questions générales (présentation, motivation, projet professionnel, adaptées au poste)
- 3 questions comportementales (situations, défis, travail en équipe, adaptées au secteur)
- 2 questions techniques (compétences, méthodes de travail, adaptées à l'offre)

IMPORTANT :
- Utilise un vocabulaire simple et accessible
- Formule des questions claires, réalistes et contextualisées
- Adapte chaque question au secteur et au poste
- Ne pose pas de questions hors sujet
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.questions;
      }
      
      throw new Error('Format de réponse invalide');
    } catch (error) {
      console.error('Erreur génération questions Gemini:', error);
      throw new Error('Erreur lors de la génération des questions');
    }
  }

  async evaluateInterviewAnswer(
    question: InterviewQuestion, 
    answer: string
  ): Promise<InterviewFeedback> {
    const prompt = `
Évaluez cette réponse d'entretien en tant qu'expert RH :

Question : ${question.question}
Type : ${question.type}
Réponse du candidat : ${answer}

Fournissez une évaluation au format JSON :
{
  "questionId": "${question.id}",
  "score": number (entre 1 et 5),
  "feedback": "string (commentaire constructif)",
  "improvements": [array de 2-3 suggestions d'amélioration]
}

Critères d'évaluation :
- Pertinence et précision de la réponse
- Structure et clarté de l'argumentation
- Exemples concrets et quantifiés
- Adéquation avec le poste visé

IMPORTANT :
- Utilisez un vocabulaire simple et accessible
- Mettez les points importants entre **double astérisques**
- Soyez constructif et encourageant
- Donnez des conseils pratiques et facilement applicables
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Format de réponse invalide');
    } catch (error) {
      console.error('Erreur évaluation réponse Gemini:', error);
      throw new Error('Erreur lors de l\'évaluation de la réponse');
    }
  }

  async generateSkillDevelopmentPlan(gaps: string[]): Promise<SkillGap[]> {
    const prompt = `
Créez un plan de développement des compétences pour ces lacunes identifiées :
${gaps.join(', ')}

Fournissez un plan au format JSON :
{
  "skillGaps": [
    {
      "skill": "string",
      "importance": "high|medium|low",
      "estimatedTime": "string",
      "resources": [
        {
          "title": "string",
          "type": "video|course|article|certification",
          "url": "string",
          "difficulty": "beginner|intermediate|advanced",
          "duration": "string"
        }
      ]
    }
  ]
}

IMPORTANT :
- Utilisez un vocabulaire simple et accessible
- Mettez les éléments importants entre **double astérisques**
- Proposez des ressources gratuites ou peu coûteuses
- Donnez des conseils pratiques et réalisables
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.skillGaps;
      }
      
      throw new Error('Format de réponse invalide');
    } catch (error) {
      console.error('Erreur plan compétences Gemini:', error);
      throw new Error('Erreur lors de la génération du plan de compétences');
    }
  }

  async generateInterviewIntro(jobOffer: JobOffer): Promise<string> {
    const prompt = `
Tu es un DRH expérimenté de l'entreprise "${jobOffer.company}" qui va faire passer un entretien pour le poste de "${jobOffer.title}".

Offre d'emploi :
Titre : ${jobOffer.title}
Entreprise : ${jobOffer.company}
Description : ${jobOffer.description}

Commence l'entretien par un message d'accueil chaleureux et professionnel. Présente-toi brièvement, explique le déroulement de l'entretien et pose la première question classique pour que le candidat se présente.

Ton style doit être :
- Professionnel mais bienveillant
- Adapté au poste et à l'entreprise
- Encourageant pour mettre le candidat à l'aise
- Utilise un vocabulaire simple et accessible

Réponds directement avec ton message d'introduction, sans commentaires additionnels.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Erreur génération intro entretien Gemini:', error);
      throw new Error('Erreur lors de la génération de l\'introduction');
    }
  }

  async interviewChatWithGemini(
    chatHistory: Array<{ role: string; content: string }>, 
    jobOffer?: JobOffer
  ): Promise<string> {
    const contextPrompt = `
Tu es un DRH expérimenté qui fait passer un entretien d'embauche pour le poste suivant :

${jobOffer ? `
Titre : ${jobOffer.title}
Entreprise : ${jobOffer.company}
Description : ${jobOffer.description}
` : 'Poste générique'}

INSTRUCTIONS IMPORTANTES :
- Tu es en entretien avec un candidat, reste dans ce rôle
- Pose des questions pertinentes liées au poste et à l'entreprise
- Évalue les réponses du candidat de manière constructive
- Adapte tes questions selon les réponses précédentes
- Sois professionnel mais bienveillant
- Utilise un vocabulaire simple et accessible
- Pose une seule question à la fois
- Varie les types de questions : expérience, motivation, situations, compétences techniques

Historique de la conversation :
${chatHistory.map(msg => `${msg.role === 'user' ? 'Candidat' : 'DRH'}: ${msg.content}`).join('\n')}

Réponds en tant que DRH. Pose la question suivante ou donne un feedback constructif selon le contexte.
`;

    try {
      const result = await this.model.generateContent(contextPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Erreur chat entretien Gemini:', error);
      throw new Error('Erreur lors de la génération de la réponse');
    }
  }
}

export const geminiService = new GeminiService();