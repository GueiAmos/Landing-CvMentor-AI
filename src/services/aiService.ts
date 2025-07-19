import { CVAnalysis, JobOffer, CVJobMatch, CoverLetter, InterviewQuestion, InterviewFeedback, SkillGap } from '../types';
import { geminiService } from './geminiService';

class AIService {
  private useRealAPI: boolean;

  constructor() {
    // Vérifier si la clé API Gemini est disponible
    this.useRealAPI = !!import.meta.env.VITE_GEMINI_API_KEY;
  }

  private async simulateAPIDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
  }

  async analyzeCV(cvText: string): Promise<CVAnalysis> {
    if (this.useRealAPI) {
      try {
        return await geminiService.analyzeCV(cvText);
      } catch (error) {
        console.warn('Fallback vers analyse simulée:', error);
        // Fallback vers simulation en cas d'erreur API
      }
    }

    // Simulation locale en fallback
    await this.simulateAPIDelay();
    
    // Analyse simulée basée sur le contenu du CV
    const hasExperience = cvText.toLowerCase().includes('expérience') || cvText.toLowerCase().includes('stage');
    const hasSkills = cvText.toLowerCase().includes('compétences') || cvText.toLowerCase().includes('skills');
    const hasEducation = cvText.toLowerCase().includes('formation') || cvText.toLowerCase().includes('diplôme');
    
    const baseScore = 6;
    let globalScore = baseScore;
    globalScore += hasExperience ? 1.5 : 0;
    globalScore += hasSkills ? 1 : 0;
    globalScore += hasEducation ? 0.5 : 0;
    globalScore = Math.min(globalScore, 10);

    return {
      globalScore: Math.round(globalScore * 10) / 10,
      detailedScores: {
        clarity: Math.round((globalScore * 0.9 + Math.random() * 1) * 10) / 10,
        impact: Math.round((globalScore * 0.8 + Math.random() * 1.5) * 10) / 10,
        structure: Math.round((globalScore * 1.1 - Math.random() * 0.5) * 10) / 10,
      },
      strengths: [
        '**Expérience professionnelle** bien expliquée et détaillée',
        '**Compétences techniques** clairement présentées',
        '**Formation** qui correspond bien au secteur visé',
        '**Présentation** bien organisée et professionnelle'
      ].slice(0, Math.floor(Math.random() * 2) + 2),
      improvements: [
        'Ajouter des **chiffres concrets** sur vos réussites (ex: "j\'ai augmenté les ventes de 20%")',
        'Développer la section **projets personnels** pour montrer votre motivation',
        'Inclure plus de **mots-clés** du secteur pour être mieux repéré',
        'Mieux expliquer vos **responsabilités** avec des exemples précis',
        'Ajouter des **formations** ou certifications récentes'
      ].slice(0, Math.floor(Math.random() * 2) + 3),
      missingKeywords: [
        '**leadership**', '**gestion de projet**', '**innovation**', '**travail en équipe**',
        '**résolution de problèmes**', '**adaptabilité**', '**autonomie**'
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      formatRecommendations: [
        'Utiliser des **puces** pour rendre la lecture plus facile',
        'Garder votre CV sur **2 pages maximum**',
        'Choisir une **police simple** comme Arial ou Calibri',
        'Laisser des **espaces** entre les sections pour aérer'
      ].slice(0, Math.floor(Math.random() * 2) + 2)
    };
  }

  async analyzePDFCV(pdfBase64: string): Promise<CVAnalysis> {
    if (this.useRealAPI) {
      try {
        return await geminiService.analyzePDFCV(pdfBase64);
      } catch (error) {
        console.warn('Fallback vers analyse simulée:', error);
        // Fallback vers simulation en cas d'erreur API
      }
    }

    // Simulation locale en fallback
    await this.simulateAPIDelay();
    
    const baseScore = 7; // Score légèrement plus élevé pour PDF (format professionnel)
    let globalScore = baseScore + Math.random() * 2;
    globalScore = Math.min(globalScore, 10);

    return {
      globalScore: Math.round(globalScore * 10) / 10,
      detailedScores: {
        clarity: Math.round((globalScore * 0.9 + Math.random() * 1) * 10) / 10,
        impact: Math.round((globalScore * 0.8 + Math.random() * 1.5) * 10) / 10,
        structure: Math.round((globalScore * 1.1 - Math.random() * 0.5) * 10) / 10,
      },
      strengths: [
        '**Document PDF** professionnel et bien présenté',
        '**Structure claire** et facile à lire',
        '**Présentation soignée** qui fait bonne impression',
        '**Format adapté** aux standards professionnels'
      ].slice(0, Math.floor(Math.random() * 2) + 3),
      improvements: [
        'Ajouter des **chiffres concrets** sur vos réussites',
        'Développer la section **projets personnels**',
        'Inclure plus de **mots-clés** du secteur',
        'Mieux expliquer vos **responsabilités**',
        'Ajouter des **formations** récentes'
      ].slice(0, Math.floor(Math.random() * 2) + 3),
      missingKeywords: [
        '**leadership**', '**gestion de projet**', '**innovation**', '**collaboration**',
        '**résolution de problèmes**', '**adaptabilité**', '**autonomie**'
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      formatRecommendations: [
        'Garder la **qualité du format PDF**',
        'S\'assurer que les **robots de recrutement** peuvent le lire',
        'Vérifier que ça s\'ouvre bien sur **tous les appareils**',
        'Garder un **fichier pas trop lourd**'
      ].slice(0, Math.floor(Math.random() * 2) + 2)
    };
  }

  async matchCVWithJob(cvText: string, jobOffer: JobOffer): Promise<CVJobMatch> {
    if (this.useRealAPI) {
      try {
        return await geminiService.matchCVWithJob(cvText, jobOffer);
      } catch (error) {
        console.warn('Fallback vers matching simulé:', error);
      }
    }

    await this.simulateAPIDelay();
    
    const cvWords = cvText.toLowerCase().split(/\s+/);
    const jobWords = jobOffer.description.toLowerCase().split(/\s+/);
    const requiredSkills = jobOffer.skills.map(skill => skill.toLowerCase());
    
    // Calcul de compatibilité simulé
    let matchedSkills = 0;
    const alignedSkills: string[] = [];
    
    requiredSkills.forEach(skill => {
      if (cvWords.some(word => word.includes(skill) || skill.includes(word))) {
        matchedSkills++;
        alignedSkills.push(skill);
      }
    });
    
    const compatibilityRate = Math.min((matchedSkills / requiredSkills.length) * 100, 100);
    
    return {
      compatibilityRate: Math.round(compatibilityRate),
      alignedSkills: alignedSkills.slice(0, 8),
      gaps: [
        'Expérience en gestion d\'équipe',
        'Certification professionnelle du secteur',
        'Maîtrise d\'outils spécialisés',
        'Expérience internationale',
        'Compétences en analyse de données'
      ].slice(0, Math.max(1, 5 - matchedSkills)),
      adaptationTips: [
        'Mettre en avant vos **projets similaires** au poste demandé',
        'Utiliser les **mots-clés** de l\'offre dans votre CV',
        'Ajouter des **chiffres** sur vos réussites passées',
        'Créer une section **"Projets importants"**',
        'Expliquer pourquoi ce **secteur vous passionne**'
      ].slice(0, 4)
    };
  }

  async generateCoverLetter(
    cvText: string, 
    jobOffer: JobOffer, 
    tone: 'formal' | 'dynamic' | 'creative'
  ): Promise<CoverLetter> {
    if (this.useRealAPI) {
      try {
        return await geminiService.generateCoverLetter(cvText, jobOffer, tone);
      } catch (error) {
        console.warn('Fallback vers génération simulée:', error);
      }
    }

    await this.simulateAPIDelay();
    
    const toneStyles = {
      formal: {
        opening: 'Madame, Monsieur,\n\nC\'est avec un grand intérêt que je soumets ma candidature',
        closing: 'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.'
      },
      dynamic: {
        opening: 'Bonjour,\n\nPassionné(e) par le secteur et motivé(e) par les défis',
        closing: 'J\'ai hâte de contribuer au succès de votre équipe. À très bientôt !'
      },
      creative: {
        opening: 'Bonjour l\'équipe de ' + jobOffer.company + ' !\n\nVotre offre a immédiatement capté mon attention',
        closing: 'Ensemble, créons quelque chose d\'extraordinaire. Au plaisir d\'échanger avec vous !'
      }
    };
    
    const style = toneStyles[tone];
    
    const content = `${style.opening} pour le poste de **${jobOffer.title}** au sein de **${jobOffer.company}**.

Grâce à mon **expérience** et mes **compétences** qui correspondent à vos besoins, je peux apporter une vraie **valeur ajoutée** à votre équipe. Mes **réussites passées** et ma **passion** pour ce domaine me permettront de relever avec succès les défis de ce poste.

Votre entreprise et ses **valeurs** correspondent parfaitement à mes **objectifs professionnels**. Je suis particulièrement motivé(e) par l'opportunité de contribuer à vos **projets innovants** et de développer mes compétences au sein de votre équipe dynamique.

${style.closing}`;

    return {
      content,
      tone
    };
  }

  async generateInterviewQuestions(jobOffer: JobOffer, difficulty: string): Promise<InterviewQuestion[]> {
    if (this.useRealAPI) {
      try {
        return await geminiService.generateInterviewQuestions(jobOffer, difficulty);
      } catch (error) {
        console.warn('Fallback vers questions simulées:', error);
      }
    }

    await this.simulateAPIDelay();
    
    const questionPool = {
      general: [
        'Présentez-vous en quelques minutes',
        'Pourquoi souhaitez-vous rejoindre notre entreprise ?',
        'Quelles sont vos principales motivations ?',
        'Où vous voyez-vous dans 5 ans ?',
        'Pourquoi quittez-vous votre poste actuel ?'
      ],
      behavioral: [
        'Décrivez une situation où vous avez dû surmonter un défi important',
        'Comment gérez-vous le stress et la pression ?',
        'Parlez-moi d\'un projet dont vous êtes particulièrement fier(ère)',
        'Comment travaillez-vous en équipe ?',
        'Décrivez un échec et ce que vous en avez appris'
      ],
      technical: [
        'Quelles sont vos compétences techniques principales ?',
        'Comment vous tenez-vous informé(e) des évolutions de votre secteur ?',
        'Décrivez votre méthode de travail pour un projet complexe',
        'Quels outils utilisez-vous quotidiennement ?',
        'Comment abordez-vous un problème technique difficile ?'
      ]
    };
    
    const questions: InterviewQuestion[] = [];
    const types: Array<keyof typeof questionPool> = ['general', 'behavioral', 'technical'];
    
    types.forEach((type, index) => {
      const typeQuestions = questionPool[type];
      const numQuestions = type === 'general' ? 3 : 3;
      
      for (let i = 0; i < numQuestions; i++) {
        if (typeQuestions[i]) {
          questions.push({
            id: `${type}_${i}`,
            question: typeQuestions[i],
            type,
            timeLimit: type === 'general' ? 180 : type === 'behavioral' ? 240 : 300
          });
        }
      }
    });
    
    return questions.slice(0, 8);
  }

  async evaluateInterviewAnswer(
    question: InterviewQuestion, 
    answer: string
  ): Promise<InterviewFeedback> {
    if (this.useRealAPI) {
      try {
        return await geminiService.evaluateInterviewAnswer(question, answer);
      } catch (error) {
        console.warn('Fallback vers évaluation simulée:', error);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const answerLength = answer.length;
    const hasStructure = answer.includes('.') && answer.split('.').length > 2;
    const hasExamples = answer.toLowerCase().includes('exemple') || 
                       answer.toLowerCase().includes('par exemple') ||
                       answer.toLowerCase().includes('notamment');
    
    let score = 3; // Score de base
    
    if (answerLength > 100) score += 0.5;
    if (answerLength > 200) score += 0.5;
    if (hasStructure) score += 0.5;
    if (hasExamples) score += 0.5;
    if (answerLength < 50) score -= 1;
    
    score = Math.max(1, Math.min(5, score));
    
    const feedbackMessages = {
      1: 'Réponse **trop courte**, il faut développer davantage vos idées',
      2: 'Réponse **insuffisante**, ajoutez des **exemples concrets**',
      3: 'Réponse **correcte** mais peut être améliorée',
      4: '**Bonne réponse** avec des éléments pertinents',
      5: '**Excellente réponse**, complète et bien organisée'
    };
    
    return {
      questionId: question.id,
      score: Math.round(score * 10) / 10,
      feedback: feedbackMessages[Math.round(score) as keyof typeof feedbackMessages],
      improvements: [
        '**Organisez** votre réponse : introduction, développement, conclusion',
        'Donnez des **exemples concrets** de votre expérience',
        'Ajoutez des **chiffres** sur vos réussites',
        'Montrez votre **passion** et votre **motivation**'
      ].slice(0, Math.round(Math.random() * 2) + 2)
    };
  }

  async generateSkillDevelopmentPlan(gaps: string[]): Promise<SkillGap[]> {
    if (this.useRealAPI) {
      try {
        return await geminiService.generateSkillDevelopmentPlan(gaps);
      } catch (error) {
        console.warn('Fallback vers plan simulé:', error);
      }
    }

    await this.simulateAPIDelay();
    
    const resourcesDatabase = {
      'gestion d\'équipe': [
        { title: 'Management Fundamentals', type: 'course', url: '#', difficulty: 'intermediate', duration: '4 semaines' },
        { title: 'Leadership in Africa', type: 'video', url: '#', difficulty: 'beginner', duration: '2 heures' }
      ],
      'certification professionnelle': [
        { title: 'Certification PMP', type: 'certification', url: '#', difficulty: 'advanced', duration: '6 mois' },
        { title: 'Google Analytics Certified', type: 'certification', url: '#', difficulty: 'intermediate', duration: '2 mois' }
      ],
      'analyse de données': [
        { title: 'Excel avancé pour l\'analyse', type: 'course', url: '#', difficulty: 'intermediate', duration: '3 semaines' },
        { title: 'Introduction à Python', type: 'video', url: '#', difficulty: 'beginner', duration: '8 heures' }
      ]
    } as Record<string, Resource[]>;
    
    return gaps.slice(0, 5).map((gap, index) => ({
      skill: gap,
      importance: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
      estimatedTime: '',
      resources: resourcesDatabase[gap] || [
        { title: `**Formation** ${gap}`, type: 'course', url: '#', difficulty: 'intermediate', duration: '4 semaines', description: `Formation complète sur **${gap}**` },
        { title: `**Guide pratique** ${gap}`, type: 'article', url: '#', difficulty: 'beginner', duration: '1 heure', description: `Guide d'introduction à **${gap}**` }
      ]
    }));
  }

  async generateInterviewIntro(jobOffer: JobOffer): Promise<string> {
    if (this.useRealAPI) {
      try {
        return await geminiService.generateInterviewIntro(jobOffer);
      } catch (error) {
        console.warn('Fallback vers intro simulée:', error);
      }
    }

    // Simulation locale en fallback
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return `Bonjour et bienvenue ! Je suis ${Math.random() > 0.5 ? 'Sarah' : 'David'}, DRH chez **${jobOffer.company}**. 

Je suis ravi(e) de vous rencontrer aujourd'hui pour discuter du poste de **${jobOffer.title}**. 

Cet entretien va nous permettre de mieux nous connaître mutuellement. Je vais vous poser quelques questions sur votre parcours, vos motivations et vos compétences, et vous pourrez également me poser toutes vos questions sur le poste et notre entreprise.

Pour commencer, pourriez-vous vous présenter en quelques minutes et me parler de votre parcours professionnel ?`;
  }

  async interviewChatWithGemini(
    chatHistory: Array<{ role: string; content: string }>, 
    jobOffer?: JobOffer
  ): Promise<string> {
    if (this.useRealAPI) {
      try {
        return await geminiService.interviewChatWithGemini(chatHistory, jobOffer);
      } catch (error) {
        console.warn('Fallback vers réponse simulée:', error);
      }
    }

    // Simulation locale en fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      "Très intéressant ! Pouvez-vous me donner un exemple concret d'un projet dont vous êtes particulièrement fier(ère) ?",
      "C'est une expérience enrichissante. Comment gérez-vous le stress et la pression dans votre travail ?",
      "Parfait ! Qu'est-ce qui vous motive le plus dans ce type de poste ?",
      "Merci pour cette réponse. Pourquoi souhaitez-vous rejoindre notre entreprise spécifiquement ?",
      "Excellent ! Avez-vous des questions sur le poste ou sur notre entreprise ?",
      "C'est une bonne approche. Comment voyez-vous votre évolution professionnelle dans les 3 prochaines années ?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const aiService = new AIService();