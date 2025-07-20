import { GoogleGenerativeAI } from '@google/generative-ai';
import { CVAnalysis, JobOffer, CVJobMatch, CoverLetter, InterviewQuestion, InterviewFeedback, SkillGap, InterviewResponse } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private audioModel: any;
  private liveModel: any;
  private liveGenAI: GoogleGenerativeAI;
  private liveModelWithVoice: any;
  private nativeAudioModel: any;
  private ttsModel: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const liveApiKey = import.meta.env.VITE_GEMINI_LIVE_API_KEY || apiKey;
    
    if (!apiKey) {
      throw new Error('Clé API Gemini manquante');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.audioModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.liveModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-live-preview' });
    
    // Instance séparée pour le mode live avec la nouvelle clé
    this.liveGenAI = new GoogleGenerativeAI(liveApiKey);
    this.liveModelWithVoice = this.liveGenAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-live-preview',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    
    // Modèle pour traiter l'audio entrant (reconnaissance vocale)
    this.nativeAudioModel = this.liveGenAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-live-preview',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    
    // Modèle TTS pour générer l'audio de réponse
    this.ttsModel = this.liveGenAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-preview-tts',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
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

Fournissez un plan au format JSON avec des ressources variées :
{
  "skillGaps": [
    {
      "skill": "string",
      "importance": "high|medium|low",
      "estimatedTime": "string (ex: 3 à 6 mois)",
      "resources": [
        {
          "title": "string",
          "type": "video|course|article|certification|ebook|blog|website|community",
          "url": "string (URL réelle si possible)",
          "difficulty": "beginner|intermediate|advanced",
          "duration": "string",
          "description": "string (description courte de la ressource)"
        }
      ]
    }
  ]
}

IMPORTANT :
- Proposez des ressources variées : vidéos YouTube, cours en ligne (Coursera, Udemy, OpenClassrooms), articles de blog, e-books, sites web spécialisés, communautés LinkedIn, certifications
- Incluez des ressources gratuites et payantes
- Mentionnez des plateformes connues : Coursera, Udemy, LinkedIn Learning, OpenClassrooms, YouTube, blogs spécialisés
- Ajoutez des ressources en français quand possible
- Donnez des URLs réelles quand c'est possible
- Utilisez un vocabulaire simple et accessible
- Donnez des conseils pratiques et réalisables
- Estimez le temps de développement de manière réaliste
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

  async generateInterviewIntro(jobOffer: JobOffer, isLiveMode: boolean = false): Promise<string> {
    const prompt = `
Tu es un(e) DRH expérimenté(e) et professionnel(le) qui mène un entretien d'embauche${isLiveMode ? ' avec le modèle gemini-live-2.5-flash-preview' : ''}. Ton rôle est d'évaluer les compétences, l'expérience et la personnalité du candidat pour un poste spécifique.

CONTEXTE DE L'ENTRETIEN :
- POSTE : ${jobOffer.title}
- ENTREPRISE : ${jobOffer.company}
- DESCRIPTION DU POSTE : ${jobOffer.description}
- COMPÉTENCES REQUISES : ${jobOffer.skills.join(', ')}

INSTRUCTIONS :
- Commence par une brève présentation personnalisée (1-2 phrases)
- Pose des questions ouvertes pour encourager le dialogue
- Suis les réponses du candidat avec des questions de clarification ou d'approfondissement
- Maintiens un ton neutre mais encourageant
- Évite les questions techniques au début
- Maximum 4-5 phrases au total
- Mentionne le poste et l'entreprise dans ton message
${isLiveMode ? '- Optimise pour l\'audio natif : phrases courtes, claires, rythmées' : ''}
${isLiveMode ? '- Utilise la synthèse vocale native du modèle gemini-live-2.5-flash-preview' : ''}

EXEMPLES DE QUESTIONS DE DÉBUT :
- "Pouvez-vous vous présenter en quelques minutes et me parler de votre parcours ?"
- "Qu'est-ce qui vous a motivé à postuler chez [Entreprise] pour ce poste ?"
- "Parlez-moi de votre expérience professionnelle et de ce qui vous intéresse dans ce secteur"
- "Pourquoi ce poste de [Poste] vous semble-t-il correspondre à votre profil ?"

EXEMPLE DE FORMAT :
"Bonjour ! Je suis [Nom], DRH chez [Entreprise]. Je suis ravi(e) de vous rencontrer pour le poste de [Poste spécifique]. Pouvez-vous vous présenter en quelques minutes et me parler de votre parcours professionnel ?"

IMPORTANT : Commence par des questions de présentation/motivation, pas techniques. Sois naturel et encourage le dialogue.
`;

    try {
      const modelToUse = isLiveMode ? this.nativeAudioModel : this.model;
      const result = await modelToUse.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Erreur génération intro entretien Gemini:', error);
      return 'Bonjour ! Je suis votre DRH IA. Prêt(e) pour l\'entretien ?';
    }
  }

  async interviewChatWithGemini(
    chatHistory: Array<{ role: string; content: string }>, 
    jobOffer?: JobOffer,
    questionCount?: number,
    audioBlob?: Blob,
    isLiveMode: boolean = false
  ): Promise<InterviewResponse> {
    // Si on a un blob audio, utiliser le bon modèle selon le mode
    if (audioBlob) {
      return this.processAudioMessage(chatHistory, jobOffer, questionCount, audioBlob, isLiveMode);
    }

    const contextPrompt = `
Tu es un(e) DRH expérimenté(e) et professionnel(le) qui mène un entretien d'embauche. Ton rôle est d'évaluer les compétences, l'expérience et la personnalité du candidat pour un poste spécifique.

CONTEXTE DU POSTE :
- POSTE : ${jobOffer?.title || 'Poste générique'}
- ENTREPRISE : ${jobOffer?.company || 'Entreprise'}
- DESCRIPTION : ${jobOffer?.description || 'Description non disponible'}
- COMPÉTENCES REQUISES : ${jobOffer?.skills?.join(', ') || 'Compétences non spécifiées'}

RÈGLES STRICTES :
- Pose des questions ouvertes pour encourager le dialogue
- Suis les réponses du candidat avec des questions de clarification ou d'approfondissement
- Maintiens un ton neutre mais encourageant
- Réponses COURTES (max 2-3 phrases)
- Questions PERSONNALISÉES selon le poste et les compétences requises
- 6-8 échanges maximum
- Termine par : "L'entretien est terminé."
- Évite les questions génériques, adapte-les au contexte du poste
- Utilise les compétences requises pour personnaliser tes questions

PROGRESSION DE L'ENTRETIEN :
- Échanges 1-2 : Questions de présentation et motivation
- Échanges 3-4 : Questions sur l'expérience et le parcours
- Échanges 5-6 : Questions techniques/compétences spécifiques au poste
- Échanges 7+ : Questions de fin (motivations, attentes, questions du candidat)

NOMBRE D'ÉCHANGES : ${questionCount || 0}

Historique :
${chatHistory.map(msg => `${msg.role === 'user' ? 'Candidat' : 'DRH'}: ${msg.content}`).join('\n')}

${(questionCount || 0) >= 6 ? 
  'TERMINE : "L\'entretien est terminé."' :
  questionCount === 1 || questionCount === 2 ? 
    'Pose une question de présentation ou motivation (ex: parcours, motivations, pourquoi cette entreprise)' :
    questionCount === 3 || questionCount === 4 ? 
      'Pose une question sur l\'expérience et le parcours professionnel' :
      'Pose une question technique ou sur les compétences spécifiques au poste. Utilise les compétences requises pour personnaliser.'
}
`;

    try {
      const result = await this.model.generateContent(contextPrompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const shouldEnd = text.includes("L'entretien est terminé") || (questionCount || 0) >= 8;
      
      // Convertir la réponse textuelle en audio avec le modèle TTS
      let generatedAudioBlob: Blob | null = null;
      try {
        console.log('Génération audio pour la réponse du DRH...');
        generatedAudioBlob = await this.convertTextToSpeech(text);
        if (generatedAudioBlob) {
          console.log('Audio généré avec succès pour la réponse du DRH');
        } else {
          console.warn('Échec de la génération audio, utilisation du texte uniquement');
        }
      } catch (error) {
        console.error('Erreur lors de la génération audio:', error);
      }
      
      return {
        response: text,
        audioBlob: generatedAudioBlob || undefined,
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

  private async processAudioMessage(
    chatHistory: Array<{ role: string; content: string }>,
    jobOffer?: JobOffer,
    questionCount?: number,
    audioBlob?: Blob,
    isLiveMode: boolean = false
  ): Promise<InterviewResponse> {
    try {
      console.log('Début du traitement audio, taille du blob:', audioBlob?.size, 'bytes');
      
      // Convertir le blob audio en base64
      const audioBase64 = await this.blobToBase64(audioBlob!);
      console.log('Audio converti en base64, longueur:', audioBase64.length);
      
      const contextPrompt = `
Tu es un(e) DRH expérimenté(e) et professionnel(le) qui mène un entretien d'embauche. Tu reçois un message vocal du candidat et tu dois y répondre de manière appropriée.

CONTEXTE DU POSTE :
- POSTE : ${jobOffer?.title || 'Poste générique'}
- ENTREPRISE : ${jobOffer?.company || 'Entreprise'}
- DESCRIPTION : ${jobOffer?.description || 'Description non disponible'}
- COMPÉTENCES REQUISES : ${jobOffer?.skills?.join(', ') || 'Compétences non spécifiées'}

RÈGLES STRICTES :
- Écoute attentivement le message vocal du candidat
- Réponds de manière naturelle et conversationnelle
- Pose des questions ouvertes pour encourager le dialogue
- Suis les réponses du candidat avec des questions de clarification
- Maintiens un ton neutre mais encourageant
- Réponses COURTES (max 2-3 phrases)
- Questions PERSONNALISÉES selon le poste et les compétences requises
- 6-8 échanges maximum
- Termine par : "L'entretien est terminé."
- Évite les questions génériques, adapte-les au contexte du poste
- Utilise les compétences requises pour personnaliser tes questions

PROGRESSION DE L'ENTRETIEN :
- Échanges 1-2 : Questions de présentation et motivation
- Échanges 3-4 : Questions sur l'expérience et le parcours
- Échanges 5-6 : Questions techniques/compétences spécifiques au poste
- Échanges 7+ : Questions de fin (motivations, attentes, questions du candidat)

NOMBRE D'ÉCHANGES : ${questionCount || 0}

Historique :
${chatHistory.map(msg => `${msg.role === 'user' ? 'Candidat' : 'DRH'}: ${msg.content}`).join('\n')}

Le candidat vient de vous envoyer un message vocal. Écoutez-le attentivement et répondez de manière appropriée.

${(questionCount || 0) >= 6 ? 
  'TERMINE : "L\'entretien est terminé."' :
  questionCount === 1 || questionCount === 2 ? 
    'Pose une question de présentation ou motivation (ex: parcours, motivations, pourquoi cette entreprise)' :
    questionCount === 3 || questionCount === 4 ? 
      'Pose une question sur l\'expérience et le parcours professionnel' :
      'Pose une question technique ou sur les compétences spécifiques au poste. Utilise les compétences requises pour personnaliser.'
}
`;

      // Utiliser le modèle standard pour traiter l'audio entrant
      console.log('Envoi de l\'audio au modèle Gemini...');
      const result = await this.model.generateContent([
        contextPrompt,
        {
          inlineData: {
            data: audioBase64,
            mimeType: 'audio/webm'
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text().trim();
      console.log('Réponse reçue du modèle Gemini:', text.substring(0, 100) + '...');
      
      const shouldEnd = text.includes("L'entretien est terminé") || (questionCount || 0) >= 8;
      
      // Convertir la réponse textuelle en audio avec le modèle TTS
      let generatedAudioBlob: Blob | null = null;
      try {
        console.log('Génération audio pour la réponse du DRH (mode audio)...');
        generatedAudioBlob = await this.convertTextToSpeech(text);
        if (generatedAudioBlob) {
          console.log('Audio généré avec succès pour la réponse du DRH');
        } else {
          console.warn('Échec de la génération audio, utilisation du texte uniquement');
        }
      } catch (error) {
        console.error('Erreur lors de la génération audio:', error);
      }
      
      return {
        response: text,
        audioBlob: generatedAudioBlob || undefined,
        shouldEnd,
        finalReport: shouldEnd ? await this.generateInterviewReport(chatHistory, jobOffer) : undefined
      };
    } catch (error) {
      console.error('Erreur traitement audio Gemini:', error);
      
      // Donner plus d'informations sur l'erreur
      let errorMessage = 'Je n\'ai pas pu comprendre votre message vocal. Pouvez-vous répéter ou écrire votre réponse ?';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'Erreur de configuration API. Vérifiez votre clé Gemini.';
        } else if (error.message.includes('audio')) {
          errorMessage = 'Format audio non supporté. Essayez d\'enregistrer à nouveau.';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          errorMessage = 'Erreur de connexion. Vérifiez votre internet et réessayez.';
        }
      }
      
      return {
        response: errorMessage,
        shouldEnd: false
      };
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Retirer le préfixe data:audio/wav;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Erreur lors de la conversion audio'));
      reader.readAsDataURL(blob);
    });
  }

  // Convertir le texte en audio avec le modèle TTS et la voix Orus
  async convertTextToSpeech(text: string): Promise<Blob | null> {
    try {
      console.log('Conversion texte vers audio avec gemini-2.5-flash-preview-tts et voix Orus...');
      
      const result = await this.ttsModel.generateContent([
        {
          text: text,
          voice: "Orus"
        }
      ]);
      
      const response = await result.response;
      
      // Le modèle TTS devrait retourner de l'audio
      if (response.audio) {
        console.log('Audio généré avec succès avec la voix Orus');
        return response.audio;
      } else {
        console.warn('Aucun audio retourné par le modèle TTS');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la conversion texte vers audio:', error);
      return null;
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