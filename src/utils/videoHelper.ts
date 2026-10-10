/**
 * Helper to parse, validate, and convert video links (YouTube, YouTube Live, Vimeo, Twitch)
 * into embeddable iframe URLs without consuming ANY server storage.
 */

export interface ParsedVideoInfo {
  isValid: boolean;
  embedUrl: string | null;
  platform: 'youtube' | 'vimeo' | 'twitch' | 'other' | null;
  isLiveDetected: boolean;
  isShorts: boolean;
  videoId?: string;
}

export function parseVideoUrl(rawUrl?: string): ParsedVideoInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      embedUrl: null,
      platform: null,
      isLiveDetected: false,
      isShorts: false,
    };
  }

  const url = rawUrl.trim();
  if (!url) {
    return {
      isValid: false,
      embedUrl: null,
      platform: null,
      isLiveDetected: false,
      isShorts: false,
    };
  }

  // 1. YouTube (Regular, Shorts, Live, youtu.be, embed)
  // Handles:
  // https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // https://youtu.be/dQw4w9WgXcQ
  // https://www.youtube.com/live/dQw4w9WgXcQ
  // https://www.youtube.com/shorts/dQw4w9WgXcQ
  // https://www.youtube.com/embed/dQw4w9WgXcQ
  const ytMatch = url.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const isLive = url.includes('/live/') || url.includes('live=1');
    const isShorts = url.includes('/shorts/');

    return {
      isValid: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      platform: 'youtube',
      isLiveDetected: isLive,
      isShorts: isShorts,
      videoId,
    };
  }

  // 2. Vimeo
  // Handles:
  // https://vimeo.com/123456789
  // https://player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    const vimeoId = vimeoMatch[3];
    return {
      isValid: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?color=38bdf8&title=0&byline=0&portrait=0`,
      platform: 'vimeo',
      isLiveDetected: false,
      isShorts: false,
      videoId: vimeoId,
    };
  }

  // 3. Twitch (Channel Live Stream or VOD)
  // Handles:
  // https://www.twitch.tv/username
  // https://www.twitch.tv/videos/123456789
  const twitchVideoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/videos\/(\d+)/i);
  if (twitchVideoMatch && twitchVideoMatch[1]) {
    const vodId = twitchVideoMatch[1];
    const parentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return {
      isValid: true,
      embedUrl: `https://player.twitch.tv/?video=${vodId}&parent=${parentHost}&autoplay=false`,
      platform: 'twitch',
      isLiveDetected: false,
      isShorts: false,
      videoId: vodId,
    };
  }

  const twitchChannelMatch = url.match(/(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]{3,25})/i);
  if (twitchChannelMatch && twitchChannelMatch[1]) {
    const channel = twitchChannelMatch[1];
    const parentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return {
      isValid: true,
      embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=${parentHost}&autoplay=false`,
      platform: 'twitch',
      isLiveDetected: true,
      isShorts: false,
      videoId: channel,
    };
  }

  // 4. Raw Embed fallback if user entered an already formed embed url
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/') || url.includes('player.twitch.tv/')) {
    return {
      isValid: true,
      embedUrl: url,
      platform: url.includes('youtube') ? 'youtube' : url.includes('vimeo') ? 'vimeo' : 'twitch',
      isLiveDetected: url.includes('live'),
      isShorts: false,
    };
  }

  return {
    isValid: false,
    embedUrl: null,
    platform: null,
    isLiveDetected: false,
    isShorts: false,
  };
}
