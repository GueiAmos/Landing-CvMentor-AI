import { CVAnalysis, JobOffer, CVJobMatch, CoverLetter, InterviewQuestion, InterviewFeedback, SkillGap, Resource } from '../types';
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
        { title: 'Management Fundamentals - Coursera', type: 'course', url: 'https://www.coursera.org/learn/management-fundamentals', difficulty: 'intermediate', duration: '4 semaines', description: 'Formation complète sur les fondamentaux du management' },
        { title: 'Leadership et Management - OpenClassrooms', type: 'course', url: 'https://openclassrooms.com/fr/courses/4296706-devenez-manager-de-projet', difficulty: 'beginner', duration: '20 heures', description: 'Cours gratuit sur le management de projet' },
        { title: 'Harvard Business Review - Leadership', type: 'blog', url: 'https://hbr.org/topic/leadership', difficulty: 'beginner', duration: 'Variable', description: 'Articles et conseils de Harvard Business Review sur le leadership' },
        { title: 'LinkedIn Learning - Management', type: 'course', url: 'https://www.linkedin.com/learning/topics/management', difficulty: 'intermediate', duration: 'Variable', description: 'Formations LinkedIn sur le management et leadership' },
        { title: 'Manager Tools - Podcast', type: 'website', url: 'https://www.manager-tools.com', difficulty: 'beginner', duration: 'Variable', description: 'Podcasts et ressources pour managers' }
      ],
      'certification professionnelle': [
        { title: 'Certification PMP - PMI', type: 'certification', url: 'https://www.pmi.org/certifications/project-management-pmp', difficulty: 'advanced', duration: '6 mois', description: 'Certification internationale en gestion de projet' },
        { title: 'Google Analytics Academy', type: 'certification', url: 'https://analytics.google.com/analytics/academy/', difficulty: 'intermediate', duration: '2 mois', description: 'Certification Google Analytics gratuite' },
        { title: 'Microsoft Certifications', type: 'certification', url: 'https://www.microsoft.com/en-us/learning/certification-exams.aspx', difficulty: 'intermediate', duration: 'Variable', description: 'Certifications Microsoft officielles' },
        { title: 'AWS Training and Certification', type: 'certification', url: 'https://aws.amazon.com/training/', difficulty: 'intermediate', duration: 'Variable', description: 'Formations et certifications AWS' },
        { title: 'Coursera Professional Certificates', type: 'certification', url: 'https://www.coursera.org/professional-certificates', difficulty: 'intermediate', duration: 'Variable', description: 'Certifications professionnelles Coursera' }
      ],
      'analyse de données': [
        { title: 'Excel pour Data Science - Coursera', type: 'course', url: 'https://www.coursera.org/learn/excel-data-science', difficulty: 'intermediate', duration: '4 semaines', description: 'Formation Excel pour l\'analyse de données' },
        { title: 'Python pour Data Science - DataCamp', type: 'course', url: 'https://www.datacamp.com/courses/intro-to-python-for-data-science', difficulty: 'intermediate', duration: '4 heures', description: 'Formation interactive Python et data science' },
        { title: 'Introduction à Python - OpenClassrooms', type: 'course', url: 'https://openclassrooms.com/fr/courses/235344-apprenez-a-programmer-en-python', difficulty: 'beginner', duration: '8 heures', description: 'Cours gratuit Python pour débutants' },
        { title: 'Kaggle - Plateforme d\'apprentissage', type: 'website', url: 'https://www.kaggle.com', difficulty: 'intermediate', duration: 'Variable', description: 'Plateforme pour pratiquer et apprendre la data science' },
        { title: 'Tableau Public - Visualisation', type: 'website', url: 'https://public.tableau.com', difficulty: 'beginner', duration: 'Variable', description: 'Outil gratuit de visualisation de données' }
      ],
      'communication': [
        { title: 'Communication Efficace - LinkedIn Learning', type: 'course', url: 'https://www.linkedin.com/learning/topics/communication', difficulty: 'beginner', duration: 'Variable', description: 'Cours sur les techniques de communication professionnelle' },
        { title: 'Présentation PowerPoint - Microsoft', type: 'course', url: 'https://support.microsoft.com/fr-fr/office/formation-powerpoint', difficulty: 'beginner', duration: 'Variable', description: 'Tutoriels officiels PowerPoint' },
        { title: 'Toastmasters International', type: 'community', url: 'https://www.toastmasters.org', difficulty: 'beginner', duration: 'Variable', description: 'Organisation pour améliorer ses compétences en communication' }
      ],
      'marketing digital': [
        { title: 'Google Digital Garage', type: 'course', url: 'https://learndigital.withgoogle.com/digitalgarage', difficulty: 'beginner', duration: 'Variable', description: 'Formations gratuites Google sur le marketing digital' },
        { title: 'HubSpot Academy', type: 'course', url: 'https://academy.hubspot.com', difficulty: 'beginner', duration: 'Variable', description: 'Certifications gratuites en inbound marketing' },
        { title: 'Facebook Blueprint', type: 'course', url: 'https://www.facebook.com/business/learn', difficulty: 'beginner', duration: 'Variable', description: 'Formations gratuites Facebook pour le marketing' },
        { title: 'LinkedIn Learning - Marketing Digital', type: 'course', url: 'https://www.linkedin.com/learning/topics/digital-marketing', difficulty: 'intermediate', duration: 'Variable', description: 'Formations LinkedIn sur le marketing digital' },
        { title: 'SEMrush Academy', type: 'course', url: 'https://www.semrush.com/academy/', difficulty: 'intermediate', duration: 'Variable', description: 'Formations gratuites sur le SEO et marketing digital' }
      ],
      'gestion de projet': [
        { title: 'Fondamentaux Gestion de Projet - Coursera', type: 'course', url: 'https://www.coursera.org/learn/project-management', difficulty: 'intermediate', duration: '4 semaines', description: 'Cours complet sur la gestion de projet' },
        { title: 'Trello - Outil de gestion', type: 'website', url: 'https://trello.com', difficulty: 'beginner', duration: 'Variable', description: 'Outil gratuit de gestion de projet' },
        { title: 'Asana - Gestion de projet', type: 'website', url: 'https://asana.com', difficulty: 'beginner', duration: 'Variable', description: 'Plateforme de gestion de projet et collaboration' },
        { title: 'Notion - Organisation', type: 'website', url: 'https://www.notion.so', difficulty: 'beginner', duration: 'Variable', description: 'Outil tout-en-un pour l\'organisation et la gestion' },
        { title: 'Scrum.org - Méthodes Agiles', type: 'website', url: 'https://www.scrum.org', difficulty: 'intermediate', duration: 'Variable', description: 'Ressources officielles sur Scrum et les méthodes agiles' }
      ],
      'développement web': [
        { title: 'HTML/CSS - OpenClassrooms', type: 'course', url: 'https://openclassrooms.com/fr/courses/1603881-apprenez-a-creer-votre-site-web-avec-html5-et-css3', difficulty: 'beginner', duration: '10 heures', description: 'Cours gratuit HTML/CSS pour débutants' },
        { title: 'JavaScript - MDN Web Docs', type: 'course', url: 'https://developer.mozilla.org/fr/docs/Web/JavaScript', difficulty: 'beginner', duration: 'Variable', description: 'Documentation officielle JavaScript' },
        { title: 'React - Documentation officielle', type: 'course', url: 'https://react.dev', difficulty: 'intermediate', duration: 'Variable', description: 'Documentation officielle React' },
        { title: 'FreeCodeCamp - Développement Web', type: 'course', url: 'https://www.freecodecamp.org', difficulty: 'beginner', duration: 'Variable', description: 'Formation gratuite complète développement web' },
        { title: 'GitHub - Collaboration', type: 'website', url: 'https://github.com', difficulty: 'intermediate', duration: 'Variable', description: 'Plateforme de collaboration pour développeurs' }
      ],
      'intelligence artificielle': [
        { title: 'Machine Learning - Coursera', type: 'course', url: 'https://www.coursera.org/learn/machine-learning', difficulty: 'advanced', duration: '11 semaines', description: 'Cours de machine learning par Andrew Ng' },
        { title: 'Deep Learning - DeepLearning.AI', type: 'course', url: 'https://www.deeplearning.ai', difficulty: 'advanced', duration: 'Variable', description: 'Formations spécialisées en deep learning' },
        { title: 'TensorFlow - Documentation', type: 'website', url: 'https://www.tensorflow.org', difficulty: 'intermediate', duration: 'Variable', description: 'Documentation officielle TensorFlow' },
        { title: 'Hugging Face - IA', type: 'website', url: 'https://huggingface.co', difficulty: 'intermediate', duration: 'Variable', description: 'Plateforme pour modèles d\'IA et NLP' }
      ],
      'cybersécurité': [
        { title: 'Cybersécurité - Coursera', type: 'course', url: 'https://www.coursera.org/learn/cybersecurity', difficulty: 'intermediate', duration: '4 semaines', description: 'Introduction à la cybersécurité' },
        { title: 'TryHackMe - Plateforme', type: 'website', url: 'https://tryhackme.com', difficulty: 'beginner', duration: 'Variable', description: 'Plateforme d\'apprentissage cybersécurité interactive' },
        { title: 'HackTheBox - Défis', type: 'website', url: 'https://www.hackthebox.com', difficulty: 'intermediate', duration: 'Variable', description: 'Plateforme de défis cybersécurité' },
        { title: 'OWASP - Sécurité Web', type: 'website', url: 'https://owasp.org', difficulty: 'intermediate', duration: 'Variable', description: 'Organisation pour la sécurité des applications web' }
      ]
    } as Record<string, Resource[]>;
    
    return gaps.slice(0, 5).map((gap, index) => ({
      skill: gap,
      importance: index < 2 ? 'high' : index < 4 ? 'medium' : 'low',
      estimatedTime: `${Math.floor(Math.random() * 3) + 2} à ${Math.floor(Math.random() * 6) + 4} mois`,
      resources: resourcesDatabase[gap.toLowerCase()] || [
        { title: `${gap} - Coursera`, type: 'course', url: 'https://www.coursera.org/search?query=' + encodeURIComponent(gap), difficulty: 'intermediate', duration: 'Variable', description: `Formations Coursera sur ${gap}` },
        { title: `${gap} - OpenClassrooms`, type: 'course', url: 'https://openclassrooms.com/fr/courses?query=' + encodeURIComponent(gap), difficulty: 'beginner', duration: 'Variable', description: `Cours gratuits OpenClassrooms sur ${gap}` },
        { title: `${gap} - LinkedIn Learning`, type: 'course', url: 'https://www.linkedin.com/learning/search?keywords=' + encodeURIComponent(gap), difficulty: 'intermediate', duration: 'Variable', description: `Formations LinkedIn sur ${gap}` },
        { title: `${gap} - Blog spécialisé`, type: 'blog', url: 'https://medium.com/search?q=' + encodeURIComponent(gap), difficulty: 'beginner', duration: 'Variable', description: `Articles et guides sur ${gap}` }
      ]
    }));
  }

  async generateInterviewIntro(jobOffer: JobOffer, isLiveMode: boolean = false): Promise<string> {
    if (this.useRealAPI) {
      try {
        return await geminiService.generateInterviewIntro(jobOffer, isLiveMode);
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
    jobOffer?: JobOffer,
    questionCount?: number,
    audioBlob?: Blob,
    isLiveMode?: boolean
  ): Promise<{ response: string; shouldEnd: boolean; finalReport?: any }> {
    if (this.useRealAPI) {
      try {
        return await geminiService.interviewChatWithGemini(chatHistory, jobOffer, questionCount, audioBlob, isLiveMode);
      } catch (error) {
        console.warn('Fallback vers réponse simulée:', error);
      }
    }

    // Simulation locale en fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const shouldEnd = (questionCount || 0) >= 6;
    
    if (shouldEnd) {
      return {
        response: "L'entretien est terminé. Vous recevrez un rapport détaillé.",
        shouldEnd: true,
        finalReport: {
          globalScore: 6,
          strengths: ["Participation active", "Réponses structurées"],
          weaknesses: ["Manque d'exemples concrets", "Peu de questions posées"],
          improvements: ["Préparer des exemples STAR", "Poser plus de questions sur l'entreprise"],
          trainingResources: [
            {
              title: "Méthode STAR pour entretiens",
              type: "video",
              description: "Apprendre à structurer ses réponses",
              priority: "high"
            }
          ],
          recommendation: "Candidat à potentiel, nécessite plus de préparation",
          nextSteps: ["S'entraîner avec la méthode STAR", "Préparer des questions sur l'entreprise"]
        }
      };
    }
    
    const firmResponses = [
      "Bien. Donnez-moi un exemple concret d'un projet où vous avez pris des responsabilités.",
      "Intéressant. Comment gérez-vous la pression et les délais serrés ?",
      "Qu'est-ce qui vous motive réellement dans ce secteur d'activité ?",
      "Pourquoi notre entreprise plutôt qu'une autre ? Soyez précis.",
      "Décrivez-moi une situation où vous avez dû résoudre un conflit.",
      "Quelles sont vos attentes salariales pour ce poste ?"
    ];
    
    return {
      response: firmResponses[Math.floor(Math.random() * firmResponses.length)],
      shouldEnd: false
    };
  }
}

export const aiService = new AIService();