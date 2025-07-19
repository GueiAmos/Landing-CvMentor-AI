import React, { useState } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle, TrendingUp, X } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { saveSession, getSession } from '../../utils/storage';
import { convertPDFToBase64, validatePDFFile } from '../../utils/pdfReader';
import { CVAnalysis } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import CVPreview from '../ui/CVPreview.tsx';
import ScoreGauge from '../ui/ScoreGauge';
import ProgressBar from '../ui/ProgressBar';

const CVAnalysisComponent: React.FC = () => {
  const [cvText, setCvText] = useState('');
  const [analysis, setAnalysis] = useState<CVAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isConvertingPDF, setIsConvertingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  React.useEffect(() => {
    const session = getSession();
    if (session.cvText) {
      setCvText(session.cvText);
    }
    if (session.cvAnalysis) {
      setAnalysis(session.cvAnalysis);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validatePDFFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Fichier invalide');
      return;
    }

    setIsConvertingPDF(true);
    setError('');
    setUploadedFile(file);

    try {
      // Convertir le PDF en base64 pour Gemini
      const pdfBase64 = await convertPDFToBase64(file);
      
      // Analyser directement avec Gemini
      const result = await aiService.analyzePDFCV(pdfBase64);
      setAnalysis(result);
      
      // Sauvegarder l'analyse et marquer qu'un PDF a été analysé
      saveSession({ 
        cvAnalysis: result, 
        cvText: `[PDF analysé: ${file.name}]` 
      });
      setCvText(`[PDF analysé: ${file.name}]`);
    } catch (err) {
      setError('Erreur lors de l\'analyse du PDF. Veuillez réessayer.');
      console.error('PDF analysis error:', err);
    } finally {
      setIsConvertingPDF(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setCvText('');
    setError('');
    // Reset file input
    const fileInput = document.getElementById('cv-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const analyzeCV = async () => {
    if (!cvText.trim()) {
      setError('Veuillez télécharger un CV ou saisir le contenu.');
      return;
    }

    if (cvText.length < 100) {
      setError('Le contenu du CV doit contenir au moins 100 caractères.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await aiService.analyzeCV(cvText);
      setAnalysis(result);
      saveSession({ cvAnalysis: result, cvText });
    } catch (err) {
      setError('Erreur lors de l\'analyse. Veuillez réessayer.');
      console.error('CV Analysis Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setError('');
  };

  if (analysis) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analyse de votre CV</h1>
          <button
            onClick={resetAnalysis}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Nouvelle analyse
          </button>
        </div>

        {/* Score Global */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Global</h2>
            <ScoreGauge score={analysis.globalScore} maxScore={10} size="lg" />
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {analysis.globalScore >= 8 ? 'Excellent CV ! Votre profil est très bien présenté.' :
               analysis.globalScore >= 6 ? 'Bon CV avec quelques améliorations possibles.' :
               analysis.globalScore >= 4 ? 'CV correct mais des améliorations sont nécessaires.' :
               'CV à retravailler pour optimiser vos chances.'}
            </p>
          </div>
        </div>

        {/* Scores Détaillés */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clarté</h3>
            <ProgressBar 
              progress={(analysis.detailedScores.clarity / 10) * 100}
              label={`${analysis.detailedScores.clarity}/10`}
              color="blue"
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact</h3>
            <ProgressBar 
              progress={(analysis.detailedScores.impact / 10) * 100}
              label={`${analysis.detailedScores.impact}/10`}
              color="orange"
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Structure</h3>
            <ProgressBar 
              progress={(analysis.detailedScores.structure / 10) * 100}
              label={`${analysis.detailedScores.structure}/10`}
              color="green"
            />
          </div>
        </div>

        {/* Points Forts et Améliorations */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-green-50 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold text-green-900">Points Forts</h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="ml-auto text-blue-600 hover:text-blue-700 text-sm"
              >
                {showPreview ? 'Masquer' : 'Voir'} le CV
              </button>
            </div>
            {showPreview && (
              <div className="mb-4">
                <CVPreview cvText={cvText} uploadedFile={uploadedFile} />
              </div>
            )}
            <ul className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <MarkdownRenderer content={strength} className="text-green-800" />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-xl font-semibold text-orange-900">Améliorations</h3>
            </div>
            <ul className="space-y-3">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <MarkdownRenderer content={improvement} className="text-orange-800" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mots-clés Manquants */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Mots-clés Recommandés</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-gray-600 text-sm mt-3">
            Intégrez ces mots-clés dans votre CV pour améliorer sa visibilité auprès des recruteurs.
          </p>
        </div>

        {/* Recommandations de Format */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommandations de Format</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.formatRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start bg-gray-50 rounded-lg p-4">
                <FileText className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                <MarkdownRenderer content={recommendation} className="text-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analyse de CV Intelligente</h1>
        <p className="text-xl text-gray-600">
          Téléchargez votre CV et obtenez une analyse détaillée avec des conseils personnalisés
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <LoadingSpinner 
            size="lg" 
            text="Analyse de votre CV en cours... Notre IA examine votre profil en détail." 
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Téléchargement du CV</h2>
            
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Téléchargez votre CV (PDF)
                </h3>
                <p className="text-gray-600 mb-4">
                  Glissez-déposez votre fichier ou cliquez pour sélectionner
                </p>
                <input
                  id="cv-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="cv-file"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors inline-block"
                >
                  Choisir un fichier
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Format PDF uniquement, taille max: 5MB
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-blue-900">{uploadedFile.name}</h3>
                      <p className="text-sm text-blue-700">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {isConvertingPDF && (
                  <div className="mt-4">
                    <LoadingSpinner size="sm" text="Analyse du PDF en cours..." />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text Preview */}
          {cvText && !cvText.startsWith('[PDF analysé:') && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Aperçu du contenu extrait</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showPreview ? 'Masquer' : 'Voir'} le CV complet
                </button>
              </div>
              {showPreview ? (
                <CVPreview cvText={cvText} uploadedFile={uploadedFile} />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {cvText.substring(0, 300)}
                    {cvText.length > 300 && '...'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {cvText.length} caractères extraits
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manual Input Option */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ou saisissez votre CV manuellement
            </h3>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Copiez et collez le contenu de votre CV ici..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={analyzeCV}
            disabled={(!cvText.trim() || isConvertingPDF) && !analysis}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            {analysis ? 'CV déjà analysé' : 'Analyser mon CV'}
          </button>

          {/* Info Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Cette analyse vous fournira :</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Un score global de qualité de votre CV
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Une évaluation détaillée (clarté, impact, structure)
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Vos points forts et axes d'amélioration
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Des mots-clés recommandés pour votre secteur
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                Des conseils de mise en forme professionnelle
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVAnalysisComponent;