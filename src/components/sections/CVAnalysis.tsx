import React, { useState, useEffect } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle, TrendingUp, X, Eye } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { saveSession, getSession } from '../../utils/storage';
import { convertPDFToBase64, validatePDFFile } from '../../utils/pdfReader';
import { CVAnalysis, UploadedFile } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import CVPreview from '../ui/CVPreview.tsx';
import PDFViewer from '../ui/PDFViewer';
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

  useEffect(() => {
    const session = getSession();
    if (session.cvText) {
      setCvText(session.cvText);
    }
    if (session.cvAnalysis) {
      setAnalysis(session.cvAnalysis);
    }
    // Restaurer le fichier PDF si disponible
    if (session.uploadedFile) {
      try {
        // Convertir les données base64 en File object
        const byteCharacters = atob(session.uploadedFile.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const restoredFile = new File([byteArray], session.uploadedFile.name, {
          type: session.uploadedFile.type
        });
        setUploadedFile(restoredFile);
      } catch (error) {
        console.error('Erreur lors de la restauration du fichier PDF:', error);
      }
    }
    // Annuler tout état "en cours" si on revient sur la page
    setIsLoading(false);
    setIsConvertingPDF(false);
    setError('');
    // Optionnel : effacer les résultats partiels si on veut forcer une nouvelle analyse
    // setAnalysis(null);
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
      
      // Sauvegarder le fichier PDF en base64 pour la session
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const base64Data = (fileReader.result as string).split(',')[1]; // Enlever le préfixe data:application/pdf;base64,
        
        // Sauvegarder le fichier dans la session
        const uploadedFileData: UploadedFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data
        };
        
        // Sauvegarder l'analyse et le fichier, et réinitialiser les autres sections
        saveSession({ 
          cvAnalysis: result, 
          cvText: `[PDF analysé: ${file.name}]`,
          uploadedFile: uploadedFileData,
          jobOffer: undefined,
          cvJobMatch: undefined,
          interviewResults: undefined,
          skillGaps: undefined,
          coverLetter: undefined
        });
      };
      
      fileReader.readAsDataURL(file);
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
    // Nettoyer la session
    saveSession({ uploadedFile: undefined });
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setError('');
    setUploadedFile(null);
    setCvText('');
    // Nettoyer complètement la session
    saveSession({ 
      cvAnalysis: undefined, 
      cvText: undefined, 
      uploadedFile: undefined 
    });
  };

  if (analysis) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analyse de votre CV</h1>
          <button
            onClick={resetAnalysis}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
          >
            Nouvelle analyse
          </button>
        </div>

        {/* Score Global */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Score Global</h2>
            <ScoreGauge score={analysis.globalScore} maxScore={10} size="lg" />
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
              {analysis.globalScore >= 8 ? 'Excellent CV ! Votre profil est très bien présenté.' :
               analysis.globalScore >= 6 ? 'Bon CV avec quelques améliorations possibles.' :
               analysis.globalScore >= 4 ? 'CV correct mais des améliorations sont nécessaires.' :
               'CV à retravailler pour optimiser vos chances.'}
            </p>
            
            {/* Bouton pour voir le CV */}
            <div className="mt-4 sm:mt-6">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                {showPreview ? 'Masquer le CV' : 'Voir le CV analysé'}
              </button>
            </div>
          </div>
        </div>

        {/* Prévisualisation du CV */}
        {showPreview && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Votre CV analysé</h3>
            {uploadedFile && uploadedFile.type === 'application/pdf' ? (
              <PDFViewer file={uploadedFile} />
            ) : (
              <CVPreview cvText={cvText} uploadedFile={uploadedFile} />
            )}
          </div>
        )}

        {/* Scores Détaillés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Clarté</h3>
            <ProgressBar 
              progress={(analysis.detailedScores.clarity / 10) * 100}
              label={`${analysis.detailedScores.clarity}/10`}
              color="blue"
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Impact</h3>
            <ProgressBar 
              progress={(analysis.detailedScores.impact / 10) * 100}
              label={`${analysis.detailedScores.impact}/10`}
              color="orange"
            />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Structure</h3>
            <ProgressBar 
              progress={(analysis.detailedScores.structure / 10) * 100}
              label={`${analysis.detailedScores.structure}/10`}
              color="green"
            />
          </div>
        </div>

        {/* Points Forts et Améliorations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="bg-green-50 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
              <h3 className="text-lg sm:text-xl font-semibold text-green-900">Points Forts</h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <MarkdownRenderer content={strength} className="text-green-800 text-sm sm:text-base" />
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" />
              <h3 className="text-lg sm:text-xl font-semibold text-orange-900">Améliorations</h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <MarkdownRenderer content={improvement} className="text-orange-800 text-sm sm:text-base" />
                </li>
              ))}
            </ul>
          </div>
        </div>



        {/* Recommandations de Format */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Recommandations de Format</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {analysis.formatRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start bg-gray-50 rounded-lg p-3 sm:p-4">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <MarkdownRenderer content={recommendation} className="text-gray-700 text-sm sm:text-base" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Analyse de CV Intelligente</h1>
        <p className="text-lg sm:text-xl text-gray-600">
          Téléchargez votre CV et obtenez une analyse détaillée avec des conseils personnalisés
        </p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8">
          <LoadingSpinner 
            size="lg" 
            text="Analyse de votre CV en cours... Notre IA examine votre profil en détail." 
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8">
          {/* Upload Section */}
          <div className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">Téléchargement du CV</h2>
            
            {!uploadedFile ? (
              <div className="relative group">
                {/* Zone de drop avec effet de survol */}
                <div className="border-3 border-dashed border-gray-300 rounded-2xl p-6 sm:p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 group-hover:shadow-lg">
                  {/* Icône animée */}
                  <div className="relative mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold">PDF</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    Téléchargez votre CV
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed">
                    Glissez-déposez votre fichier PDF ou cliquez sur le bouton ci-dessous pour sélectionner
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
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-base sm:text-lg cursor-pointer transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Upload className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    Choisir un fichier PDF
                  </label>
                  
                  <div className="mt-6 sm:mt-8 flex items-center justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Format PDF uniquement
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Taille max: 5MB
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mr-4 sm:mr-6">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 text-base sm:text-lg mb-1">{uploadedFile.name}</h3>
                      <p className="text-sm sm:text-base text-blue-700">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 sm:p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
                
                {isConvertingPDF ? (
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-blue-200">
                    <LoadingSpinner size="sm" text="Analyse du PDF en cours..." />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm sm:text-base font-medium text-green-700">Fichier prêt pour l'analyse</span>
                      </div>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-blue-600 hover:text-blue-700 text-sm sm:text-base font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                        {showPreview ? 'Masquer' : 'Voir'} le PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text Preview */}
          {cvText && !cvText.startsWith('[PDF analysé:') && (
            <div className="mb-8 sm:mb-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Aperçu du contenu extrait</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
                >
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {showPreview ? 'Masquer' : 'Voir'} le CV complet
                </button>
              </div>
              {showPreview ? (
                <CVPreview cvText={cvText} uploadedFile={uploadedFile} />
              ) : (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                  <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {cvText.substring(0, 300)}
                    {cvText.length > 300 && '...'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {cvText.length} caractères extraits
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm text-blue-600 font-medium">Prêt pour l'analyse</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}



          {/* Error Message */}
          {error && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800 text-sm sm:text-base mb-1">Erreur détectée</h4>
                  <p className="text-red-700 text-sm sm:text-base">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 sm:mt-10 p-6 sm:p-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4 sm:mb-6 text-base sm:text-lg">Cette analyse vous fournira :</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start p-3 sm:p-4 bg-white rounded-xl border border-gray-100">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Score Global</h5>
                  <p className="text-xs sm:text-sm text-gray-600">Évaluation complète de la qualité</p>
                </div>
              </div>
              <div className="flex items-start p-3 sm:p-4 bg-white rounded-xl border border-gray-100">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Analyse Détaillée</h5>
                  <p className="text-xs sm:text-sm text-gray-600">Clarté, impact et structure</p>
                </div>
              </div>
              <div className="flex items-start p-3 sm:p-4 bg-white rounded-xl border border-gray-100">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Points Forts</h5>
                  <p className="text-xs sm:text-sm text-gray-600">Vos atouts identifiés</p>
                </div>
              </div>
              <div className="flex items-start p-3 sm:p-4 bg-white rounded-xl border border-gray-100">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Conseils Format</h5>
                  <p className="text-xs sm:text-sm text-gray-600">Mise en forme professionnelle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVAnalysisComponent;