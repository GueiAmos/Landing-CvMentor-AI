import React, { useState } from 'react';
import { FileText, Copy, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { saveSession, getSession } from '../../utils/storage';
import { CoverLetter as CoverLetterType } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const CoverLetter: React.FC = () => {
  const [tone, setTone] = useState<'formal' | 'dynamic' | 'creative'>('formal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<CoverLetterType | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const session = getSession();
    if (session.coverLetter) {
      setCoverLetter(session.coverLetter);
      setTone(session.coverLetter.tone);
    }
    // Annuler tout état "en cours" si on revient sur la page
    setIsGenerating(false);
    setError('');
    // Optionnel : effacer les résultats partiels si on veut forcer une nouvelle génération
    // setCoverLetter(null);
  }, []);

  const generateCoverLetter = async () => {
    const session = getSession();
    
    if (!session.cvText) {
      setError('Veuillez d\'abord analyser votre CV.');
      return;
    }

    if (!session.jobOffer) {
      setError('Veuillez d\'abord effectuer une comparaison CV-Offre.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const letter = await aiService.generateCoverLetter(
        session.cvText,
        session.jobOffer,
        tone
      );
      setCoverLetter(letter);
      saveSession({ coverLetter: letter });
    } catch (err) {
      setError('Erreur lors de la génération. Veuillez réessayer.');
      console.error('Cover Letter Generation Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!coverLetter) return;

    try {
      await navigator.clipboard.writeText(coverLetter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const downloadPDF = () => {
    if (!coverLetter) return;

    // Simulation du téléchargement PDF
    const element = document.createElement('a');
    const file = new Blob([coverLetter.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'lettre_motivation.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toneDescriptions = {
    formal: {
      title: 'Formel',
      description: 'Style classique et professionnel, adapté aux secteurs traditionnels',
      icon: '👔'
    },
    dynamic: {
      title: 'Dynamique',
      description: 'Ton moderne et énergique, parfait pour les startups et entreprises innovantes',
      icon: '⚡'
    },
    creative: {
      title: 'Créatif',
      description: 'Style original et personnalisé, idéal pour les métiers créatifs',
      icon: '🎨'
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Génération de Lettre de Motivation</h1>
        <p className="text-xl text-gray-600">
          Créez une lettre personnalisée basée sur votre CV et l'offre d'emploi
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configuration</h2>

          {/* Tone Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Choisissez le ton :</h3>
            <div className="space-y-4">
              {Object.entries(toneDescriptions).map(([key, desc]) => (
                <label
                  key={key}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    tone === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={key}
                    checked={tone === key}
                    onChange={(e) => setTone(e.target.value as typeof tone)}
                    className="sr-only"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <span className="text-2xl mr-2">{desc.icon}</span>
                      <span className="font-semibold text-gray-900">{desc.title}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{desc.description}</p>
                  </div>
                  {tone === key && (
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-1" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Generation Button */}
          <button
            onClick={generateCoverLetter}
            disabled={isGenerating}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Générer la lettre
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Prerequisites */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Prérequis :</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Analyse de CV complétée
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Comparaison CV-Offre effectuée
              </li>
            </ul>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Aperçu</h2>
            {coverLetter && (
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </button>
              </div>
            )}
          </div>

          {isGenerating ? (
            <LoadingSpinner size="lg" text="Génération de votre lettre personnalisée..." />
          ) : coverLetter ? (
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  <MarkdownRenderer content={coverLetter.content} />
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Ton utilisé :</strong> {toneDescriptions[coverLetter.tone].title}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Votre lettre de motivation apparaîtra ici</p>
              <p className="text-sm">Cliquez sur "Générer la lettre" pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Conseils pour personnaliser davantage</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Ajoutez votre touche personnelle :</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Mentionnez des projets spécifiques pertinents</li>
              <li>• Ajoutez des éléments sur la culture d'entreprise</li>
              <li>• Personnalisez l'accroche selon l'interlocuteur</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Vérifiez avant d'envoyer :</h4>
            <ul className="text-gray-700 text-sm space-y-1">
              <li>• Orthographe et grammaire</li>
              <li>• Cohérence avec votre CV</li>
              <li>• Adaptation au secteur d'activité</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetter;