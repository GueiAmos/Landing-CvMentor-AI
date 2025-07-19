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

Adaptez vos conseils au contexte professionnel africain et aux standards internationaux.
Soyez constructif et spécifique dans vos recommandations.
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

Adaptez vos conseils au contexte professionnel africain et aux standards internationaux.
Soyez constructif et spécifique dans vos recommandations.
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
Comparez ce CV avec cette offre d'emploi et évaluez la compatibilité.

CV du candidat :
${cvText}

Offre d'emploi :
Titre : ${jobOffer.title}
Entreprise : ${jobOffer.company}
Description : ${jobOffer.description}
Compétences requises : ${jobOffer.skills.join(', ')}

Fournissez une analyse au format JSON avec cette structure exacte :
{
  "compatibilityRate": number (pourcentage entre 0 et 100),
  "alignedSkills": [array des compétences du candidat qui correspondent],
  "gaps": [array des compétences/expériences manquantes importantes],
  "adaptationTips": [array de 4-5 conseils pour améliorer la candidature]
}

Analysez :
1. La correspondance entre les compétences du CV et celles requises
2. L'adéquation de l'expérience avec le poste
3. Les lacunes critiques à combler
4. Les points forts à mettre en avant

Adaptez votre analyse au marché de l'emploi africain et donnez des conseils pratiques.
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
- Adaptée au contexte professionnel africain
- Mettez en valeur les compétences alignées avec le poste
- Montrez la motivation et la valeur ajoutée du candidat

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
Générez 8 questions d'entretien pour ce poste, adaptées au marché de l'emploi africain :

Poste : ${jobOffer.title}
Entreprise : ${jobOffer.company}
Description : ${jobOffer.description}
Niveau de difficulté : ${difficulty}

Fournissez un JSON avec cette structure :
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
- 3 questions générales (présentation, motivation, projet professionnel)
- 3 questions comportementales (situations, défis, travail en équipe)
- 2 questions techniques (compétences, méthodes de travail)

Adaptez les questions au contexte africain et au secteur d'activité.
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

Soyez constructif et encourageant dans vos commentaires.
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
- Proposez 2-3 ressources gratuites ou accessibles
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
}

export const geminiService = new GeminiService();