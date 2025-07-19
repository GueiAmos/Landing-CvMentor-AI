import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Mic, Send, Loader2, ArrowLeft, MicOff, Volume2, Brain, Play, Pause } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { getSession } from '../../utils/storage';
import LoadingSpinner from '../ui/LoadingSpinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface ChatMessage {
  role: 'user' | 'ia';
  content: string;
  audioBlob?: Blob;
  audioUrl?: string;
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
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

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
  const sendMessage = async (message: string, audioBlob?: Blob) => {
    if (!message.trim() && !audioBlob) return;
    
    // Créer une URL pour l'audio si présent
    let audioUrl: string | undefined;
    if (audioBlob) {
      audioUrl = URL.createObjectURL(audioBlob);
    }
    
    // Ajouter le message à l'historique (texte ou indication audio)
    const displayMessage = audioBlob ? "🎤 Message vocal envoyé" : message;
    const messageId = `user_${Date.now()}`;
    setChat((prev) => [...prev, { 
      role: 'user', 
      content: displayMessage,
      audioBlob,
      audioUrl
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
      
      const result = await aiService.interviewChatWithGemini(history, jobOffer, newQuestionCount, audioBlob);
      
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

  // Gestion de l'enregistrement vocal
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessingAudio(true);
    try {
      // Envoyer directement l'audio à Gemini
      await sendMessage("", audioBlob);
    } catch (error) {
      console.error('Erreur lors du traitement audio:', error);
      setError('Erreur lors du traitement du message vocal.');
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
    } else {
      // Arrêter toute autre lecture en cours
      if (playingAudio && audioRefs.current[playingAudio]) {
        audioRefs.current[playingAudio].pause();
        audioRefs.current[playingAudio].currentTime = 0;
      }
      
      // Démarrer la nouvelle lecture
      if (!audioRefs.current[audioKey]) {
        audioRefs.current[audioKey] = new Audio(audioUrl);
        audioRefs.current[audioKey].onended = () => setPlayingAudio(null);
      }
      
      audioRefs.current[audioKey].play();
      setPlayingAudio(audioKey);
    }
  };

  // Nettoyage des URLs d'objets lors du démontage
  useEffect(() => {
    return () => {
      chat.forEach((msg) => {
        if (msg.audioUrl) {
          URL.revokeObjectURL(msg.audioUrl);
        }
      });
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
      });
    };
  }, []);

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
            L'entretien est basé sur l\'offre d\'emploi que vous avez comparée à votre CV.
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
                <span>Messages vocaux directs</span>
              </div>
              <div className="flex items-center">
                <Brain className="h-4 w-4 text-blue-600 mr-2" />
                <span>Traitement IA de l'audio</span>
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
              {msg.audioUrl && (
                <div className="mt-2 flex items-center">
                  <button
                    onClick={() => toggleAudioPlayback(idx, msg.audioUrl!)}
                    className={`flex items-center px-2 py-1 rounded text-xs ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 hover:bg-blue-400 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {playingAudio === `audio_${idx}` ? (
                      <Pause className="h-3 w-3 mr-1" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    {playingAudio === `audio_${idx}` ? 'Pause' : 'Écouter'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-center items-center mt-4 text-blue-600"><Loader2 className="animate-spin mr-2" /> L'IA réfléchit…</div>
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
        {isProcessingAudio && (
          <div className="flex items-center text-blue-600 text-sm">
            <Loader2 className="animate-spin h-4 w-4 mr-1" />
            Traitement audio...
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Votre réponse…"
          disabled={isLoading || interviewEnded}
        />
        <button
          onClick={handleSend}
          className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full ml-1"
          disabled={isLoading || !input.trim() || interviewEnded}
          aria-label="Envoyer"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      {interviewEnded && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800 font-medium">L'entretien est terminé. Génération du rapport en cours...</p>
        </div>
      )}
      {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}
    </div>
  );
};

export default InterviewSimulation;