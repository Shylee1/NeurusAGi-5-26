import { useRef, useEffect, useState, useCallback } from 'react';

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  thumbnail?: string;
  author?: string;
}

interface SphereGalleryProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

// Fibonacci sphere — evenly distributes N points across a sphere
function fibonacciSphere(count: number) {
  const points: { theta: number; phi: number }[] = [];
  const goldenAngle = Math.PI * (1 + Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
    const phi = goldenAngle * i;
    points.push({ theta, phi });
  }
  return points;
}

export function SphereGallery({ articles, onArticleClick }: SphereGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotX = useRef(-15);
  const rotY = useRef(0);
  const targetX = useRef(-15);
  const targetY = useRef(0);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const autoRotate = useRef(true);
  const rafRef = useRef<number>(0);
  const [, setTick] = useState(0);

  // Checkerboard: build an interleaved tile list where article tiles
  // and logo tiles alternate across the sphere positions
  const TOTAL_TILES = Math.max(42, articles.length * 2);
  const points = fibonacciSphere(TOTAL_TILES);

  // Build checkerboard tile data: index determines article vs. logo
  // Even indices = article, odd = logo (checkerboard alternation)
  const buildTiles = () => {
    const tileArr: (typeof articles[number] | null)[] = [];
    let articleIdx = 0;
    for (let i = 0; i < TOTAL_TILES; i++) {
      if (i % 2 === 0 && articleIdx < articles.length) {
        tileArr.push(articles[articleIdx++]);
      } else {
        tileArr.push(null);
      }
    }
    return tileArr;
  };
  const tiles = buildTiles();

  const getRadius = () => {
    if (typeof window === 'undefined') return 210;
    if (window.innerWidth < 480) return 140;
    if (window.innerWidth < 768) return 175;
    return 230;
  };

  const [radius, setRadius] = useState(getRadius);
  useEffect(() => {
    const onResize = () => setRadius(getRadius());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getTileSize = () => {
    if (typeof window === 'undefined') return { w: 88, h: 60 };
    if (window.innerWidth < 480) return { w: 62, h: 44 };
    if (window.innerWidth < 768) return { w: 75, h: 52 };
    return { w: 90, h: 62 };
  };

  const [tile, setTile] = useState(getTileSize);
  useEffect(() => {
    const onResize = () => setTile(getTileSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (autoRotate.current && !dragging.current) {
      targetY.current += 0.18;
    }
    rotX.current += (targetX.current - rotX.current) * 0.07;
    rotY.current += (targetY.current - rotY.current) * 0.07;
    setTick(t => t + 1);
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  // Pointer drag
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    autoRotate.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    targetY.current += dx * 0.45;
    // Correct axis: dragging up tilts sphere up (positive dy = tilt down)
    targetX.current = Math.max(-75, Math.min(75, targetX.current - dy * 0.35));
  };
  const onPointerUp = () => {
    dragging.current = false;
    setTimeout(() => { autoRotate.current = true; }, 2500);
  };

  // Touch
  const lastTouch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    autoRotate.current = false;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - lastTouch.current.x;
    const dy = e.touches[0].clientY - lastTouch.current.y;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    targetY.current += dx * 0.45;
    targetX.current = Math.max(-75, Math.min(75, targetX.current - dy * 0.35));
  };
  const onTouchEnd = () => {
    dragging.current = false;
    setTimeout(() => { autoRotate.current = true; }, 2500);
  };

  const containerH = radius * 2 + tile.h * 2 + 24;

  return (
    <div
      ref={containerRef}
      className="relative select-none cursor-grab active:cursor-grabbing mx-auto"
      role="region"
      aria-label="Interactive article sphere. Drag to rotate the sphere or choose an article to read."
      style={{
        width: '100%',
        maxWidth: 900,
        height: containerH,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: `${radius * 5}px`,
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Ambient sphere glow */}
      <div
        style={{
          position: 'absolute',
          width: radius * 2.4,
          height: radius * 2.4,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,206,209,0.07) 0%, rgba(255,215,0,0.04) 45%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D scene root */}
      <div
        style={{
          position: 'relative',
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`,
        }}
      >
        {points.map((pt, i) => {
          const article = tiles[i] || null;
          const sinT = Math.sin(pt.theta);
          const cosT = Math.cos(pt.theta);
          const sinP = Math.sin(pt.phi);
          const cosP = Math.cos(pt.phi);

          const x = radius * sinT * cosP;
          const y = radius * sinT * sinP;
          const z = radius * cosT;

          // Face tile outward from center
          const ry = -Math.atan2(x, z) * (180 / Math.PI);
          const rx = Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

          return (
            <div
              key={i}
              onClick={(e) => {
                if (!dragging.current && article) {
                  e.stopPropagation();
                  onArticleClick(article);
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && article) {
                  e.preventDefault();
                  onArticleClick(article);
                }
              }}
              role={article ? 'button' : undefined}
              tabIndex={article ? 0 : -1}
              aria-label={article ? `Read article: ${article.title}` : undefined}
              title={article ? article.title : undefined}
              style={{
                position: 'absolute',
                width: tile.w,
                height: tile.h,
                marginLeft: -(tile.w / 2),
                marginTop: -(tile.h / 2),
                transform: `rotateY(${ry}deg) rotateX(${rx}deg) translateZ(${radius}px)`,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                cursor: article ? 'pointer' : 'default',
                borderRadius: 7,
                overflow: 'hidden',
                border: article
                  ? '1px solid rgba(0,206,209,0.45)'
                  : '1px solid rgba(0,206,209,0.1)',
                boxShadow: article
                  ? '0 0 14px rgba(0,206,209,0.25), inset 0 0 8px rgba(0,0,0,0.5)'
                  : 'none',
                transition: 'box-shadow 0.2s ease',
              }}
              className={article ? 'sphere-tile' : ''}
            >
              {article ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: article.thumbnail ? `url(${article.thumbnail})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'rgba(0,6,10,0.85)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '4px 6px',
                    }}
                  >
                    <p
                      style={{
                        fontSize: tile.w < 70 ? '7px' : '8.5px',
                        fontWeight: 600,
                        color: '#d0ffff',
                        lineHeight: 1.25,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                        margin: 0,
                      }}
                    >
                      {article.title}
                    </p>
                  </div>
                </div>
              ) : (
                // Empty tile — logo placeholder
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url('/neurus-logo-bg.jpeg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.12,
                    backgroundColor: '#000',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <nav className="sr-only" aria-label="Article links">
        <ul>
          {articles.map((article) => (
            <li key={article.id}>
              <a href={`/news/${article.id}`}>{article.title}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hint text */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 4,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px',
          color: 'rgba(0,206,209,0.45)',
          pointerEvents: 'none',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Drag to spin &bull; Click to read
      </div>
    </div>
  );
}
