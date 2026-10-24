/**
 * Helper to parse, validate, and convert video links (YouTube, Shorts, Vimeo, Twitch, Loom, Wistia, Dailymotion, TikTok, Direct MP4)
 * into embeddable iframe URLs or native HTML5 video players without consuming server storage.
 */

export interface ParsedVideoInfo {
  isValid: boolean;
  embedUrl: string | null;
  originalUrl?: string;
  platform: 'youtube' | 'vimeo' | 'twitch' | 'loom' | 'wistia' | 'dailymotion' | 'tiktok' | 'instagram' | 'facebook' | 'direct' | 'other' | null;
  isLiveDetected: boolean;
  isShorts: boolean;
  isVertical?: boolean;
  isDirectVideo?: boolean;
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

  // 1. Direct Video files (MP4, WebM, OGG, MOV) hosted on any cloud / CDN
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
    return {
      isValid: true,
      embedUrl: url,
      platform: 'direct',
      isLiveDetected: false,
      isShorts: false,
      isDirectVideo: true,
    };
  }

  // 2. YouTube (Regular, Shorts, Live, youtu.be, embed)
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
      isVertical: isShorts,
      videoId,
    };
  }

  // 3. Loom (Video Messages, Product Demos, Pitch)
  // Handles: https://www.loom.com/share/{id} or https://www.loom.com/embed/{id}
  const loomMatch = url.match(/(?:https?:\/\/)?(?:www\.)?loom\.com\/(?:share|embed)\/([a-f0-9]{32})/i);
  if (loomMatch && loomMatch[1]) {
    const loomId = loomMatch[1];
    return {
      isValid: true,
      embedUrl: `https://www.loom.com/embed/${loomId}`,
      platform: 'loom',
      isLiveDetected: false,
      isShorts: false,
      videoId: loomId,
    };
  }

  // 4. Vimeo
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

  // 5. Twitch (Channel Live Stream or VOD)
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

  // 6. Wistia
  const wistiaMatch = url.match(/(?:https?:\/\/)?(?:[a-zA-Z0-9_-]+\.)?wistia\.(?:com|net)\/(?:medias|embed\/iframe)\/([a-zA-Z0-9]+)/i);
  if (wistiaMatch && wistiaMatch[1]) {
    const wistiaId = wistiaMatch[1];
    return {
      isValid: true,
      embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaId}`,
      platform: 'wistia',
      isLiveDetected: false,
      isShorts: false,
      videoId: wistiaId,
    };
  }

  // 7. Dailymotion
  const dailyMatch = url.match(/(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/(?:video|embed\/video)\/([a-zA-Z0-9]+)/i);
  if (dailyMatch && dailyMatch[1]) {
    const dailyId = dailyMatch[1];
    return {
      isValid: true,
      embedUrl: `https://www.dailymotion.com/embed/video/${dailyId}`,
      platform: 'dailymotion',
      isLiveDetected: false,
      isShorts: false,
      videoId: dailyId,
    };
  }

  // 8. TikTok (Embed video)
  const tiktokMatch = url.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^/]+\/video\/(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    const tikId = tiktokMatch[1];
    return {
      isValid: true,
      embedUrl: `https://www.tiktok.com/embed/v2/${tikId}`,
      platform: 'tiktok',
      isLiveDetected: false,
      isShorts: true,
      isVertical: true,
      videoId: tikId,
    };
  }

  // 9. Instagram (Reels, Posts, IGTV)
  // Handles: instagram.com/reel/..., instagram.com/p/..., instagr.am/...
  const igMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i
  );
  if (igMatch && igMatch[1]) {
    const igId = igMatch[1];
    const isReel = url.toLowerCase().includes('/reel/');
    const pathType = isReel ? 'reel' : 'p';
    return {
      isValid: true,
      embedUrl: `https://www.instagram.com/${pathType}/${igId}/embed/`,
      originalUrl: `https://www.instagram.com/${pathType}/${igId}/`,
      platform: 'instagram',
      isLiveDetected: false,
      isShorts: isReel,
      isVertical: isReel,
      videoId: igId,
    };
  }

  // 10. Facebook (Videos, Watch, Reels, fb.watch)
  // Handles: facebook.com/watch/?v=..., facebook.com/.../videos/..., facebook.com/reel/..., fb.watch/...
  const isFb =
    /(?:https?:\/\/)?(?:www\.|web\.|m\.)?(?:facebook\.com\/(?:watch\/?\?v=\d+|[^/]+\/videos\/\d+|reel\/\d+|watch\/live)|fb\.watch\/)/i.test(
      url
    );

  if (isFb) {
    const isLive = url.includes('/live');
    const isReel = url.includes('/reel/');
    const encodedUrl = encodeURIComponent(url);
    return {
      isValid: true,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=0&autoplay=0`,
      platform: 'facebook',
      isLiveDetected: isLive,
      isShorts: isReel,
      isVertical: isReel,
    };
  }

  // 11. Raw Embed fallback if user entered an already formed embed url
  if (
    url.includes('youtube.com/embed/') ||
    url.includes('player.vimeo.com/video/') ||
    url.includes('player.twitch.tv/') ||
    url.includes('loom.com/embed/') ||
    url.includes('instagram.com/p/') ||
    url.includes('facebook.com/plugins/video.php')
  ) {
    return {
      isValid: true,
      embedUrl: url,
      platform: url.includes('youtube')
        ? 'youtube'
        : url.includes('vimeo')
        ? 'vimeo'
        : url.includes('loom')
        ? 'loom'
        : url.includes('instagram')
        ? 'instagram'
        : url.includes('facebook')
        ? 'facebook'
        : 'twitch',
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
