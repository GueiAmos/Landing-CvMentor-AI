interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  url: string;
}

interface YouTubeSearchResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: { url: string };
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

  async searchVideos(skill: string, maxResults: number = 6): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured');
      return this.getMockVideos(skill);
    }

    try {
      // Recherche de vidéos
      const searchQuery = `${skill} formation tutoriel cours`;
      const searchUrl = `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${maxResults}&key=${this.apiKey}&relevanceLanguage=fr&regionCode=FR`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData: YouTubeSearchResponse = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return this.getMockVideos(skill);
      }

      // Récupérer les détails des vidéos (durée, vues)
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');
      const detailsUrl = `${this.baseUrl}/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json();

      // Combiner les données
      return searchData.items.map((item, index) => {
        const details = detailsData.items[index];
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          duration: details ? this.formatDuration(details.contentDetails.duration) : 'N/A',
          viewCount: details ? this.formatViewCount(details.statistics.viewCount) : 'N/A',
          publishedAt: item.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`
        };
      });

    } catch (error) {
      console.error('YouTube API Error:', error);
      return this.getMockVideos(skill);
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
      }
    ];
  }
}

export const youtubeService = new YouTubeService();