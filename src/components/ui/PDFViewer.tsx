import React, { useState, useEffect } from 'react';
import { FileText, Download, ZoomIn, ZoomOut, RotateCw, Eye, Smartphone } from 'lucide-react';

interface PDFViewerProps {
  file: File;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, className = '' }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    // Détecter si on est sur mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    
    // Réinitialiser l'erreur iframe quand le fichier change
    setIframeError(false);

    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setIsLoading(false);

      // Cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setError('Fichier PDF invalide');
      setIsLoading(false);
    }
  }, [file]);

  const downloadPDF = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const openInNewWindow = () => {
    if (pdfUrl) {
      const newWindow = window.open(pdfUrl, '_blank', 'width=800,height=600');
      if (newWindow) {
        newWindow.focus();
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 sm:p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Chargement du PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-4 sm:p-8 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-red-600 text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2" />
          <span className="font-medium text-gray-900 truncate text-sm sm:text-base max-w-32 sm:max-w-none">{file.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          {isMobile && (
            <button
              onClick={() => setShowMobileWarning(!showMobileWarning)}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
            >
              <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Mobile</span>
              <span className="sm:hidden">M</span>
            </button>
          )}
          <button
            onClick={downloadPDF}
            className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Télécharger</span>
            <span className="sm:hidden">DL</span>
          </button>
        </div>
      </div>

      {/* Avertissement mobile */}
      {isMobile && showMobileWarning && (
        <div className="p-3 sm:p-4 bg-orange-50 border-b border-orange-200">
          <div className="flex items-start">
            <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-orange-800 text-sm sm:text-base font-medium mb-2">Affichage PDF sur mobile</p>
              <p className="text-orange-700 text-xs sm:text-sm mb-3">
                L'affichage PDF peut être limité sur mobile. Utilisez les options ci-dessous pour une meilleure expérience.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openInNewTab}
                  className="flex items-center px-3 py-2 text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Ouvrir dans un nouvel onglet
                </button>
                <button
                  onClick={openInNewWindow}
                  className="flex items-center px-3 py-2 text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Ouvrir dans une fenêtre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visualiseur PDF */}
      <div className="p-3 sm:p-4">
        <div className="w-full h-64 sm:h-[600px] lg:h-[700px] border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
          {isMobile && iframeError ? (
            // Version mobile avec fallback seulement si iframe échoue
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <div className="text-center mb-4">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm sm:text-base mb-2">Aperçu PDF non disponible sur mobile</p>
                <p className="text-gray-500 text-xs sm:text-sm">Utilisez les boutons ci-dessous pour visualiser le PDF</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                <button
                  onClick={openInNewTab}
                  className="flex items-center justify-center px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le PDF
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </button>
              </div>
            </div>
          ) : (
            // Version avec iframe pour tous les appareils
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
              className="w-full h-full"
              title={`Aperçu de ${file.name}`}
              onError={() => {
                if (isMobile) {
                  setIframeError(true);
                } else {
                  setError('Erreur lors du chargement du PDF');
                }
              }}
            />
          )}
        </div>
        
        {/* Informations du fichier */}
        <div className="mt-3 sm:mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="font-medium text-gray-700">Nom :</span>
              <span className="ml-2 text-gray-600 truncate">{file.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Taille :</span>
              <span className="ml-2 text-gray-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type :</span>
              <span className="ml-2 text-gray-600">PDF</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Statut :</span>
              <span className="ml-2 text-green-600">Analysé avec succès</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;