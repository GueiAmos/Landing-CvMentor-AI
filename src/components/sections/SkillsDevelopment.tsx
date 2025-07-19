import React, { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, Clock, Star, ExternalLink, Target, Award, Play, RefreshCw, ChevronDown, ChevronUp, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { youtubeService } from '../../services/youtubeService';
import { saveSession, getSession } from '../../utils/storage';
import { SkillGap, Resource } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import YouTubePlayer from '../ui/YouTubePlayer';

interface SkillsDevelopmentProps {
  onNavigate?: (section: string) => void;
}

const YOUTUBE_API_KEY = 'AIzaSyCyM7BmzAS9DuXH_Q2X_mkesoc1m-0WdDo';

const SkillsDevelopment: React.FC<SkillsDevelopmentProps> = ({ onNavigate }) => {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<{ [skill: string]: any[] }>({});
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [loadingSkill, setLoadingSkill] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [videoLang, setVideoLang] = useState<{ [skill: string]: 'fr' | 'en' }>({});

  useEffect(() => {
    const session = getSession();
    const currentCVId = session.uploadedFile ? `${session.uploadedFile.name}_${session.uploadedFile.size}` : '';
    const lastSkillPlanCVId = session.lastSkillPlanCVId || '';
    const forceRegen = session.forceSkillPlanRegeneration;
    if (
      forceRegen ||
      !session.skillGaps ||
      !lastSkillPlanCVId ||
      currentCVId !== lastSkillPlanCVId
    ) {
      // Générer un nouveau plan et sauvegarder l'identifiant du CV
      if (session.cvJobMatch?.gaps && session.cvJobMatch.gaps.length > 0) {
        generateSkillPlan(session.cvJobMatch.gaps);
        saveSession({ lastSkillPlanCVId: currentCVId, forceSkillPlanRegeneration: false });
      }
    } else if (session.skillGaps) {
      setSkillGaps(session.skillGaps);
    }
    // Toujours réinitialiser le flag après usage
    saveSession({ forceSkillPlanRegeneration: false });
    // Annuler tout état "en cours" si on revient sur la page
    setIsLoading(false);
    setError('');
    // Optionnel : effacer les résultats partiels si on veut forcer une nouvelle génération
    // setSkillGaps([]);
  }, []);

  const generateSkillPlan = async (gaps?: string[]) => {
    const session = getSession();
    let gapsToAnalyze = gaps;
    if (!gapsToAnalyze) {
      if (!session.cvJobMatch?.gaps || session.cvJobMatch.gaps.length === 0) {
        setError('Veuillez d\'abord effectuer une comparaison CV-Offre pour identifier vos lacunes.');
        return;
      }
      gapsToAnalyze = session.cvJobMatch.gaps;
    }
    setIsLoading(true);
    setError('');
    try {
      const plan = await aiService.generateSkillDevelopmentPlan(gapsToAnalyze);
      setSkillGaps(plan);
      saveSession({ skillGaps: plan });
    } catch (err) {
      setError('Erreur lors de la génération du plan. Veuillez réessayer.');
      console.error('Skill Development Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-700 border-red-400';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-400';
      case 'low': return 'bg-green-100 text-green-700 border-green-400';
      default: return 'bg-gray-100 text-gray-700 border-gray-400';
    }
  };
  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'high': return 'Priorité haute';
      case 'medium': return 'Priorité moyenne';
      case 'low': return 'Priorité basse';
      default: return 'Non défini';
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <BookOpen className="h-4 w-4" />;
      case 'course': return <Award className="h-4 w-4" />;
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'certification': return <Star className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const resetPlan = () => {
    setSkillGaps([]);
    setError('');
    setExpandedIndex(null);
    const session = getSession();
    if (session.cvJobMatch?.gaps && session.cvJobMatch.gaps.length > 0) {
      generateSkillPlan(session.cvJobMatch.gaps);
    }
  };

  // Recherche YouTube bilingue
  const fetchYouTubeVideos = async (skill: string) => {
    setIsLoadingVideos(true);
    setLoadingSkill(skill);
    setVideoLang((prev) => ({ ...prev, [skill]: 'fr' }));
    try {
      let response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(skill)}&relevanceLanguage=fr&regionCode=FR&key=${YOUTUBE_API_KEY}`
      );
      let data = await response.json();
      if (!data.items || data.items.length === 0) {
        // Si aucune vidéo en français, chercher en anglais
        response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(skill)}&relevanceLanguage=en&regionCode=US&key=${YOUTUBE_API_KEY}`
        );
        data = await response.json();
        setVideoLang((prev) => ({ ...prev, [skill]: 'en' }));
      } else {
        setVideoLang((prev) => ({ ...prev, [skill]: 'fr' }));
      }
      setYoutubeVideos((prev) => ({ ...prev, [skill]: data.items || [] }));
    } catch (e) {
      setYoutubeVideos((prev) => ({ ...prev, [skill]: [] }));
      setVideoLang((prev) => ({ ...prev, [skill]: 'fr' }));
    } finally {
      setIsLoadingVideos(false);
      setLoadingSkill(null);
    }
  };

  const handleExpand = (idx: number, skill: string) => {
    if (expandedIndex !== idx) {
      fetchYouTubeVideos(skill);
    }
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  // Mobile-first header sticky
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 pb-8">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur shadow-sm flex items-center px-2 sm:px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
        <button
          onClick={() => onNavigate && onNavigate('job-matching')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm sm:text-lg px-2 py-1"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Retour
        </button>
        <h1 className="flex-1 text-center text-base sm:text-2xl font-bold text-gray-900">Plan de Développement</h1>
        <button
          onClick={resetPlan}
          className="ml-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-semibold text-sm sm:text-base shadow transition-colors"
        >
          Nouveau plan
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-0 mt-6">
        {/* Résumé */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm mb-2">
            <TrendingUp className="h-5 w-5 mr-2" />
            {skillGaps.length} compétence{skillGaps.length > 1 ? 's' : ''} à développer
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Boostez votre profil !</h2>
          <p className="text-gray-600 text-xs sm:text-base">Voici un plan personnalisé pour combler vos lacunes et progresser rapidement.</p>
        </div>

        {/* Loading & Empty State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" text="Génération de votre plan de développement..." />
          </div>
        ) : skillGaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 text-blue-200 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune compétence à développer</h3>
            <p className="text-gray-600 mb-4">Effectuez une comparaison CV-Offre pour générer un plan personnalisé.</p>
            <button
              onClick={resetPlan}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Générer un plan
            </button>
          </div>
        ) : (
          <>
            {/* Liste des compétences à développer */}
            <div className="space-y-5">
              {skillGaps.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 flex flex-col gap-2 relative"
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-6 w-6 text-blue-500" />
                    <span className="font-semibold text-base sm:text-lg text-gray-900">{skill.skill}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Vidéos YouTube recommandées</span>
                  </div>
                  <button
                    className="mt-3 flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold text-sm transition-colors"
                    onClick={() => handleExpand(idx, skill.skill)}
                  >
                    {expandedIndex === idx ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                    {expandedIndex === idx ? 'Masquer les vidéos' : 'Voir les vidéos'}
                  </button>
                  {/* Vidéos YouTube (collapse) */}
                  {expandedIndex === idx && (
                    <div className="mt-4">
                      {isLoadingVideos && loadingSkill === skill.skill ? (
                        <div className="text-center py-4">
                          <LoadingSpinner size="md" text="Chargement des vidéos..." />
                  </div>
                      ) : youtubeVideos[skill.skill] && youtubeVideos[skill.skill].length > 0 ? (
                        <>
                          <div className="relative">
                            <div className="flex items-center">
                              {/* Flèche gauche */}
                    <button
                                className="z-10 p-2 bg-white rounded-full shadow absolute left-0 top-1/2 -translate-y-1/2 border border-gray-200 hover:bg-blue-100"
                                style={{ left: '-18px' }}
                                onClick={() => {
                                  const el = document.getElementById(`carousel-${idx}`);
                                  if (el) el.scrollBy({ left: -220, behavior: 'smooth' });
                                }}
                                tabIndex={-1}
                              >
                                <ChevronLeft className="h-5 w-5" />
                    </button>
                              {/* Carrousel vidéos */}
                              <div
                                id={`carousel-${idx}`}
                                className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 py-2 px-1"
                                style={{ scrollSnapType: 'x mandatory' }}
                              >
                                {youtubeVideos[skill.skill].map((video: any) => (
                                  <div
                                    key={video.id.videoId}
                                    className="flex-shrink-0 w-48 sm:w-56 bg-blue-50 rounded-xl p-2 sm:p-3 flex flex-col items-center shadow-md"
                                    style={{ scrollSnapAlign: 'start' }}
                                  >
                                    <img
                                      src={video.snippet.thumbnails.medium.url}
                                      alt={video.snippet.title}
                                      className="w-full h-24 sm:h-32 object-cover rounded mb-2"
                                    />
                                    <div className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1 text-center">{video.snippet.title}</div>
                                    <div className="text-xs text-gray-600 mb-2 text-center">{video.snippet.channelTitle}</div>
                                    <a
                                      onClick={e => { e.preventDefault(); setSelectedVideo(video); }}
                                      href="#"
                                      className="px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs sm:text-xs font-semibold flex items-center justify-center mt-1"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" /> Regarder
                                    </a>
                                </div>
                                ))}
                              </div>
                              {/* Flèche droite */}
                              <button
                                className="z-10 p-2 bg-white rounded-full shadow absolute right-0 top-1/2 -translate-y-1/2 border border-gray-200 hover:bg-blue-100"
                                style={{ right: '-18px' }}
                                onClick={() => {
                                  const el = document.getElementById(`carousel-${idx}`);
                                  if (el) el.scrollBy({ left: 220, behavior: 'smooth' });
                                }}
                                tabIndex={-1}
                              >
                                <ChevronRight className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-center mt-3">
                            <button
                              onClick={() => fetchYouTubeVideos(skill.skill)}
                              className="flex items-center px-3 py-2 sm:px-4 bg-gray-200 hover:bg-blue-600 hover:text-white text-gray-700 rounded-lg font-semibold text-xs sm:text-xs transition-colors"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" /> Recharger d'autres vidéos
                            </button>
                        </div>
                          {videoLang[skill.skill] === 'en' && (
                            <div className="text-center text-xs text-orange-600 mt-2">Aucune vidéo trouvée en français, voici des vidéos en anglais.</div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-500 text-sm">Aucune vidéo trouvée pour cette compétence.</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
      </div>

            {/* Bouton nouveau plan */}
          </>
        )}

        {/* Conseils généraux */}
        <div className="mt-10 p-5 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border border-blue-100 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center"><TrendingUp className="h-5 w-5 mr-2" />Conseils pour progresser</h3>
          <ul className="text-blue-800 text-sm space-y-2">
              <li>• Commencez par les compétences haute priorité</li>
              <li>• Consacrez du temps régulier à l'apprentissage</li>
              <li>• Fixez-vous des objectifs réalisables</li>
              <li>• Pratiquez régulièrement ce que vous apprenez</li>
            <li>• Créez des projets personnels ou rejoignez des communautés</li>
            <li>• Mettez à jour votre CV au fur et à mesure de vos progrès</li>
            </ul>
          </div>
      </div>
      {/* Modal lecteur YouTube */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-4 relative">
            <button
              className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center bg-white shadow-lg rounded-full text-gray-700 hover:bg-red-500 hover:text-white text-3xl transition-all border-2 border-gray-200 z-10"
              onClick={() => setSelectedVideo(null)}
              aria-label="Fermer"
            >
              ×
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full rounded-xl overflow-hidden mb-4">
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${selectedVideo.id.videoId}`}
                title={selectedVideo.snippet.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="font-semibold text-gray-900 mb-1 text-base line-clamp-2">{selectedVideo.snippet.title}</div>
            <div className="text-xs text-gray-600 mb-2">{selectedVideo.snippet.channelTitle}</div>
            <a
              href={`https://www.youtube.com/watch?v=${selectedVideo.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-blue-600 hover:underline text-xs"
            >
              Voir sur YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsDevelopment;