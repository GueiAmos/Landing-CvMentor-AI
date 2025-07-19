import React from 'react';
import { FileText, Eye } from 'lucide-react';

interface CVPreviewProps {
  cvText: string;
  uploadedFile?: File | null;
}

const CVPreview: React.FC<CVPreviewProps> = ({ cvText, uploadedFile }) => {
  const isPDF = uploadedFile && uploadedFile.type === 'application/pdf';

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg">
      {/* Header */}
      <div className="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center">
          <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
          <h4 className="font-medium text-gray-900 text-sm sm:text-base">
            Aperçu de votre CV
          </h4>
          {uploadedFile && (
            <span className="ml-auto text-xs sm:text-sm text-gray-500 truncate max-w-32 sm:max-w-none">
              {uploadedFile.name}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {isPDF ? (
          <div className="text-center py-6 sm:py-8">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-400" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Document PDF analysé
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Votre CV PDF a été analysé avec succès.
            </p>
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Informations du fichier :</h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>• Nom : {uploadedFile?.name}</li>
                <li>• Taille : {uploadedFile ? (uploadedFile.size / 1024 / 1024).toFixed(2) : '0'} MB</li>
                <li>• Format : PDF</li>
                <li>• Statut : Analysé avec succès</li>
              </ul>
            </div>
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-left">
              <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Contenu du CV :</h4>
              <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-gray-800 leading-relaxed">
                  {cvText && !cvText.startsWith('[PDF analysé:') ? cvText : 'Le contenu du PDF a été extrait et analysé par notre IA.'}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-64 sm:max-h-96 overflow-y-auto">
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Contenu de votre CV :</h4>
                <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-gray-800 leading-relaxed">
                  {cvText}
                </pre>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 text-center">
              {cvText.length} caractères • Contenu extrait et prêt pour l'analyse
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVPreview;