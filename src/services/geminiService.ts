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
  private interviewGenAI: GoogleGenerativeAI;
  private interviewModel: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const liveApiKey = import.meta.env.VITE_GEMINI_LIVE_API_KEY || apiKey;
    
    if (!apiKey) {
      throw new Error('Clé API Gemini manquante');
    }
    
    // Instance principale pour analyse CV, matching, développement compétences
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.audioModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.liveModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Instance séparée pour simulation d'entretien et lettres de motivation
    this.interviewGenAI = new GoogleGenerativeAI(liveApiKey);
    this.interviewModel = this.interviewGenAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Instance pour le mode live avec la clé spécialisée
    this.liveGenAI = new GoogleGenerativeAI(liveApiKey);
    this.liveModelWithVoice = this.liveGenAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    
    // Modèle pour traiter l'audio entrant (reconnaissance vocale)
    this.nativeAudioModel = this.liveGenAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
  }

  async analyzeCV(cvText: string): Promise<CVAnalysis> {
    const prompt = `
Vous êtes un expert RH international, spécialiste de l'analyse de CV de tous formats (chronologique, thématique, tabulaire, créatif, atypique, désordonné, etc.).

Votre mission :
1. Extraire de façon structurée toutes les informations clés du CV, même si elles sont dispersées, mal nommées ou dans un ordre inhabituel. Identifiez :
   - Identité (nom, prénom)
   - Coordonnées (email, téléphone, LinkedIn...)
   - Titre ou objectif professionnel
   - Expériences professionnelles (poste, entreprise, dates, missions, réalisations)
   - Formations (diplômes, établissements, dates)
   - Compétences (techniques, comportementales, linguistiques)
   - Certifications, langues, centres d'intérêt, projets, publications, etc.
2. Détectez les faiblesses du CV, même si elles sont subtiles ou masquées par la forme (sections manquantes, informations floues, doublons, incohérences, informations inutiles ou obsolètes, manque de chiffres, etc.).
3. Analysez la complétude et la cohérence du CV : quelles sections sont absentes ou sous-développées ? Y a-t-il des contradictions ou des éléments peu clairs ?
4. Identifiez le format du CV (classique, créatif, étudiant, senior, etc.) et adaptez vos conseils d’optimisation à ce format.
5. Proposez des optimisations concrètes et personnalisées pour améliorer l’impact, la lisibilité, la structure et la pertinence du CV, même s’il est très atypique.
6. Si le CV est désorganisé ou non conventionnel, proposez une réorganisation logique et des titres de sections adaptés.

RÈGLES D'ANALYSE :
- Vous pouvez reconnaître des compétences, expériences ou formations équivalentes même si la formulation diffère (synonymes, formulations proches, expériences transférables).
- Ne mentionnez jamais de compétence totalement absente du CV.
- Soyez honnête et factuel : si une compétence n'est pas présente ni équivalente, n'en parlez pas comme acquise.

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
  "formatRecommendations": [array de 3-4 conseils de mise en forme],
  "extractedSections": {
    "identity": string,
    "contacts": string,
    "titleOrObjective": string,
    "experiences": string,
    "education": string,
    "skills": string,
    "languages": string,
    "certifications": string,
    "interests": string,
    "other": string
  },
  "detectedFormat": "string (ex: chronologique, créatif, étudiant, senior, désordonné, etc.)"
}

Critères d'évaluation :
- Clarté : Lisibilité, organisation des informations, cohérence
- Impact : Pertinence des expériences, quantification des résultats, valeur ajoutée
- Structure : Hiérarchie visuelle, sections logiques, progression chronologique

IMPORTANT :
- Soyez rigoureux dans l'extraction, même si le CV est mal structuré ou atypique
- Utilisez un vocabulaire simple et accessible, évitez les termes techniques complexes
- Rédigez dans un langage facilement compréhensible dès la première lecture
- Mettez les mots importants entre **double astérisques** pour les mettre en gras
- Soyez constructif et donnez des conseils pratiques et concrets
- Adaptez vos conseils au contexte professionnel africain et au format détecté
- Si une information est absente, indiquez-le explicitement dans la section correspondante
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
Vous êtes un expert RH international, spécialiste de l'analyse de CV PDF de tous formats (chronologique, thématique, tabulaire, créatif, scanné, atypique, désordonné, etc.).

Votre mission :
1. Extraire de façon structurée toutes les informations clés du CV, même si elles sont dispersées, mal nommées, dans un ordre inhabituel ou peu lisibles (PDF scanné, photo, etc.). Identifiez :
   - Identité (nom, prénom)
   - Coordonnées (email, téléphone, LinkedIn...)
   - Titre ou objectif professionnel
   - Expériences professionnelles (poste, entreprise, dates, missions, réalisations)
   - Formations (diplômes, établissements, dates)
   - Compétences (techniques, comportementales, linguistiques)
   - Certifications, langues, centres d'intérêt, projets, publications, etc.
2. Détectez les faiblesses du CV, même si elles sont subtiles ou masquées par la forme (sections manquantes, informations floues, doublons, incohérences, informations inutiles ou obsolètes, manque de chiffres, etc.).
3. Analysez la complétude et la cohérence du CV : quelles sections sont absentes ou sous-développées ? Y a-t-il des contradictions ou des éléments peu clairs ?
4. Identifiez le format du CV (classique, créatif, étudiant, senior, scanné, etc.) et adaptez vos conseils d’optimisation à ce format.
5. Proposez des optimisations concrètes et personnalisées pour améliorer l’impact, la lisibilité, la structure et la pertinence du CV, même s’il est très atypique ou mal scanné.
6. Si le CV est désorganisé ou non conventionnel, proposez une réorganisation logique et des titres de sections adaptés.

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
  "formatRecommendations": [array de 3-4 conseils de mise en forme],
  "extractedSections": {
    "identity": string,
    "contacts": string,
    "titleOrObjective": string,
    "experiences": string,
    "education": string,
    "skills": string,
    "languages": string,
    "certifications": string,
    "interests": string,
    "other": string
  },
  "detectedFormat": "string (ex: chronologique, créatif, étudiant, senior, scanné, désordonné, etc.)"
}

Critères d'évaluation :
- Clarté : Lisibilité, organisation des informations, cohérence
- Impact : Pertinence des expériences, quantification des résultats, valeur ajoutée
- Structure : Hiérarchie visuelle, sections logiques, progression chronologique

IMPORTANT :
- Soyez rigoureux dans l'extraction, même si le CV est mal structuré, scanné ou atypique
- Utilisez un vocabulaire simple et accessible, évitez les termes techniques complexes
- Rédigez dans un langage facilement compréhensible dès la première lecture
- Mettez les mots importants entre **double astérisques** pour les mettre en gras
- Soyez constructif et donnez des conseils pratiques et concrets
- Adaptez vos conseils au contexte professionnel africain et au format détecté
- Si une information est absente, indiquez-le explicitement dans la section correspondante
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
Tu es un DRH expérimenté du secteur concerné par l'offre ci-dessous, avec une excellente connaissance du marché africain.

Analyse le CV et l'offre d'emploi suivants (sois flexible sur la formulation, mais factuel) :

CV du candidat :
${cvText}

Offre d'emploi :
Titre : ${jobOffer.title}
Entreprise : ${jobOffer.company}
Description : ${jobOffer.description}
Compétences requises : ${jobOffer.skills.join(', ')}

RÈGLES :
- Identifie les correspondances même si la formulation diffère (synonymes, expériences équivalentes, compétences transférables…).
- Pour chaque point fort, explique pourquoi la compétence ou l'expérience du CV correspond à l'attente de l'offre (même si ce n'est pas le même mot).
- Pour chaque compétence manquante, explique pourquoi elle est importante et si le candidat a des expériences proches ou transférables.
- Ne mentionne jamais de compétence totalement absente du CV.
- Sois honnête : si une compétence n'est pas présente ni équivalente, indique-la comme manquante.
- Donne un score de compatibilité RH (sur 100) et justifie-le.

Réponds uniquement avec un JSON structuré de la forme :
{
  "compatibilityRate": number (pourcentage entre 0 et 100),
  "alignedSkills": [array des compétences du candidat qui correspondent, avec justification],
  "gaps": [array des compétences manquantes ou à renforcer, avec explication],
  "adaptationTips": [array de conseils pour améliorer la candidature],
  "cvSkills": [array des compétences extraites du CV],
  "offerSkills": [array des compétences extraites de l'offre],
  "rhAdvice": "conseils RH personnalisés pour adapter le CV à l'offre (texte)",
  "trainingSuggestions": [array ou texte de suggestions de formations/certifications],
  "cvTips": "conseils pour enrichir ou reformuler le CV (texte)"
}

Sois critique, constructif, et adopte le point de vue d'un recruteur métier. Utilise un langage simple et accessible.
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
      throw new Error("Erreur lors de l'analyse de compatibilité");
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
      const result = await this.interviewModel.generateContent(prompt);
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
      const result = await this.interviewModel.generateContent(prompt);
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
      const result = await this.interviewModel.generateContent(prompt);
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
Pour chaque compétence manquante ci-dessous, proposez un plan de développement réellement pertinent et accessible pour un utilisateur africain.

Compétences à combler :
${gaps.join(', ')}

Règles strictes :
- Proposez uniquement des ressources réelles, vérifiées et accessibles (cours, vidéos, certifications, articles, communautés, etc.).
- Proposez des ressources variées : vidéos YouTube, cours en ligne (Coursera, Udemy, OpenClassrooms), articles de blog, e-books, sites web spécialisés, communautés LinkedIn, certifications
- Donnez l'URL exacte de la ressource (pas de liens fictifs ou génériques).
- Incluez des ressources gratuites et payantes
- Si aucune ressource fiable n'existe pour une compétence, indiquez-le explicitement et n'inventez rien.
- Privilégiez les ressources en français et/ou accessibles depuis l'Afrique.
- Pour chaque compétence, recommandez la formation ou la ressource la plus adaptée et accessible, en expliquant pourquoi elle est pertinente.
- Précisez le type de ressource (cours, vidéo, certification, etc.), la plateforme, la difficulté, et une courte description.
- Donnez des conseils pratiques pour tirer le meilleur parti de chaque ressource.

Répondez uniquement avec un JSON structuré ainsi :
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
          "url": "string (URL réelle uniquement)",
          "difficulty": "beginner|intermediate|advanced",
          "duration": "string",
          "description": "string (description courte de la ressource)"
        }
      ],
      "bestRecommendation": "string (titre de la ressource la plus adaptée, ou 'Aucune ressource fiable trouvée' si c'est le cas)",
      "advice": "string (conseil pratique pour progresser sur cette compétence)"
    }
  ]
}

IMPORTANT :
- Ne fournissez jamais de ressource fictive ou inventée.
- Si aucune ressource fiable n'est trouvée, indiquez-le clairement dans le champ 'bestRecommendation' et ne remplissez pas le tableau 'resources'.
- Soyez synthétique, précis, et utile.
`;

    try {
      const result = await this.interviewModel.generateContent(prompt);
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
      const modelToUse = isLiveMode ? this.nativeAudioModel : this.interviewModel;
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
      const result = await this.interviewModel.generateContent(contextPrompt);
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
      const result = await this.interviewModel.generateContent([
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
      
      return {
        response: text,
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
      const result = await this.interviewModel.generateContent(prompt);
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