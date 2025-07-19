import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Mic, Send, Loader2, ArrowLeft, MicOff, Volume2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { getSession } from '../../utils/storage';
import LoadingSpinner from '../ui/LoadingSpinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface ChatMessage {
  role: 'user' | 'ia';
  content: string;
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      onStartRecording();
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
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

interface InterviewReport {
  globalScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  trainingResources: Array<{
    title: string;
    type: string;
    description: string;
    priority: string;
  }>;
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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Démarrage de la session
  const startSession = async () => {
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
      const intro = await aiService.generateInterviewIntro(session.jobOffer);
      setChat([{ role: 'ia', content: intro }]);
    } catch (e) {
      setError('Erreur lors du démarrage de la simulation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Envoi d'un message utilisateur
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    setChat((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsLoading(true);
    setError('');
    
    const newQuestionCount = questionCount + 1;
    setQuestionCount(newQuestionCount);
    
    try {
      const session = getSession();
      const jobOffer = session.jobOffer;
      // Construit l'historique pour Gemini
      const history = chat.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: message });
      
      const result = await aiService.interviewChatWithGemini(history, jobOffer, newQuestionCount);
      
      setChat((prev) => [...prev, { role: 'ia', content: result.response }]);
      
      if (result.shouldEnd) {
        setInterviewEnded(true);
        if (result.finalReport) {
          setFinalReport(result.finalReport);
        }
      }
    } catch (e) {
      setError('Erreur lors de la réponse IA.');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'envoi (entrée ou bouton)
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
  };

  // Transcription audio vers texte (simulation)
  const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    // Simulation de transcription - dans un vrai projet, utiliser une API de transcription
    setIsTranscribing(true);
    
    // Simuler un délai de transcription
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsTranscribing(false);
    
    // Retourner un texte simulé basé sur la taille du blob
    const responses = [
      "Bonjour, je suis très motivé pour ce poste et j'aimerais vous expliquer pourquoi je serais un bon candidat.",
      "J'ai une expérience de trois ans dans ce domaine et je pense pouvoir apporter beaucoup à votre équipe.",
      "Pouvez-vous me parler davantage des responsabilités de ce poste ?",
      "Je suis passionné par ce secteur et j'ai développé des compétences qui correspondent à vos besoins.",
      "Comment voyez-vous l'évolution de ce poste dans les prochaines années ?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Gestion de l'enregistrement vocal
  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      const transcribedText = await transcribeAudio(audioBlob);
      setInput(transcribedText);
      // Optionnel : envoyer automatiquement après transcription
      // sendMessage(transcribedText);
    } catch (error) {
      console.error('Erreur lors de la transcription:', error);
      setError('Erreur lors de la transcription audio.');
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setError('');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  // Annulation/reinitialisation
  const resetSession = () => {
    setSessionStarted(false);
    setChat([]);
    setInput('');
    setError('');
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
            Échangez avec notre DRH IA par <strong>écrit</strong> ou par <strong>note vocale</strong>. 
            L'entretien est basé sur l'offre d'emploi que vous avez comparée à votre CV.
          </p>
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Fonctionnalités disponibles :</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 text-blue-600 mr-2" />
                <span>Réponses écrites</span>
              </div>
              <div className="flex items-center">
                <Mic className="h-4 w-4 text-blue-600 mr-2" />
                <span>Notes vocales</span>
              </div>
              <div className="flex items-center">
                <Volume2 className="h-4 w-4 text-blue-600 mr-2" />
                <span>Transcription automatique</span>
              </div>
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 text-blue-600 mr-2" />
                <span>Rapport détaillé</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={startSession}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Commencer l'entretien avec le DRH IA
        </button>
        {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-8 flex flex-col h-[80vh]">
      <div className="flex items-center mb-4">
        <button onClick={resetSession} className="text-blue-600 hover:text-blue-800 flex items-center font-semibold text-sm">
          <ArrowLeft className="h-5 w-5 mr-1" /> Retour
        </button>
        <h2 className="flex-1 text-center text-lg font-bold text-gray-900">DRH IA - Entretien Live</h2>
        <div className="w-8" />
      </div>
      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow p-4 mb-4">
        {chat.length === 0 && !isLoading && (
          <div className="text-gray-400 text-center mt-12">La conversation commencera ici…</div>
        )}
        {chat.map((msg, idx) => (
          <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
              <MarkdownRenderer content={msg.content} />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center items-center mt-4 text-blue-600"><Loader2 className="animate-spin mr-2" /> L'IA réfléchit…</div>
        )}
        {isTranscribing && (
          <div className="flex justify-center items-center mt-4 text-orange-600">
            <Loader2 className="animate-spin mr-2" /> Transcription en cours...
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder={isRecording ? "🎤 Enregistrement en cours..." : isTranscribing ? "Transcription..." : "Votre réponse ou utilisez le micro..."}
          disabled={isLoading || interviewEnded || isRecording || isTranscribing}
        />
        <button
          onClick={handleSend}
          className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full ml-1"
          disabled={isLoading || !input.trim() || interviewEnded || isRecording || isTranscribing}
          aria-label="Envoyer"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      {interviewEnded && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800 font-medium">L'entretien avec le DRH IA est terminé. Génération du rapport en cours...</p>
        </div>
      )}
      {(isRecording || isTranscribing) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
          <p className="text-orange-800 font-medium">
            {isRecording ? "🎤 Enregistrement en cours... Cliquez sur le micro pour arrêter" : "🔄 Transcription de votre message vocal..."}
          </p>
        </div>
      )}
      {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}
    </div>
  );
};

export default InterviewSimulation;