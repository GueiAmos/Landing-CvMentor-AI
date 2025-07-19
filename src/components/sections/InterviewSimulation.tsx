import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, Play, Pause, RotateCcw, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { saveSession, getSession } from '../../utils/storage';
import { InterviewQuestion, InterviewFeedback } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import ProgressBar from '../ui/ProgressBar';
import ScoreGauge from '../ui/ScoreGauge';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const InterviewSimulation: React.FC = () => {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<'junior' | 'intermediate' | 'senior'>('intermediate');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const session = getSession();
    if (session.interviewResults) {
      setQuestions(session.interviewResults.questions);
      setAnswers(session.interviewResults.answers);
      setFeedback(session.interviewResults.feedback);
      setIsComplete(true);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRecording) {
      handleStopRecording();
    }
    return () => clearInterval(interval);
  }, [isRecording, timeLeft]);

  const startInterview = async () => {
    const session = getSession();
    if (!session.jobOffer) {
      setError('Veuillez d\'abord effectuer une comparaison CV-Offre.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const generatedQuestions = await aiService.generateInterviewQuestions(
        session.jobOffer,
        difficulty
      );
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setFeedback([]);
      setIsComplete(false);
      setTimeLeft(generatedQuestions[0]?.timeLimit || 180);
    } catch (err) {
      setError('Erreur lors de la génération des questions. Veuillez réessayer.');
      console.error('Interview Generation Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setCurrentAnswer('');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleNextQuestion = async () => {
    if (!currentAnswer.trim()) {
      setError('Veuillez fournir une réponse avant de continuer.');
      return;
    }

    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);

    // Évaluer la réponse
    setIsLoading(true);
    try {
      const questionFeedback = await aiService.evaluateInterviewAnswer(
        questions[currentQuestionIndex],
        currentAnswer
      );
      const newFeedback = [...feedback, questionFeedback];
      setFeedback(newFeedback);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
        setTimeLeft(questions[currentQuestionIndex + 1]?.timeLimit || 180);
      } else {
        // Entretien terminé
        const globalScore = newFeedback.reduce((sum, f) => sum + f.score, 0) / newFeedback.length;
        
        saveSession({
          interviewResults: {
            questions,
            answers: newAnswers,
            feedback: newFeedback,
            globalScore
          }
        });
        
        setIsComplete(true);
      }
    } catch (err) {
      setError('Erreur lors de l\'évaluation. Veuillez réessayer.');
      console.error('Answer Evaluation Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer('');
    setFeedback([]);
    setIsComplete(false);
    setIsRecording(false);
    setTimeLeft(0);
    setError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'green';
    if (score >= 3) return 'orange';
    return 'red';
  };

  if (isComplete && feedback.length > 0) {
    const globalScore = feedback.reduce((sum, f) => sum + f.score, 0) / feedback.length;
    
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Résultats de l'Entretien</h1>
          <button
            onClick={resetInterview}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Nouvel entretien
          </button>
        </div>

        {/* Score Global */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Globale</h2>
            <ScoreGauge score={globalScore} maxScore={5} size="lg" />
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {globalScore >= 4 ? 'Excellente performance ! Vous êtes bien préparé(e) pour ce type d\'entretien.' :
               globalScore >= 3 ? 'Bonne performance avec quelques points à améliorer.' :
               globalScore >= 2 ? 'Performance correcte, mais des améliorations sont nécessaires.' :
               'Performance à améliorer. Continuez à vous entraîner.'}
            </p>
          </div>
        </div>

        {/* Détail par Question */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Question {index + 1} - {question.type}
                  </h3>
                  <p className="text-gray-700 mb-4">{question.question}</p>
                </div>
                <div className="ml-4">
                  <ScoreGauge 
                    score={feedback[index]?.score || 0} 
                    maxScore={5} 
                    size="sm" 
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Votre réponse :</h4>
                <p className="text-gray-700">{answers[index]}</p>
              </div>

              {feedback[index] && (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MessageCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">Feedback :</h4>
                      <MarkdownRenderer content={feedback[index].feedback} className="text-gray-700" />
                    </div>
                  </div>

                  {feedback[index].improvements.length > 0 && (
                    <div className="flex items-start">
                      <Star className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">Suggestions d'amélioration :</h4>
                        <ul className="text-gray-700 list-disc list-inside">
                          {feedback[index].improvements.map((improvement, i) => (
                            <li key={i}>
                              <MarkdownRenderer content={improvement} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Conseils Généraux */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">Conseils pour vos prochains entretiens</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Points forts à maintenir :</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Structurez vos réponses (situation, action, résultat)</li>
                <li>• Donnez des exemples concrets et quantifiés</li>
                <li>• Montrez votre motivation et votre passion</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Axes d'amélioration :</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Préparez des anecdotes professionnelles variées</li>
                <li>• Travaillez votre présentation personnelle</li>
                <li>• Renseignez-vous davantage sur l'entreprise</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length > 0 && !isComplete) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Question {currentQuestionIndex + 1} sur {questions.length}
              </h2>
              <span className="text-sm text-gray-500">{currentQuestion.type}</span>
            </div>
            <ProgressBar progress={progress} color="blue" />
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                {currentQuestion.question}
              </h3>
              <div className="flex items-center text-blue-700">
                <Clock className="h-4 w-4 mr-2" />
                <span>Temps recommandé : {Math.floor(currentQuestion.timeLimit / 60)} minutes</span>
              </div>
            </div>

            {/* Timer */}
            <div className="flex justify-center mb-6">
              <div className={`text-4xl font-bold ${timeLeft <= 30 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Answer Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre réponse :
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={8}
                placeholder="Tapez votre réponse ici... Structurez votre réponse avec des exemples concrets."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Commencer
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </button>
                )}
              </div>

              <button
                onClick={handleNextQuestion}
                disabled={!currentAnswer.trim() || isLoading}
                className="flex items-center px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Évaluation...
                  </>
                ) : currentQuestionIndex < questions.length - 1 ? (
                  'Question suivante'
                ) : (
                  'Terminer l\'entretien'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Simulation d'Entretien</h1>
        <p className="text-xl text-gray-600">
          Préparez-vous avec un entretien personnalisé basé sur votre profil
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <LoadingSpinner 
            size="lg" 
            text="Génération de vos questions d'entretien personnalisées..." 
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Configuration */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuration</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Niveau d'expérience :
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'junior', label: 'Junior', desc: '0-2 ans d\'expérience' },
                  { value: 'intermediate', label: 'Intermédiaire', desc: '2-5 ans d\'expérience' },
                  { value: 'senior', label: 'Senior', desc: '5+ ans d\'expérience' }
                ].map((level) => (
                  <label
                    key={level.value}
                    className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      difficulty === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={level.value}
                      checked={difficulty === level.value}
                      onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-gray-900">{level.label}</span>
                    <span className="text-sm text-gray-600">{level.desc}</span>
                    {difficulty === level.value && (
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-2 self-end" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startInterview}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Commencer l'entretien
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Déroulement de l'entretien :</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                8 questions personnalisées selon votre profil
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Questions générales, comportementales et techniques
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Temps recommandé pour chaque réponse
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Feedback détaillé et conseils d'amélioration
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Score global de performance
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSimulation;