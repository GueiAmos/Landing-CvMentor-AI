import React, { useState } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, title, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2 sm:pr-4">{title}</h3>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={openInYouTube}
              className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">YouTube</span>
              <span className="sm:hidden">YT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Chargement de la vidéo...</p>
              </div>
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            className="w-full h-48 sm:h-64 md:h-96"
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
          />
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Regardez cette vidéo pour développer vos compétences
          </p>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;