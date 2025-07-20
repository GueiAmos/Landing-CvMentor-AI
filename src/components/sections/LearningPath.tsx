import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BookOpen, 
  Clock, 
  Star, 
  ExternalLink, 
  Target, 
  Award, 
  Play, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  FileText,
  Video,
  GraduationCap,
  Users,
  Zap,
  CheckCircle,
  Calendar,
  Bookmark
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { youtubeService } from '../../services/youtubeService';
import { saveSession, getSession } from '../../utils/storage';
import { SkillGap, Resource, YouTubeVideo } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import YouTubePlayer from '../ui/YouTubePlayer';

interface LearningPathProps {
  onNavigate?: (section: string) => void;
}

const LearningPath: React.FC<LearningPathProps> = ({ onNavigate }) => {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<{ [skill: string]: YouTubeVideo[] }>({});
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [loadingSkill, setLoadingSkill] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [videoLang, setVideoLang] = useState<{ [skill: string]: 'fr' | 'en' }>({});
  const [activeTabs, setActiveTabs] = useState<{ [skillIndex: number]: 'videos' | 'resources' }>({});
  
  // Initialiser les onglets par défaut quand les compétences changent
  useEffect(() => {
    if (skillGaps.length > 0) {
      const defaultTabs: { [skillIndex: number]: 'videos' | 'resources' } = {};
      skillGaps.forEach((_, index) => {
        defaultTabs[index] = 'videos';
      });
      setActiveTabs(defaultTabs);
    }
  }, [skillGaps]);

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
      if (session.cvJobMatch?.gaps && session.cvJobMatch.gaps.length > 0) {
        generateSkillPlan(session.cvJobMatch.gaps);
        saveSession({ lastSkillPlanCVId: currentCVId, forceSkillPlanRegeneration: false });
      }
    } else if (session.skillGaps) {
      setSkillGaps(session.skillGaps);
    }
    
    saveSession({ forceSkillPlanRegeneration: false });
    setIsLoading(false);
    setError('');
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
      console.error('Learning Path Error:', err);
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'course': return <GraduationCap className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'ebook': return <BookOpen className="h-4 w-4" />;
      case 'blog': return <Globe className="h-4 w-4" />;
      case 'website': return <Globe className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Vidéo';
      case 'course': return 'Formation';
      case 'article': return 'Article';
      case 'certification': return 'Certification';
      case 'ebook': return 'E-book';
      case 'blog': return 'Blog';
      case 'website': return 'Site web';
      case 'community': return 'Communauté';
      default: return 'Ressource';
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

  const fetchYouTubeVideos = async (skill: string) => {
    setIsLoadingVideos(true);
    setLoadingSkill(skill);
    
    try {
      const result = await youtubeService.searchVideos(skill, 5);
      setYoutubeVideos((prev) => ({ ...prev, [skill]: result.videos }));
      setVideoLang((prev) => ({ ...prev, [skill]: result.language === 'mock' ? 'fr' : result.language }));
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur shadow-sm flex items-center px-2 sm:px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
        <button
          onClick={() => onNavigate && onNavigate('job-matching')}
          className="flex items-center text-blue-600 hover:text-blue-800 font-semibold text-sm sm:text-lg px-2 py-1"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Retour
        </button>
        <h1 className="flex-1 text-center text-base sm:text-2xl font-bold text-gray-900">Recommandations de formations</h1>
        <button
          onClick={resetPlan}
          className="ml-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-semibold text-sm sm:text-base shadow transition-colors"
        >
          Nouveau plan
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Résumé */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm mb-2">
            <TrendingUp className="h-5 w-5 mr-2" />
            {skillGaps.length} compétence{skillGaps.length > 1 ? 's' : ''} à développer
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">Votre parcours personnalisé</h2>
          <p className="text-gray-600 text-xs sm:text-base">Découvrez les meilleures ressources pour progresser dans vos compétences clés.</p>
        </div>

        {/* Loading & Empty State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" text="Génération de votre parcours d'apprentissage..." />
          </div>
        ) : skillGaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-16 w-16 text-blue-200 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune compétence à développer</h3>
            <p className="text-gray-600 mb-4">Effectuez une comparaison CV-Offre pour générer un parcours personnalisé.</p>
            <button
              onClick={resetPlan}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Générer un parcours
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
                  


                  {/* Tabs pour Vidéos et Ressources */}
                  <div className="mt-4">
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setActiveTabs(prev => ({ ...prev, [idx]: 'videos' }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          activeTabs[idx] === 'videos'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        <Video className="h-4 w-4 inline mr-1" />
                        Vidéos
                      </button>
                      <button
                        onClick={() => setActiveTabs(prev => ({ ...prev, [idx]: 'resources' }))}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          activeTabs[idx] === 'resources'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        <BookOpen className="h-4 w-4 inline mr-1" />
                        Ressources
                      </button>
                    </div>
                  </div>

                  <button
                    className="mt-3 flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold text-sm transition-colors"
                    onClick={() => handleExpand(idx, skill.skill)}
                  >
                    {expandedIndex === idx ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                    {expandedIndex === idx ? 'Masquer les ressources' : 'Voir les ressources'}
                  </button>

                  {/* Contenu expandable */}
                  {expandedIndex === idx && (
                    <div className="mt-4">
                      {activeTabs[idx] === 'videos' ? (
                        // Section Vidéos YouTube
                        <div>
                          {loadingSkill === skill.skill ? (
                            <div className="flex items-center justify-center py-8">
                              <LoadingSpinner size="md" text="Chargement des vidéos..." />
                            </div>
                          ) : youtubeVideos[skill.skill] && youtubeVideos[skill.skill].length > 0 ? (
                            <>
                              <div className="relative">
                                <div
                                  id={`carousel-${idx}`}
                                  className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 py-2 px-1"
                                  style={{ scrollSnapType: 'x mandatory' }}
                                >
                                  {youtubeVideos[skill.skill].map((video: YouTubeVideo) => (
                                    <div
                                      key={video.id}
                                      className="flex-shrink-0 w-48 sm:w-56 bg-blue-50 rounded-xl p-2 sm:p-3 flex flex-col items-center shadow-md"
                                      style={{ scrollSnapAlign: 'start' }}
                                    >
                                      <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-24 sm:h-32 object-cover rounded mb-2"
                                      />
                                      <div className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1 text-center flex-1">{video.title}</div>
                                      <div className="text-xs text-gray-600 mb-2 text-center flex-1">{video.channelTitle}</div>
                                      <a
                                        onClick={e => { e.preventDefault(); setSelectedVideo(video); }}
                                        href="#"
                                        className="w-full px-2 py-2 sm:px-3 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs sm:text-xs font-semibold flex items-center justify-center mt-auto"
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
                      ) : (
                        // Section Ressources d'apprentissage
                        <div>
                          {skill.resources && skill.resources.length > 0 ? (
                            <>
                              <div className="relative">
                                <div
                                  id={`resources-carousel-${idx}`}
                                  className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 py-2 px-1"
                                  style={{ scrollSnapType: 'x mandatory' }}
                                >
                                  {skill.resources.map((resource, resourceIdx) => (
                                    <div
                                      key={resourceIdx}
                                      className="flex-shrink-0 w-48 sm:w-56 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4 flex flex-col items-center shadow-md border border-gray-200"
                                      style={{ scrollSnapAlign: 'start' }}
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        {getResourceIcon(resource.type)}
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                                          {getResourceTypeLabel(resource.type)}
                                        </span>
                                      </div>
                                      <div className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-3 mb-3 text-center flex-1">{resource.title}</div>
                                      {resource.description && (
                                        <div className="text-gray-600 text-xs line-clamp-2 mb-3 text-center flex-1">{resource.description}</div>
                                      )}
                                      <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors mt-auto"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" /> Accéder
                                      </a>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Flèche droite */}
                                <button
                                  className="z-10 p-2 bg-white rounded-full shadow absolute right-0 top-1/2 -translate-y-1/2 border border-gray-200 hover:bg-blue-100"
                                  style={{ right: '-18px' }}
                                  onClick={() => {
                                    const el = document.getElementById(`resources-carousel-${idx}`);
                                    if (el) el.scrollBy({ left: 220, behavior: 'smooth' });
                                  }}
                                  tabIndex={-1}
                                >
                                  <ChevronRight className="h-5 w-5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500 text-sm text-center py-4">
                              Aucune ressource disponible pour cette compétence.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Conseils généraux */}
            <div className="mt-10 p-5 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl border border-blue-100 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Conseils pour progresser
              </h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Commencez par les compétences haute priorité</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Consacrez du temps régulier à l'apprentissage</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Fixez-vous des objectifs réalisables</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pratiquez régulièrement ce que vous apprenez</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Créez des projets personnels ou rejoignez des communautés</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mettez à jour votre CV au fur et à mesure de vos progrès</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Modal lecteur YouTube */}
      {selectedVideo && (
        <YouTubePlayer 
          videoId={selectedVideo.id} 
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default LearningPath; 