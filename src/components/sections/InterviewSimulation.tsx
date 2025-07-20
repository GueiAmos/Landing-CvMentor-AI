import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Mic, Send, Loader2, ArrowLeft, MicOff, Brain, Play, Pause, CheckCircle, TrendingUp, AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { getSession } from '../../utils/storage';
import LoadingSpinner from '../ui/LoadingSpinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { InterviewResponse, InterviewQuestion } from '../../types';

interface ChatMessage {
  role: 'user' | 'ia';
  content: string;
  audioBlob?: Blob;
  audioUrl?: string;
  isAudioMessage?: boolean;
  canReplay?: boolean;
  isSending?: boolean;
  sendError?: boolean;
}

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  isRecording,
  onStartRecording,
  onStopRecording
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      onStartRecording();
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions et réessayez.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      onStopRecording();
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-3 rounded-full transition-all duration-200 ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
          : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
      }`}
      aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement'}
    >
      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
};

interface AudioPlayerProps {
  audioUrl: string;
  content: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRetry?: () => void;
  isSending?: boolean;
  sendError?: boolean;
  duration?: number;
  currentTime?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  content,
  isPlaying,
  onPlay,
  onPause,
  onRetry,
  isSending = false,
  sendError = false,
  duration = 0,
  currentTime = 0
}) => {

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative">
      {/* Message audio moderne avec style adaptatif */}
      <div className="flex items-center gap-3 min-w-[200px] max-w-[300px]">
        {/* Bouton play/pause avec style adaptatif */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={isSending}
          className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 text-gray-800" />
          ) : (
            <Play className="h-4 w-4 text-gray-800 ml-0.5" />
          )}
        </button>

        {/* Barre de progression avec style adaptatif */}
        <div className="flex-1 h-1.5 bg-gray-300 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Indicateur de statut */}
        {isSending && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Transcription avec style adaptatif */}
      <div className="mt-2 text-xs text-gray-600 max-w-[300px]">
        {content}
      </div>

      {/* Bouton de retry si erreur */}
      {sendError && onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-2 text-red-600 hover:text-red-700 text-xs font-medium"
        >
          <RotateCcw className="h-3 w-3" />
          Réessayer
        </button>
      )}
    </div>
  );
};

interface InterviewReport {
  globalScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendation: string;
  nextSteps: string[];
}
const InterviewSimulation: React.FC = () => {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [finalReport, setFinalReport] = useState<InterviewReport | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [mode, setMode] = useState<'questions' | 'discussion' | null>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [isIATalking, setIsIATalking] = useState(false);
  const [liveAudioContext, setLiveAudioContext] = useState<AudioContext | null>(null);
  const [audioDurations, setAudioDurations] = useState<{ [key: string]: number }>({});
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [previewAudio, setPreviewAudio] = useState<Blob | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Démarrage du mode Questions-Réponses
  const startQuestionsMode = async () => {
    setMode('questions');
    setSessionStarted(true);
    setChat([]);
    setError('');
    setIsLoading(true);
    try {
      const session = getSession();
      if (!session.jobOffer) {
        setError("Veuillez d'abord effectuer une comparaison CV-Offre.");
        setIsLoading(false);
        return;
      }
      
      // Générer les questions automatiquement
      const generatedQuestions = await aiService.generateInterviewQuestions(session.jobOffer, 'medium');
      setQuestions(generatedQuestions.slice(0, 6)); // Limiter à 6 questions
      setCurrentQuestionIndex(0);
      setAnswers(new Array(6).fill(''));
      
      // Premier message IA : introduction
      const intro = await aiService.generateInterviewIntro(session.jobOffer, false);
      setChat([{ role: 'ia', content: intro }]);
    } catch (e) {
      setError('Erreur lors du démarrage du mode Questions-Réponses.');
    } finally {
      setIsLoading(false);
    }
  };

  // Démarrage du mode Discussion Live
  const startDiscussionMode = async () => {
    setMode('discussion');
    setSessionStarted(true);
    setChat([]);
    setError('');
    setIsLoading(true);
    try {
      const session = getSession();
      if (!session.jobOffer) {
        setError("Veuillez d'abord effectuer une comparaison CV-Offre.");
        setIsLoading(false);
        return;
      }
      
      // Premier message IA : introduction personnalisée
      const intro = await aiService.generateInterviewIntro(session.jobOffer, true);
      setChat([{ role: 'ia', content: intro }]);
    } catch (e) {
      setError('Erreur lors du démarrage du mode Discussion Live.');
    } finally {
      setIsLoading(false);
    }
  };

    // Envoi d'un message utilisateur
  const sendMessage = async (message: string, audioBlob?: Blob) => {
    if (!message.trim() && !audioBlob) return null;
    
    // Créer une URL pour l'audio si présent
    let audioUrl: string | undefined;
    if (audioBlob) {
      audioUrl = URL.createObjectURL(audioBlob);
    }
    
    // Ajouter le message à l'historique (texte ou indication audio)
    const displayMessage = audioBlob ? "🎤 Message vocal enregistré et envoyé" : message;
    const messageId = `user_${Date.now()}`;
    setChat((prev) => [...prev, { 
      role: 'user', 
      content: displayMessage,
      audioBlob,
      audioUrl,
      isAudioMessage: !!audioBlob,
      canReplay: !!audioBlob,
      isSending: true,
      sendError: false
    }]);
    setInput('');
    setIsLoading(true);
    setError('');
    
    const newQuestionCount = questionCount + 1;
    setQuestionCount(newQuestionCount);
    
    try {
      const session = getSession();
      const jobOffer = session.jobOffer;
      // Construit l'historique pour Gemini
      const history = chat.map(m => ({ 
        role: m.role, 
        content: m.content === "🎤 Message vocal envoyé" ? "[Message vocal]" : m.content 
      }));
      history.push({ role: 'user', content: audioBlob ? "[Message vocal]" : message });
      
      // Gestion différente selon le mode
      let result: any;
      if (mode === 'questions') {
        // Mode Questions-Réponses : pas de réponse audio automatique
        result = await aiService.interviewChatWithGemini(history, jobOffer, newQuestionCount, audioBlob, false);
        
        // Mettre à jour le message utilisateur (enlever l'état d'envoi)
        setChat((prev) => prev.map((msg, index) => 
          index === prev.length - 1 ? { ...msg, isSending: false, sendError: false } : msg
        ));

        // Ajouter la réponse IA en texte seulement
        setChat((prev) => [...prev, { 
          role: 'ia', 
          content: result.response,
          isAudioMessage: false,
          canReplay: false
        }]);
        
        // Gestion de la fin d'entretien pour le mode Questions
        if (result.shouldEnd) {
          setInterviewEnded(true);
          setIsGeneratingReport(true);
          
          if (result.finalReport) {
            setTimeout(() => {
              setFinalReport(result.finalReport);
              setIsGeneratingReport(false);
            }, 2000);
          } else {
            setIsGeneratingReport(false);
          }
        }
        
        return result;
      } else {
        // Mode Discussion Live : réponse audio automatique
        result = await aiService.interviewChatWithGemini(history, jobOffer, newQuestionCount, audioBlob, true);
        
        // Mettre à jour le message utilisateur (enlever l'état d'envoi)
        setChat((prev) => prev.map((msg, index) => 
          index === prev.length - 1 ? { ...msg, isSending: false, sendError: false } : msg
        ));

        // Créer une URL pour l'audio généré si disponible
        let responseAudioUrl: string | undefined;
        if (result.audioBlob) {
          responseAudioUrl = URL.createObjectURL(result.audioBlob);
        }

        // Ajouter la réponse IA - si audio généré, afficher seulement l'audio, sinon le texte
        setChat((prev) => [...prev, { 
          role: 'ia', 
          content: result.audioBlob ? "🎧 Message vocal du DRH" : result.response,
          audioBlob: result.audioBlob,
          audioUrl: responseAudioUrl,
          isAudioMessage: !!result.audioBlob,
          canReplay: !!result.audioBlob
        }]);
        
        // Lecture automatique de l'audio si disponible
        if (result.audioBlob && responseAudioUrl) {
          console.log('Lecture automatique de la réponse audio du DRH...');
          setTimeout(() => {
            const audio = new Audio(responseAudioUrl);
            audio.play().catch(error => {
              console.error('Erreur lors de la lecture automatique:', error);
            });
          }, 500); // Délai pour laisser l'interface se mettre à jour
        }
        
        // Gestion de la fin d'entretien pour le mode Discussion
        if (result.shouldEnd) {
          setInterviewEnded(true);
          setIsGeneratingReport(true);
          
          if (result.finalReport) {
            setTimeout(() => {
              setFinalReport(result.finalReport);
              setIsGeneratingReport(false);
            }, 2000);
          } else {
            setIsGeneratingReport(false);
          }
        }
        
        return result;
      }
    } catch (e) {
      // Marquer le message comme ayant une erreur
      setChat((prev) => prev.map((msg, index) => 
        index === prev.length - 1 ? { ...msg, isSending: false, sendError: true } : msg
      ));
      setError('Erreur lors de la réponse IA.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'envoi (entrée ou bouton)
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
  };

  // Gestion de l'enregistrement vocal
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessingAudio(true);
    try {
      // Envoyer directement l'audio à Gemini 2.5 Flash Native Audio
      await sendMessage("", audioBlob);
    } catch (error) {
      console.error('Erreur lors du traitement audio:', error);
      setError('Erreur lors du traitement du message vocal. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setError('');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  // Gestion de la soumission de réponse pour le mode Questions-Réponses
  const handleSubmitAnswer = async () => {
    if (!answers[currentQuestionIndex]?.trim() && !previewAudio) return;
    
    setIsLoading(true);
    try {
      // Préparer la réponse (texte ou audio)
      let responseContent = answers[currentQuestionIndex] || '';
      let audioBlob: Blob | undefined;
      
      if (previewAudio) {
        audioBlob = previewAudio;
        responseContent = "🎤 Réponse vocale";
      }
      
      // Envoyer la réponse
      await sendMessage(responseContent, audioBlob);
      
      // Passer à la question suivante ou terminer
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setPreviewAudio(null);
        setPreviewAudioUrl(null);
      } else {
        // Dernière question terminée, générer le rapport
        setInterviewEnded(true);
        setIsGeneratingReport(true);
        
        // Simuler la génération du rapport
        setTimeout(() => {
          // Ici on pourrait générer un vrai rapport basé sur les réponses
          setFinalReport({
            globalScore: 8,
            strengths: ["Bonne participation", "Réponses complètes"],
            weaknesses: ["Peut améliorer la concision"],
            improvements: ["Travailler la concision", "Préparer des exemples"],
            recommendation: "Candidat prometteur",
            nextSteps: ["Entretien technique", "Références"]
          });
          setIsGeneratingReport(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la réponse:', error);
      setError('Erreur lors de la soumission de la réponse.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la lecture audio
  const toggleAudioPlayback = (messageIndex: number, audioUrl: string) => {
    const audioKey = `audio_${messageIndex}`;
    
    if (playingAudio === audioKey) {
      // Arrêter la lecture
      if (audioRefs.current[audioKey]) {
        audioRefs.current[audioKey].pause();
        audioRefs.current[audioKey].currentTime = 0;
      }
      setPlayingAudio(null);
      setAudioProgress(prev => ({ ...prev, [audioKey]: 0 }));
    } else {
      // Arrêter toute autre lecture en cours
      if (playingAudio && audioRefs.current[playingAudio]) {
        audioRefs.current[playingAudio].pause();
        audioRefs.current[playingAudio].currentTime = 0;
        setAudioProgress(prev => ({ ...prev, [playingAudio]: 0 }));
      }
      
      // Démarrer la nouvelle lecture
      if (!audioRefs.current[audioKey]) {
        audioRefs.current[audioKey] = new Audio(audioUrl);
        audioRefs.current[audioKey].onended = () => {
          setPlayingAudio(null);
          setAudioProgress(prev => ({ ...prev, [audioKey]: 0 }));
        };
        
        // Charger la durée
        audioRefs.current[audioKey].onloadedmetadata = () => {
          const duration = audioRefs.current[audioKey].duration;
          setAudioDurations(prev => ({ ...prev, [audioKey]: duration }));
        };
        
        // Suivre la progression
        audioRefs.current[audioKey].ontimeupdate = () => {
          const audio = audioRefs.current[audioKey];
          if (audio) {
            const progress = (audio.currentTime / audio.duration) * 100;
            setAudioProgress(prev => ({ ...prev, [audioKey]: progress }));
          }
        };
      }
      
      audioRefs.current[audioKey].play();
      setPlayingAudio(audioKey);
    }
  };

  // Fonction pour arrêter l'audio d'un message spécifique
  const stopAudioForMessage = (messageIndex: number) => {
    const audioKey = `audio_${messageIndex}`;
    if (audioRefs.current[audioKey]) {
      audioRefs.current[audioKey].pause();
      audioRefs.current[audioKey].currentTime = 0;
    }
    if (playingAudio === audioKey) {
      setPlayingAudio(null);
      setAudioProgress(prev => ({ ...prev, [audioKey]: 0 }));
    }
  };

  // Fonction pour arrêter tous les audios en cours
  const stopAllAudio = useCallback(() => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setPlayingAudio(null);
    setAudioProgress({});
  }, []);

  // Nettoyage des URLs d'objets lors du démontage
  useEffect(() => {
    return () => {
      chat.forEach((msg) => {
        if (msg.audioUrl) {
          URL.revokeObjectURL(msg.audioUrl);
        }
      });
      stopAllAudio();
    };
  }, [stopAllAudio]);

  // Arrêter l'audio quand on change de mode ou de vue
  useEffect(() => {
    stopAllAudio();
  }, [mode, sessionStarted, interviewEnded, stopAllAudio]);

  // Arrêter l'audio quand l'utilisateur quitte la page ou change d'onglet
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAllAudio();
      }
    };

    const handleBeforeUnload = () => {
      stopAllAudio();
    };

    // Arrêter l'audio quand l'utilisateur navigue vers une autre section
    const handlePopState = () => {
      stopAllAudio();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      stopAllAudio(); // Arrêter l'audio lors du démontage du composant
    };
  }, [stopAllAudio]);

  // Annulation/reinitialisation
  const resetSession = () => {
    stopAllAudio(); // Arrêter tous les audios en cours
    setSessionStarted(false);
    setMode(null);
    setChat([]);
    setInput('');
    setError('');
    setInterviewEnded(false);
    setFinalReport(null);
    setIsGeneratingReport(false);
    setLiveMode(false);
    stopLiveMode();
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setAnswers([]);
    setPreviewAudio(null);
    setPreviewAudioUrl(null);
  };

  // Gestion du mode live
  const startLiveMode = async () => {
    try {
      console.log('Démarrage du mode live...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      console.log('Stream audio obtenu:', stream);
      setLiveStream(stream);
      setLiveMode(true);
      setError('');
      
      // Créer un contexte audio pour le traitement en temps réel
      const audioContext = new AudioContext();
      setLiveAudioContext(audioContext);
      
      // Démarrer la conversation live avec le modèle audio natif
      const session = getSession();
      if (session.jobOffer) {
        console.log('Génération de l\'introduction...');
        const intro = await aiService.generateInterviewIntro(session.jobOffer, true); // Mode live activé
        setChat([{ role: 'ia', content: intro }]);
        setSessionStarted(true);
        
        // L'IA parle en premier avec le modèle audio natif, l'utilisateur attend
        setIsIATalking(true);
        console.log('IA parle en premier, attente de 4 secondes...');
        
        // L'enregistrement ne démarre qu'après que l'IA ait fini de parler
        setTimeout(() => {
          console.log('Démarrage de l\'enregistrement continu...');
          setIsIATalking(false);
          startContinuousRecording();
        }, 4000); // Délai pour laisser l'IA parler en premier
      } else {
        setError('Veuillez d\'abord effectuer une comparaison CV-Offre.');
        stopLiveMode();
      }
      
    } catch (error) {
      console.error('Erreur lors du démarrage du mode live:', error);
      setError('Impossible de démarrer le mode live. Vérifiez les permissions microphone.');
    }
  };

  const stopLiveMode = () => {
    if (liveStream) {
      liveStream.getTracks().forEach(track => track.stop());
      setLiveStream(null);
    }
    if (liveAudioContext) {
      liveAudioContext.close();
      setLiveAudioContext(null);
    }
    setLiveMode(false);
    setIsLiveRecording(false);
    setIsIATalking(false);
  };

  // Traitement audio en temps réel avec gemini-live-2.5-flash-preview
  const processLiveAudio = async (audioBlob: Blob) => {
    if (!liveMode) return;
    
    console.log('Traitement audio live avec gemini-live-2.5-flash-preview, taille:', audioBlob.size);
    setIsLiveRecording(true);
    
    // Créer une URL pour l'audio
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Ajouter le message audio à la conversation
    const messageId = `live_${Date.now()}`;
    setChat((prev) => [...prev, { 
      role: 'user', 
      content: "🎤 Message vocal enregistré et envoyé",
      audioBlob,
      audioUrl,
      isAudioMessage: true,
      canReplay: true,
      isSending: true,
      sendError: false
    }]);
    
    try {
      console.log('Envoi du message audio au modèle live...');
      const result = await sendMessage("", audioBlob);
      console.log('Résultat de l\'envoi:', result);
      
      // Mettre à jour le message utilisateur (enlever l'état d'envoi)
      setChat((prev) => prev.map((msg, index) => 
        index === prev.length - 1 ? { ...msg, isSending: false, sendError: false } : msg
      ));
      
      // Ajouter la réponse IA si disponible
      if (result && result.response) {
        setChat((prev) => [...prev, { 
          role: 'ia', 
          content: "🎧 Réponse audio de l'IA",
          isAudioMessage: true,
          canReplay: true
        }]);
      }
      
      // Le modèle gemini-live-2.5-flash-preview gère l'audio bidirectionnel
      // Indiquer que l'IA va parler
      setIsIATalking(true);
      
      // Lecture automatique de la réponse audio si disponible
      if (result && result.response) {
        console.log('Lecture automatique de la réponse audio...');
        // Ici on pourrait ajouter la logique pour lire automatiquement l'audio
        // Le modèle devrait retourner de l'audio qui sera lu automatiquement
      }
      
      // Délai pour laisser l'IA parler
      setTimeout(() => {
        setIsIATalking(false);
        // Redémarrer l'enregistrement après la réponse de l'IA
        if (liveMode && !interviewEnded) {
          console.log('Redémarrage de l\'enregistrement après réponse IA bidirectionnelle...');
          startContinuousRecording();
        }
      }, 3000); // Délai pour laisser l'IA parler
    } catch (error) {
      console.error('Erreur traitement audio live:', error);
      setError('Erreur lors du traitement audio live.');
      setIsLiveRecording(false);
      
      // Marquer le message comme ayant une erreur
      setChat((prev) => prev.map((msg, index) => 
        index === prev.length - 1 ? { ...msg, isSending: false, sendError: true } : msg
      ));
    }
  };



  // Démarrer l'enregistrement continu en mode live avec gemini-live-2.5-flash-preview
  const startContinuousRecording = () => {
    if (!liveStream) return;

    console.log('Démarrage de l\'enregistrement continu avec gemini-live-2.5-flash-preview...');
    
    const mediaRecorder = new MediaRecorder(liveStream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      if (chunks.length > 0) {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log('Audio enregistré pour gemini-live-2.5-flash-preview, taille:', audioBlob.size);
        await processLiveAudio(audioBlob);
      }
    };

    mediaRecorder.onerror = (event) => {
      console.error('Erreur MediaRecorder:', event);
    };

    // Enregistrer par segments de 4 secondes pour le modèle bidirectionnel
    mediaRecorder.start();
    setIsLiveRecording(true);
    
    console.log('MediaRecorder démarré pour modèle bidirectionnel, état:', mediaRecorder.state);
    
    setTimeout(() => {
      if (mediaRecorder.state === 'recording') {
        console.log('Arrêt de l\'enregistrement après 4 secondes (modèle bidirectionnel)');
        mediaRecorder.stop();
        setIsLiveRecording(false);
        // Redémarrer l'enregistrement après un court délai
        setTimeout(() => {
          if (liveMode && !interviewEnded) {
            startContinuousRecording();
          }
        }, 1000); // Délai pour laisser l'IA parler
      }
    }, 4000); // Segments de 4 secondes pour le modèle bidirectionnel
  };

  if (!sessionStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">DRH IA - Entretien Live</h1>
          <p className="text-gray-700 mb-6">
            Échangez avec notre DRH IA par <strong>écrit</strong>, par <strong>note vocale</strong> ou en <strong>mode live</strong>. 
            L'entretien est basé sur l'offre d'emploi que vous avez comparée à votre CV.
          </p>
          
          {/* Options de mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Mode Questions-Réponses */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions-Réponses</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Questions automatiques générées selon l'offre. Répondez par texte ou vocal avec prévisualisation.
                </p>
                
              </div>
            </div>

            {/* Mode Discussion Live */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-colors">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Discussion Live</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Conversation naturelle avec le DRH. Réponses audio automatiques.
                </p>
                
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={startQuestionsMode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Mode Questions-Réponses
            </button>
            
            <button
              onClick={startDiscussionMode}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
            >
              <Mic className="h-5 w-5 mr-2" />
              Mode Discussion Live
            </button>
          </div>
        </div>
        {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen sm:h-[90vh] bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header professionnel fixe */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={resetSession} 
            className="flex items-center text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              DRH IA - Entretien Professionnel
            </h1>
            {mode === 'questions' && (
              <div className="flex items-center justify-center mt-1">
                <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Mode Questions-Réponses
                </div>
              </div>
            )}
            {mode === 'discussion' && (
              <div className="flex items-center justify-center mt-1">
                <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200">
                  <Mic className="h-3 w-3 mr-1" />
                  Mode Discussion Live
                </div>
              </div>
            )}
          </div>
          
          <div className="w-8 sm:w-12" />
        </div>
      </div>
      
      {/* Interface d'échange - masquée quand le rapport est affiché */}
      {!finalReport && (
        <>
          <div className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mx-4 sm:mx-6 my-4">
            {mode === 'questions' ? (
              // Interface Quiz pour le mode Questions-Réponses
              <div className="h-full flex flex-col">
                {/* Header Quiz avec compteur */}
                <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Entretien Questions-Réponses</h3>
                      <p className="text-sm text-gray-600">Répondez aux questions du DRH</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div className="text-xs text-gray-500">Question</div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question actuelle */}
                {questions.length > 0 && currentQuestionIndex < questions.length && (
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                      <div className="flex items-start mb-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                          <span className="text-white font-semibold text-sm">{currentQuestionIndex + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            Question {currentQuestionIndex + 1}
                          </h4>
                          <p className="text-gray-700 leading-relaxed">
                            {questions[currentQuestionIndex]?.question}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Zone de réponse */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Votre réponse :</h5>
                      
                      {/* Prévisualisation audio si disponible */}
                      {previewAudioUrl && (
                        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Mic className="h-5 w-5 text-blue-600 mr-2" />
                              <span className="text-sm font-medium text-gray-700">Réponse vocale enregistrée</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const audio = new Audio(previewAudioUrl);
                                  audio.play();
                                }}
                                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                              >
                                <Play className="h-4 w-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => {
                                  setPreviewAudio(null);
                                  setPreviewAudioUrl(null);
                                }}
                                className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
                              >
                                <RotateCcw className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interface de réponse */}
                      <div className="space-y-4">
                        {/* Zone de saisie texte */}
                        <div>
                          <textarea
                            value={answers[currentQuestionIndex] || ''}
                            onChange={(e) => {
                              const newAnswers = [...answers];
                              newAnswers[currentQuestionIndex] = e.target.value;
                              setAnswers(newAnswers);
                            }}
                            placeholder="Tapez votre réponse ici..."
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                          />
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex items-center gap-3">
                          <VoiceRecorder
                            onRecordingComplete={(audioBlob) => {
                              setPreviewAudio(audioBlob);
                              setPreviewAudioUrl(URL.createObjectURL(audioBlob));
                            }}
                            isRecording={isRecording}
                            onStartRecording={handleStartRecording}
                            onStopRecording={handleStopRecording}
                          />
                          
                          <button
                            onClick={handleSubmitAnswer}
                            disabled={!answers[currentQuestionIndex]?.trim() && !previewAudio}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
                          >
                            {currentQuestionIndex === questions.length - 1 ? (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2" />
                                Terminer l'entretien
                              </>
                            ) : (
                              <>
                                <ArrowRight className="h-5 w-5 mr-2" />
                                Question suivante
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* État de chargement */}
                {isLoading && (
                  <div className="flex justify-center items-center mt-6">
                    <div className="flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                      <Loader2 className="animate-spin h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-blue-700 font-medium text-sm">Traitement en cours...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Interface chat normale pour le mode Discussion
              <>
                {chat.length === 0 && !isLoading && (
                  <div className="text-center mt-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-500 font-medium">La conversation commencera ici…</p>
                    <p className="text-gray-400 text-sm mt-1">Préparez-vous pour votre entretien</p>
                  </div>
                )}
                {chat.map((msg, idx) => (
                  <div key={idx} className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
                    {/* Message texte */}
                    {!msg.audioUrl && (
                      <div className={`max-w-[85%] sm:max-w-[75%] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-sm border ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-md' 
                          : 'bg-gradient-to-br from-gray-50 to-white text-gray-900 rounded-bl-md border-gray-200'
                      }`}>
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}
                    
                    {/* Messages audio avec style adapté selon l'expéditeur */}
                    {msg.audioUrl && (
                      <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                        <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`relative ${msg.role === 'user' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-gray-50 to-white border border-gray-200'} rounded-2xl px-4 py-3 shadow-sm`}>
                            <AudioPlayer
                              audioUrl={msg.audioUrl}
                              content={msg.content}
                              isPlaying={playingAudio === `audio_${idx}`}
                              onPlay={() => {
                                const audioKey = `audio_${idx}`;
                                if (playingAudio && playingAudio !== audioKey) {
                                  // Arrêter toute autre lecture en cours
                                  if (audioRefs.current[playingAudio]) {
                                    audioRefs.current[playingAudio].pause();
                                    audioRefs.current[playingAudio].currentTime = 0;
                                    setAudioProgress(prev => ({ ...prev, [playingAudio]: 0 }));
                                  }
                                }
                                
                                // Démarrer la lecture
                                if (!audioRefs.current[audioKey]) {
                                  audioRefs.current[audioKey] = new Audio(msg.audioUrl);
                                  audioRefs.current[audioKey].onended = () => {
                                    setPlayingAudio(null);
                                    setAudioProgress(prev => ({ ...prev, [audioKey]: 0 }));
                                  };
                                  
                                  // Charger la durée
                                  audioRefs.current[audioKey].onloadedmetadata = () => {
                                    const duration = audioRefs.current[audioKey].duration;
                                    console.log('Durée audio chargée:', duration, 'pour', audioKey);
                                    if (duration && isFinite(duration) && duration > 0) {
                                      setAudioDurations(prev => ({ ...prev, [audioKey]: duration }));
                                    } else {
                                      console.warn('Durée audio invalide:', duration);
                                      setAudioDurations(prev => ({ ...prev, [audioKey]: 0 }));
                                    }
                                  };
                                  
                                  // Suivre la progression
                                  audioRefs.current[audioKey].ontimeupdate = () => {
                                    const audio = audioRefs.current[audioKey];
                                    if (audio && audio.duration && isFinite(audio.duration) && audio.duration > 0) {
                                      const progress = (audio.currentTime / audio.duration) * 100;
                                      setAudioProgress(prev => ({ ...prev, [audioKey]: progress }));
                                    }
                                  };
                                }
                                
                                audioRefs.current[audioKey].play();
                                setPlayingAudio(audioKey);
                              }}
                              onPause={() => {
                                const audioKey = `audio_${idx}`;
                                if (audioRefs.current[audioKey]) {
                                  audioRefs.current[audioKey].pause();
                                  audioRefs.current[audioKey].currentTime = 0;
                                }
                                setPlayingAudio(null);
                                setAudioProgress(prev => ({ ...prev, [audioKey]: 0 }));
                              }}
                              onRetry={msg.sendError ? () => {
                                // Retry logic
                                if (msg.audioBlob) {
                                  sendMessage("", msg.audioBlob);
                                }
                              } : undefined}
                              isSending={msg.isSending}
                              sendError={msg.sendError}
                              duration={audioDurations[`audio_${idx}`] || 0}
                              currentTime={(() => {
                                const audioKey = `audio_${idx}`;
                                const audio = audioRefs.current[audioKey];
                                if (audio && audio.currentTime && isFinite(audio.currentTime)) {
                                  return audio.currentTime;
                                }
                                return 0;
                              })()}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-center items-center mt-6">
                    <div className="flex items-center px-4 py-2 bg-orange-50 rounded-full border border-orange-200">
                      <Loader2 className="animate-spin h-4 w-4 mr-2 text-orange-600" />
                      <span className="text-orange-700 font-medium text-sm">L'IA réfléchit…</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatBottomRef} />
          </div>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mx-4 sm:mx-6 mb-4">
            {mode === 'questions' ? (
              // Interface pour le mode Questions-Réponses - pas de zone de saisie en bas
              <div className="text-center">
                <span className="text-sm text-gray-600 font-medium">
                  Utilisez la zone de réponse ci-dessus pour répondre aux questions
                </span>
              </div>
            ) : liveMode ? (
              // Interface mode live
              <div className="flex items-center gap-4">
                <button
                  onClick={stopLiveMode}
                  className="flex-shrink-0 p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full transition-all duration-200 shadow-md"
                  aria-label="Arrêter le mode live"
                >
                  <MicOff className="h-5 w-5" />
                </button>
                
                <div className="flex-1">
                  {isIATalking ? (
                    <div className="flex items-center justify-center text-orange-600">
                      <div className="flex items-center px-4 py-2 bg-orange-50 rounded-full border border-orange-200">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">L'IA parle en premier...</span>
                      </div>
                    </div>
                  ) : isLiveRecording ? (
                    <div className="flex items-center justify-center text-blue-600">
                      <div className="flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Traitement live...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-sm text-gray-600 font-medium">
                        Mode Discussion Live actif - Parlez naturellement
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Interface mode Discussion classique
              <div className="flex items-center gap-3">
                <VoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isRecording={isRecording}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                />
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="Tapez votre réponse..."
                    disabled={isLoading || interviewEnded}
                  />
                  {isProcessingAudio && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
                      <div className="flex items-center text-orange-600 text-sm">
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Traitement audio...
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleSend}
                  className="flex-shrink-0 p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || !input.trim() || interviewEnded}
                  aria-label="Envoyer"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          {interviewEnded && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl text-center">
              {isGeneratingReport ? (
                <div className="flex items-center justify-center text-blue-800">
                  <div className="flex items-center px-4 py-2 bg-white rounded-full border border-blue-200">
                    <Loader2 className="animate-spin h-5 w-5 mr-3" />
                    <p className="font-medium">Génération du rapport d'entretien en cours...</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-blue-800">
                  <div className="flex items-center px-4 py-2 bg-white rounded-full border border-blue-200">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-600" />
                    <p className="font-medium">L'entretien est terminé. Rapport généré avec succès !</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Affichage du rapport final */}
      {finalReport && !isGeneratingReport && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rapport d'Entretien</h3>
            <p className="text-gray-600">Analyse détaillée de votre performance</p>
          </div>
          
          {/* Score Global */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Score Global</h4>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{finalReport.globalScore}/10</span>
                  </div>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-blue-500"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + (finalReport.globalScore * 36)}% 0%, ${50 + (finalReport.globalScore * 36)}% 100%, 50% 100%)`
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {finalReport.globalScore >= 8 ? 'Excellent ! Vous êtes très bien préparé(e).' :
                 finalReport.globalScore >= 6 ? 'Bon travail, quelques améliorations possibles.' :
                 finalReport.globalScore >= 4 ? 'Correct, des efforts supplémentaires sont nécessaires.' :
                 'À retravailler pour optimiser vos chances.'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Points Forts */}
            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h4 className="text-lg font-semibold text-green-900">Points Forts</h4>
              </div>
              <ul className="space-y-3">
                {finalReport.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-green-800 text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Points Faibles */}
            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
                <h4 className="text-lg font-semibold text-orange-900">Points d'Amélioration</h4>
              </div>
              <ul className="space-y-3">
                {finalReport.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-orange-800 text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Suggestions d'Amélioration */}
          <div className="mt-6 bg-blue-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <h4 className="text-lg font-semibold text-blue-900">Suggestions d'Amélioration</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalReport.improvements.map((improvement, index) => (
                <div key={index} className="flex items-start bg-white rounded-lg p-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-blue-800 text-sm">{improvement}</span>
                </div>
              ))}
            </div>
          </div>
          

          
          {/* Recommandation Finale */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommandation Finale</h4>
            <p className="text-gray-700 leading-relaxed">{finalReport.recommendation}</p>
          </div>
          
          {/* Prochaines Étapes */}
          {finalReport.nextSteps && finalReport.nextSteps.length > 0 && (
            <div className="mt-6 bg-green-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-green-900 mb-3">Prochaines Étapes</h4>
              <ul className="space-y-2">
                {finalReport.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-green-800 text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Bouton pour recommencer */}
          <div className="mt-6 text-center">
            <button
              onClick={resetSession}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Recommencer un entretien
            </button>
          </div>
        </div>
      )}
      
      {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}
    </div>
  );
};

export default InterviewSimulation;