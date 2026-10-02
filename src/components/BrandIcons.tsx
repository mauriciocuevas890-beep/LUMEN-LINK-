import React from 'react';

interface BrandIconProps {
  className?: string;
  size?: number;
}

// 1. Google (Official 4-Color Logo)
export function GoogleIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

// 2. Google Maps Official Pin (Multicolor)
export function GoogleMapsIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="#EA4335"
      />
      <path
        d="M12 2C10.5 2 9.1 2.5 8 3.3L12 13l4-9.7C14.9 2.5 13.5 2 12 2z"
        fill="#4285F4"
      />
      <path
        d="M8 3.3C6.2 4.6 5 6.7 5 9c0 2.4 1.3 5.3 3.2 8.5L12 13 8 3.3z"
        fill="#FBBC04"
      />
      <path
        d="M12 22s2.6-2.9 4.8-6.5L12 13v9z"
        fill="#34A853"
      />
      <circle cx="12" cy="9" r="2.8" fill="#FFFFFF" />
    </svg>
  );
}

// 3. WhatsApp Official Icon
export function WhatsAppIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M17.5 14.5c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.55-.42-.14 0-.3-.01-.46-.01s-.42.06-.64.3c-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 4. Instagram Official Icon (Gradient)
export function InstagramIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient
          id="igGrad"
          cx="0.2"
          cy="1"
          r="1"
          gradientTransform="matrix(1 0 0 1 0 0)"
        >
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#igGrad)" />
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="12" cy="12" r="4" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      <circle cx="16.7" cy="7.3" r="1.2" fill="#FFFFFF" />
    </svg>
  );
}

// 5. TikTok Official Icon
export function TikTokIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="6" fill="#000000" />
      <path
        d="M16.6 8.2c-1.1-.3-1.9-1.2-2.1-2.2H12v11.3c0 1.5-1.2 2.7-2.7 2.7S6.6 18.8 6.6 17.3c0-1.5 1.2-2.7 2.7-2.7.3 0 .6.1.9.2v-2.7c-.3 0-.6-.1-.9-.1-3 0-5.4 2.4-5.4 5.4S6.3 22.8 9.3 22.8s5.4-2.4 5.4-5.4V10.4c1.2.9 2.7 1.4 4.3 1.4v-2.7c-.8 0-1.7-.3-2.4-.9z"
        fill="#25F4EE"
      />
      <path
        d="M17.1 7.7c-1.1-.3-1.9-1.2-2.1-2.2h-1.5v11.3c0 1.5-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7 1.2-2.7 2.7-2.7c.3 0 .6.1.9.2v-2.7c-.3 0-.6-.1-.9-.1-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4V9.9c1.2.9 2.7 1.4 4.3 1.4V8.6c-.8 0-1.7-.3-2.4-.9z"
        fill="#FE2C55"
      />
      <path
        d="M16.8 8c-1.1-.3-1.9-1.2-2.1-2.2h-2v11.3c0 1.5-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7 1.2-2.7 2.7-2.7c.3 0 .6.1.9.2V11.9c-.3 0-.6-.1-.9-.1-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4 5.4-2.4 5.4-5.4V10.2c1.2.9 2.7 1.4 4.3 1.4V8.9c-.8 0-1.7-.3-2.4-.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 6. Facebook Official Icon
export function FacebookIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M14.5 12h-2v7h-3v-7H8V9.5h1.5V7.8C9.5 6.2 10.5 5 12.5 5H15v2.5h-1.5c-.7 0-.9.3-.9.9V9.5H15l-.5 2.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 7. LinkedIn Official Icon
export function LinkedInIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
      <path
        d="M5.5 8.5h3v10h-3v-10zM7 4a1.8 1.8 0 110 3.6A1.8 1.8 0 017 4zm4.5 4.5h2.9v1.4h.1c.4-.8 1.4-1.6 3-1.6 3.2 0 3.8 2.1 3.8 4.8V18.5h-3v-4.5c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4v4.6h-3v-10z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 8. YouTube Official Icon
export function YouTubeIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.5 6.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.8 2.6 12 2.6 12 2.6s-4.8 0-8.2.3c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S.2 8.1.2 10v1.8c0 1.9.3 3.8.3 3.8s.2 1.6.9 2.3c.9.9 2.1.9 2.6 1 1.9.2 8 .3 8 .3s4.8 0 8.2-.3c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.3-1.9.3-3.8V10c0-1.9-.3-3.8-.3-3.8z"
        fill="#FF0000"
      />
      <polygon points="9.6,15.6 15.6,12 9.6,8.4" fill="#FFFFFF" />
    </svg>
  );
}

// 9. X (formerly Twitter) Official Icon
export function XTwitterIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path
        d="M17.5 4.5h2.4l-5.3 6.1 6.2 8.2h-4.9l-3.8-5-4.4 5H5.3l5.7-6.5L5 4.5h5l3.5 4.6 4-4.6zm-.9 12.9h1.3L8.6 5.8H7.2l9.4 11.6z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 10. Telegram Official Icon
export function TelegramIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#24A1DE" />
      <path
        d="M5.3 11.8l11.4-4.8c.5-.2 1 .1.8.7l-1.9 9.1c-.1.6-.5.7-1 .4l-2.8-2.1-1.3 1.3c-.2.2-.3.3-.6.3l.2-2.8 5.1-4.6c.2-.2 0-.3-.3-.1l-6.3 4-2.8-.9c-.6-.2-.6-.6.1-.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 11. Spotify Official Icon
export function SpotifyIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#1DB954" />
      <path
        d="M17.6 15.6c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.8-9.3-1-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 4.1-.9 7.5-.6 10.3 1.1.3.3.4.7.2 1zm1.2-2.6c-.3.4-.8.5-1.2.3-2.9-1.8-7.2-2.3-10.6-1.3-.5.1-.9-.1-1.1-.6-.1-.5.1-.9.6-1.1 3.9-1.2 8.7-.6 12 1.4.4.3.5.9.3 1.3zm.1-2.7C15.4 8.2 9.5 8 6.1 9c-.6.2-1.2-.2-1.4-.7-.2-.6.2-1.2.7-1.4 4-.1.2 10.6.1 14.6 2.5.5.3.7 1 .4 1.5-.3.5-1 .7-1.5.4z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 12. Apple Music Official Icon
export function AppleMusicIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="appleMusicGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FB5C74" />
          <stop offset="100%" stopColor="#FA233B" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#appleMusicGrad)" />
      <path
        d="M16 5.8v8.6c0 1.4-1.2 2.6-2.6 2.6-1.4 0-2.6-1.2-2.6-2.6 0-1.4 1.2-2.6 2.6-2.6.5 0 1 .1 1.4.4V7.5L8.5 9v6.9c0 1.4-1.2 2.6-2.6 2.6-1.4 0-2.6-1.2-2.6-2.6 0-1.4 1.2-2.6 2.6-2.6.5 0 1 .1 1.4.4V7.2c0-.7.5-1.3 1.2-1.4l6.5-1.3c.6-.1 1.2.3 1.2.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 13. Pinterest Official Icon
export function PinterestIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#BD081C" />
      <path
        d="M12 4.5c-4.1 0-7.5 3.4-7.5 7.5 0 3.2 2 5.9 4.8 7-.1-.6-.1-1.5.1-2.1.2-.6 1.4-5.9 1.4-5.9s-.3-.7-.3-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4-.3 1.2.6 2.2 1.8 2.2 2.2 0 3.8-2.3 3.8-5.6 0-2.9-2.1-5-5.1-5-3.5 0-5.5 2.6-5.5 5.3 0 1 .4 2.2 1 2.8.1.1.1.2.1.4-.1.4-.3 1.3-.4 1.5-.1.2-.2.3-.4.2-1.7-.8-2.7-3.3-2.7-5.3 0-4.3 3.1-8.3 9.1-8.3 4.8 0 8.5 3.4 8.5 8 0 4.8-3 8.6-7.2 8.6-1.4 0-2.7-.7-3.2-1.6l-.9 3.3c-.3 1.2-1.1 2.7-1.7 3.6 1.1.3 2.3.5 3.5.5 4.1 0 7.5-3.4 7.5-7.5s-3.4-7.5-7.5-7.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 14. Threads Official Icon
export function ThreadsIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="5.5" fill="#000000" />
      <path
        d="M15.5 11.2c-.1-2.7-1.8-4.2-4.4-4.2-2.7 0-4.6 1.9-4.6 4.8 0 3 1.9 4.8 4.7 4.8 1.6 0 2.9-.6 3.7-1.7l-1.3-1c-.6.8-1.4 1.2-2.4 1.2-1.7 0-2.8-1-3-2.5h7.3zm-7.3-1c.2-1.4 1.2-2.3 2.8-2.3s2.6.9 2.8 2.3H8.2zm9.8 1.7c0 4.1-3 7.1-7 7.1-4.2 0-7.3-3.1-7.3-7.2s3.1-7.2 7.3-7.2c3 0 5.4 1.6 6.5 4l-1.6.8c-.8-1.8-2.6-3.1-4.9-3.1-3.3 0-5.6 2.4-5.6 5.5s2.3 5.5 5.6 5.5c3.2 0 5.4-2.2 5.4-5.4v-.8h-5.4v-1.7h7.1v2.5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 15. Calendly Official Icon
export function CalendlyIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#006BFF" />
      <path
        d="M12 6.5c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm0 8.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"
        fill="#FFFFFF"
      />
      <rect x="11.2" y="8.5" width="1.6" height="4" rx="0.8" fill="#FFFFFF" />
      <rect x="11.2" y="11" width="3.5" height="1.5" rx="0.75" fill="#FFFFFF" />
    </svg>
  );
}

// 16. TripAdvisor Official Icon
export function TripAdvisorIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#00AA6C" />
      <circle cx="8" cy="13" r="3" fill="#FFFFFF" />
      <circle cx="16" cy="13" r="3" fill="#FFFFFF" />
      <circle cx="8" cy="13" r="1.5" fill="#000000" />
      <circle cx="16" cy="13" r="1.5" fill="#000000" />
      <path
        d="M12 9.5c2 0 3.7.8 4.8 2.2l1.6-.7c-.4-.7-1-1.3-1.7-1.8 1.1-.3 1.8-.8 1.8-1.4 0-.8-1.5-1.3-3.5-1.3-1.3 0-2.4.2-3 .6-.6-.4-1.7-.6-3-.6-2 0-3.5.5-3.5 1.3 0 .6.7 1.1 1.8 1.4-.7.5-1.3 1.1-1.7 1.8l1.6.7c1.1-1.4 2.8-2.2 4.8-2.2z"
        fill="#FFFFFF"
      />
      <polygon points="12,13 10.5,15 13.5,15" fill="#FFFFFF" />
    </svg>
  );
}

// 17. PayPal Official Icon
export function PayPalIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#003087" />
      <path
        d="M16.5 8c-.2 1.4-1.2 2.8-2.8 3.5-.8.4-1.7.5-2.6.5h-1l-.8 5H6.8l2.2-13.5h4.6c1.6 0 2.9.4 3.6 1.4.6.8.6 1.9.3 3.1z"
        fill="#0079C1"
      />
      <path
        d="M14.5 10.5c-.2 1.4-1.2 2.8-2.8 3.5-.8.4-1.7.5-2.6.5h-1l-.8 5H4.8l2.2-13.5h4.6c1.6 0 2.9.4 3.6 1.4.6.8.6 1.9.3 3.1z"
        fill="#00457C"
      />
      <path
        d="M17.5 7.5c-.2 1.4-1.2 2.8-2.8 3.5-.8.4-1.7.5-2.6.5h-1l-.8 5H7.8l2.2-13.5h4.6c1.6 0 2.9.4 3.6 1.4.6.8.6 1.9.3 3.1z"
        fill="#0079C1"
      />
    </svg>
  );
}

// 18. Google Review Official Badge
export function GoogleReviewIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <GoogleIcon className="w-full h-full" size={size} />
      <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[9px] font-black shadow-xs">
        ★
      </div>
    </div>
  );
}

// 19. Phone Call Official Style Icon
export function PhoneBadgeIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#0284C7" />
      <path
        d="M16.4 14.5l-2-1c-.3-.2-.7-.1-.9.1l-.8 1c-1.3-.7-2.4-1.8-3.1-3.1l1-.8c.3-.2.3-.6.1-.9l-1-2c-.2-.3-.6-.5-.9-.4l-1.8.4c-.4.1-.7.4-.7.8 0 4.4 3.6 8 8 8 .4 0 .7-.3.8-.7l.4-1.8c.1-.3-.1-.7-.4-.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// 20. Mail / Gmail Official Style Icon
export function MailBadgeIcon({ className = 'w-5 h-5', size }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#9333EA" />
      <path
        d="M6 8.5v7c0 .6.4 1 1 1h10c.6 0 1-.4 1-1v-7l-6 4-6-4zm0-1l6 4 6-4H6z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// Helper to resolve the matching Official Brand Logo component based on URL or title
export function getOfficialBrandIcon(url: string, title?: string, className = 'w-5 h-5'): React.ReactNode {
  const u = (url || '').toLowerCase();
  const t = (title || '').toLowerCase();

  // 1. Google Maps Review / Rating
  if (
    u.includes('writereview') ||
    u.includes('/review') ||
    t.includes('reseña') ||
    t.includes('review') ||
    t.includes('califícanos') ||
    t.includes('calificanos')
  ) {
    return <GoogleReviewIcon className={className} />;
  }

  // 2. Google Maps / Location
  if (
    u.includes('maps.google') ||
    u.includes('goo.gl/maps') ||
    u.includes('maps.app.goo.gl') ||
    u.includes('waze.com') ||
    t.includes('google maps') ||
    t.includes('ubicación') ||
    t.includes('ubicacion') ||
    t.includes('cómo llegar')
  ) {
    return <GoogleMapsIcon className={className} />;
  }

  // 3. WhatsApp
  if (u.includes('wa.me') || u.includes('whatsapp.com') || t.includes('whatsapp') || t.includes('wsp')) {
    return <WhatsAppIcon className={className} />;
  }

  // 4. Instagram
  if (u.includes('instagram.com') || t.includes('instagram') || t.includes('insta')) {
    return <InstagramIcon className={className} />;
  }

  // 5. TikTok
  if (u.includes('tiktok.com') || t.includes('tiktok')) {
    return <TikTokIcon className={className} />;
  }

  // 6. Facebook
  if (u.includes('facebook.com') || u.includes('fb.com') || t.includes('facebook')) {
    return <FacebookIcon className={className} />;
  }

  // 7. LinkedIn
  if (u.includes('linkedin.com') || t.includes('linkedin')) {
    return <LinkedInIcon className={className} />;
  }

  // 8. YouTube
  if (u.includes('youtube.com') || u.includes('youtu.be') || t.includes('youtube')) {
    return <YouTubeIcon className={className} />;
  }

  // 9. X / Twitter
  if (u.includes('twitter.com') || u.includes('x.com') || t.includes('twitter') || t === 'x') {
    return <XTwitterIcon className={className} />;
  }

  // 10. Telegram
  if (u.includes('t.me') || u.includes('telegram.me') || t.includes('telegram')) {
    return <TelegramIcon className={className} />;
  }

  // 11. Spotify
  if (u.includes('spotify.com') || t.includes('spotify')) {
    return <SpotifyIcon className={className} />;
  }

  // 12. Apple Music
  if (u.includes('music.apple.com') || t.includes('apple music')) {
    return <AppleMusicIcon className={className} />;
  }

  // 13. Pinterest
  if (u.includes('pinterest.com') || t.includes('pinterest')) {
    return <PinterestIcon className={className} />;
  }

  // 14. Threads
  if (u.includes('threads.net') || t.includes('threads')) {
    return <ThreadsIcon className={className} />;
  }

  // 15. Calendly / Bookings
  if (u.includes('calendly.com') || u.includes('cal.com') || t.includes('calendly') || t.includes('agendar cita')) {
    return <CalendlyIcon className={className} />;
  }

  // 16. TripAdvisor
  if (u.includes('tripadvisor.com') || t.includes('tripadvisor')) {
    return <TripAdvisorIcon className={className} />;
  }

  // 17. PayPal
  if (u.includes('paypal.me') || u.includes('paypal.com') || t.includes('paypal')) {
    return <PayPalIcon className={className} />;
  }

  // 18. Phone / Call
  if (u.startsWith('tel:') || t.includes('llamar') || t.includes('teléfono') || t.includes('telefono')) {
    return <PhoneBadgeIcon className={className} />;
  }

  // 19. Email
  if (u.startsWith('mailto:') || t.includes('correo') || t.includes('email')) {
    return <MailBadgeIcon className={className} />;
  }

  return null;
}
