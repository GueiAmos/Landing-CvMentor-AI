import React, { useState, useEffect } from 'react';
import { FileText, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface PDFViewerProps {
  file: File;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ file, className = '' }) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
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

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 bg-red-50 rounded-lg ${className}`}>
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-gray-600 mr-2" />
          <span className="font-medium text-gray-900 truncate">{file.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadPDF}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Télécharger
          </button>
        </div>
      </div>

      {/* Visualiseur PDF */}
      <div className="p-4">
        <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
            className="w-full h-full"
            title={`Aperçu de ${file.name}`}
          />
        </div>
        
        {/* Informations du fichier */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Nom :</span>
              <span className="ml-2 text-gray-600">{file.name}</span>
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