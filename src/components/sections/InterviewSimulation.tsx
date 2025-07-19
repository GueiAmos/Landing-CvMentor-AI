import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Mic, Send, Loader2, ArrowLeft } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { getSession } from '../../utils/storage';
import LoadingSpinner from '../ui/LoadingSpinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface ChatMessage {
  role: 'user' | 'ia';
  content: string;
}

const InterviewSimulation: React.FC = () => {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
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
    try {
      const session = getSession();
      const jobOffer = session.jobOffer;
      // Construit l'historique pour Gemini
      const history = chat.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: message });
      const iaReply = await aiService.interviewChatWithGemini(history, jobOffer);
      setChat((prev) => [...prev, { role: 'ia', content: iaReply }]);
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

  // Gestion du micro (à brancher sur Gemini audio dialog plus tard)
  const handleMic = () => {
    alert('Fonctionnalité audio à venir (Gemini audio dialog)');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Simulation d'Entretien (Live DRH)</h1>
        <p className="text-gray-700 text-center mb-8">Préparez-vous à un entretien interactif avec une IA DRH, basée sur l'offre d'emploi que vous avez comparée à votre CV.</p>
        <button
          onClick={startSession}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Commencer la simulation
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
        <h2 className="flex-1 text-center text-lg font-bold text-gray-900">Entretien interactif</h2>
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
        <div ref={chatBottomRef} />
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={handleMic}
          className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-600"
          aria-label="Répondre par la voix"
        >
          <Mic className="h-5 w-5" />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Votre réponse…"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full ml-1"
          disabled={isLoading || !input.trim()}
          aria-label="Envoyer"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}
    </div>
  );
};

export default InterviewSimulation;