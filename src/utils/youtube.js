// YouTube utilities for exercise videos
export const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Get simple thumbnail URL (for backward compatibility)
export const getYouTubeThumbnail = (videoId, quality = 'maxresdefault') => {
  // quality options: default, mqdefault, hqdefault, sddefault, maxresdefault
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

// Enhanced thumbnail function with multiple quality options
export const getYouTubeThumbnailOptions = (videoId) => {
  const baseUrl = `https://img.youtube.com/vi/${videoId}`;
  
  // Return object with multiple quality options for fallback
  return {
    maxres: `${baseUrl}/maxresdefault.jpg`,
    high: `${baseUrl}/hqdefault.jpg`,
    medium: `${baseUrl}/mqdefault.jpg`,
    default: `${baseUrl}/default.jpg`
  };
};

export const getYouTubeEmbedUrl = (videoId, autoplay = false, controls = true, additionalParams = {}) => {
  const defaultParams = {
    rel: '0', // Don't show related videos
    modestbranding: '1', // Minimal YouTube branding
    controls: controls ? '1' : '0',
    autoplay: autoplay ? '1' : '0',
    iv_load_policy: '3', // Hide video annotations
    cc_load_policy: '1', // Show closed captions if available
    playsinline: '1', // Play inline on mobile
    fs: '1', // Allow fullscreen
    enablejsapi: '1', // Enable JavaScript API
    origin: window.location.origin, // Security for embedded player
    ...additionalParams
  };
  
  const params = new URLSearchParams(defaultParams);
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

// Create responsive thumbnail data for better loading
export const createThumbnailPicture = (videoId, alt = '') => {
  const thumbnails = getYouTubeThumbnailOptions(videoId);
  return {
    sources: [
      { srcSet: thumbnails.maxres, media: '(min-width: 1024px)' },
      { srcSet: thumbnails.high, media: '(min-width: 768px)' },
      { srcSet: thumbnails.medium, media: '(min-width: 480px)' }
    ],
    fallback: thumbnails.default,
    alt
  };
};

// Generate YouTube playlist embed URL
export const getYouTubePlaylistEmbedUrl = (playlistId, autoplay = false) => {
  const params = new URLSearchParams({
    listType: 'playlist',
    list: playlistId,
    rel: '0',
    modestbranding: '1',
    autoplay: autoplay ? '1' : '0',
    iv_load_policy: '3',
    cc_load_policy: '1',
    playsinline: '1'
  });
  
  return `https://www.youtube.com/embed?${params.toString()}`;
};

// Check if video ID is valid format
export const isValidYouTubeId = (videoId) => {
  const regex = /^[a-zA-Z0-9_-]{11}$/;
  return regex.test(videoId);
};

// Get video URL for sharing
export const getYouTubeShareUrl = (videoId, startTime = null) => {
  const baseUrl = `https://youtu.be/${videoId}`;
  return startTime ? `${baseUrl}?t=${startTime}` : baseUrl;
};

export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
};

export const getDifficultyColor = (level) => {
  const colors = {
    beginner: 'bg-green-100 text-green-800 border-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    advanced: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[level] || colors.beginner;
};

export const getCategoryColor = (category) => {
  const colors = {
    // hyphenated keys (legacy)
    'stress-relief': 'bg-blue-100 text-blue-800 border-blue-200',
    'quick-energy': 'bg-orange-100 text-orange-800 border-orange-200',
    'mindful-movement': 'bg-purple-100 text-purple-800 border-purple-200',
    'strength': 'bg-red-100 text-red-800 border-red-200',
    'cardio': 'bg-pink-100 text-pink-800 border-pink-200'
  };
  // underscore keys (massive page)
  const underscoreColors = {
    'stress_relief': colors['stress-relief'],
    'energy_boost': colors['quick-energy'],
    'mindful_movement': colors['mindful-movement']
  };
  return colors[category] || underscoreColors[category] || colors['stress-relief'];
};
