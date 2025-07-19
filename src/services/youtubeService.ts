import { YouTubeVideo, YouTubeSearchResult } from '../types';

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
      publishedAt: string;
    };
  }>;
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || '';
  }

  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'N/A';

    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else if (minutes > 0) {
      return `${minutes}min`;
    } else {
      return `${seconds}s`;
    }
  }

  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M vues`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K vues`;
    }
    return `${count} vues`;
  }

  async searchVideos(skill: string, maxResults: number = 6): Promise<YouTubeSearchResult> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured, using mock data');
      return {
        videos: this.getMockVideos(skill),
        language: 'mock'
      };
    }

    try {
      // Recherche en français d'abord
      let searchQuery = `${skill} formation tutoriel cours français`;
      let searchUrl = `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${this.apiKey}&relevanceLanguage=fr&regionCode=FR&order=relevance`;
      
      let searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        throw new Error(`YouTube API Error: ${searchResponse.status} ${searchResponse.statusText}`);
      }
      
      let searchData: YouTubeSearchResponse = await searchResponse.json();

      // Si pas assez de résultats en français, essayer en anglais
      let language: 'fr' | 'en' | 'mock' = 'fr';
      if (!searchData.items || searchData.items.length < 3) {
        searchQuery = `${skill} tutorial course training`;
        searchUrl = `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${this.apiKey}&relevanceLanguage=en&regionCode=US&order=relevance`;
        
        searchResponse = await fetch(searchUrl);
        if (searchResponse.ok) {
          searchData = await searchResponse.json();
          language = 'en';
        }
      }

      if (!searchData.items || searchData.items.length === 0) {
        return {
          videos: this.getMockVideos(skill),
          language: 'mock'
        };
      }

      // Récupérer les détails des vidéos (durée, vues)
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');
      const detailsUrl = `${this.baseUrl}/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      let detailsData: YouTubeVideoDetailsResponse = { items: [] };
      
      if (detailsResponse.ok) {
        detailsData = await detailsResponse.json();
      }

      // Combiner les données
      const videos: YouTubeVideo[] = searchData.items.map((item, index) => {
        const details = detailsData.items[index];
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          duration: details ? this.formatDuration(details.contentDetails.duration) : 'N/A',
          viewCount: details ? this.formatViewCount(details.statistics.viewCount) : 'N/A',
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        };
      });

      return {
        videos,
        language
      };

    } catch (error) {
      console.error('YouTube API Error:', error);
      return {
        videos: this.getMockVideos(skill),
        language: 'mock'
      };
    }
  }

  private getMockVideos(skill: string): YouTubeVideo[] {
    return [
      {
        id: 'mock1',
        title: `Formation complète : ${skill}`,
        description: `Apprenez ${skill} de A à Z avec cette formation complète et pratique.`,
        thumbnail: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=300',
        channelTitle: 'Formation Pro',
        duration: '45min',
        viewCount: '125K vues',
        publishedAt: '2024-01-15',
        url: '#'
      },
      {
        id: 'mock2',
        title: `${skill} pour débutants`,
        description: `Guide pratique pour débuter avec ${skill}. Exemples concrets et exercices.`,
        thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=300',
        channelTitle: 'Apprendre Facilement',
        duration: '32min',
        viewCount: '89K vues',
        publishedAt: '2024-02-01',
        url: '#'
      },
      {
        id: 'mock3',
        title: `Maîtriser ${skill} rapidement`,
        description: `Techniques avancées et astuces pour progresser rapidement en ${skill}.`,
        thumbnail: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=300',
        channelTitle: 'Expert Skills',
        duration: '28min',
        viewCount: '67K vues',
        publishedAt: '2024-01-28',
        url: '#'
      },
      {
        id: 'mock4',
        title: `${skill} - Projets pratiques`,
        description: `Mettez en pratique vos connaissances en ${skill} avec des projets concrets.`,
        thumbnail: 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=300',
        channelTitle: 'Pratique Pro',
        duration: '52min',
        viewCount: '156K vues',
        publishedAt: '2024-02-10',
        url: '#'
      },
      {
        id: 'mock5',
        title: `Certification ${skill}`,
        description: `Préparez-vous aux certifications professionnelles en ${skill}.`,
        thumbnail: 'https://images.pexels.com/photos/1181679/pexels-photo-1181679.jpeg?auto=compress&cs=tinysrgb&w=300',
        channelTitle: 'Certification Expert',
        duration: '38min',
        viewCount: '203K vues',
        publishedAt: '2024-01-20',
        url: '#'
      }
    ];
  }
}

export const youtubeService = new YouTubeService();