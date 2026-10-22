import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Click-to-play video.
 *
 * The player is not embedded until someone asks for it: no YouTube cookies, no
 * third-party scripts and no 900KB of player code on a page whose job is to load
 * fast. The poster is the video's own thumbnail.
 */
const VIDEO_ID = 'NJoZmaGKFcs';
const VIDEO_TITLE = 'What Real AGI Actually Looks Like';

export function VideoFeature() {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        border: '1px solid rgba(0,206,209,0.22)',
        boxShadow: '0 0 60px rgba(0,206,209,0.12), 0 24px 60px rgba(0,0,0,0.55)',
        background: '#000',
      }}
    >
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`}
            title={VIDEO_TITLE}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            data-video-play
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <span className="sr-only">Play video: </span>
            <img
              src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
              onError={(event) => {
                const img = event.currentTarget;
                if (!img.src.includes('hqdefault')) {
                  img.src = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`;
                }
              }}
              alt=""
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: 0.82 }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
              style={{
                width: 84,
                height: 84,
                marginLeft: -42,
                marginTop: -42,
                background: 'rgba(0,206,209,0.92)',
                boxShadow: '0 0 0 12px rgba(0,206,209,0.12), 0 0 40px rgba(0,206,209,0.45)',
              }}
            >
              <Play className="w-9 h-9 text-black" fill="currentColor" />
            </span>
            <span className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="text-sm sm:text-base font-semibold text-white">
                {VIDEO_TITLE}
              </span>
              <span className="text-xs text-white/70 tabular-nums">2:48</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
