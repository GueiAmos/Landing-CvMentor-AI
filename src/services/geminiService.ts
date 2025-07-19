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
Tu es DRH AI, Directeur des Ressources Humaines expérimenté de l'entreprise "${jobOffer.company}". Tu vas faire passer un entretien pour le poste de "${jobOffer.title}".

CONTEXTE DE L'ENTRETIEN :
- Poste : ${jobOffer.title}
- Entreprise : ${jobOffer.company}
- Description : ${jobOffer.description}

INSTRUCTIONS COMPORTEMENTALES :
- Tu es DRH AI, ferme et professionnel
- Parle directement, sans détours inutiles
- Impose le respect et l'autorité d'un dirigeant
- Sois concis mais complet
- Commence par te présenter brièvement et demande au candidat de se présenter

STYLE REQUIS :
- Autorité naturelle d'un DRH expérimenté
- Fermeté professionnelle
- Vocabulaire direct et précis
- Pas de formules de politesse excessives

Réponds directement avec ton message d'introduction.
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
    jobOffer?: JobOffer,
    questionCount?: number
  ): Promise<{ response: string; shouldEnd: boolean; finalReport?: any }> {
    const contextPrompt = `
Tu es DRH AI, Directeur des Ressources Humaines expérimenté. Tu fais passer un entretien d'embauche pour :

${jobOffer ? `
POSTE : ${jobOffer.title}
ENTREPRISE : ${jobOffer.company}
DESCRIPTION : ${jobOffer.description}
` : 'Poste générique'}

COMPORTEMENT REQUIS :
- Tu es DRH AI, ferme et autoritaire comme un vrai directeur
- Parle directement, sans détours
- Impose le respect - si le candidat est irrespectueux, recadre-le fermement
- Tu as l'autorité et le dernier mot
- Évalue constamment le candidat
- Pose des questions précises et pertinentes
- L'entretien dure 6-8 échanges maximum
- TU DÉCIDES quand l'entretien se termine

GESTION DE L'IRRESPECT :
Si le candidat :
- Est irrespectueux ou familier
- Répond de manière désinvolte
- Manque de sérieux
→ Recadre-le immédiatement avec fermeté

FIN D'ENTRETIEN :
Après 6-8 questions, termine par : "L'entretien est terminé. Vous recevrez un rapport détaillé."

NOMBRE D'ÉCHANGES ACTUELS : ${questionCount || 0}

Historique de la conversation :
${chatHistory.map(msg => `${msg.role === 'user' ? 'Candidat' : 'DRH'}: ${msg.content}`).join('\n')}

${(questionCount || 0) >= 6 ? 
  'TERMINE L\'ENTRETIEN MAINTENANT avec "L\'entretien est terminé. Vous recevrez un rapport détaillé."' :
  'Réponds en tant que DRH AI. Pose la question suivante ou recadre si nécessaire.'
}
`;

    try {
      const result = await this.model.generateContent(contextPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const shouldEnd = text.includes("L'entretien est terminé") || (questionCount || 0) >= 8;
      
      return {
        response: text,
        shouldEnd,
        finalReport: shouldEnd ? await this.generateInterviewReport(chatHistory, jobOffer) : undefined
      };
    } catch (error) {
      console.error('Erreur chat entretien Gemini:', error);
      return {
        response: 'Erreur technique. Veuillez réessayer.',
        shouldEnd: false
      };
    }
  }

  async generateInterviewReport(
    chatHistory: Array<{ role: string; content: string }>,
    jobOffer?: JobOffer
  ): Promise<any> {
    const prompt = `
Tu es DRH AI. Analyse cet entretien d'embauche et génère un rapport détaillé.

POSTE VISÉ : ${jobOffer?.title || 'Non spécifié'}
ENTREPRISE : ${jobOffer?.company || 'Non spécifiée'}

HISTORIQUE DE L'ENTRETIEN :
${chatHistory.map(msg => `${msg.role === 'user' ? 'Candidat' : 'DRH AI'}: ${msg.content}`).join('\n')}

Génère un rapport JSON avec cette structure :
{
  "globalScore": number (1-10),
  "strengths": [array de 3-4 points forts observés],
  "weaknesses": [array de 3-4 points faibles observés],
  "improvements": [array de 4-5 suggestions concrètes d'amélioration],
  "trainingResources": [
    {
      "title": "string",
      "type": "video|article|formation",
      "description": "string",
      "priority": "high|medium|low"
    }
  ],
  "recommendation": "string (recommandation finale du DRH)",
  "nextSteps": [array de 2-3 prochaines étapes recommandées]
}

CRITÈRES D'ÉVALUATION :
- Qualité des réponses
- Pertinence par rapport au poste
- Communication et présentation
- Motivation et engagement
- Respect et professionnalisme

Sois direct et constructif dans tes évaluations.
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
      console.error('Erreur génération rapport:', error);
      return {
        globalScore: 5,
        strengths: ["Participation à l'entretien"],
        weaknesses: ["Analyse impossible - erreur technique"],
        improvements: ["Réessayer l'entretien"],
        trainingResources: [],
        recommendation: "Entretien à refaire en raison d'une erreur technique",
        nextSteps: ["Reprendre l'entretien"]
      };
    }
  }
}

export const geminiService = new GeminiService();