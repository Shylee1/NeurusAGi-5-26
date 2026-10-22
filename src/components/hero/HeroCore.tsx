import { useEffect, useRef, useState, type ComponentType } from 'react';

/**
 * Mounts The Core behind the hero once the page is interactive.
 *
 * The three.js scene is imported dynamically so it never blocks first paint,
 * never runs during prerendering, and stays out of the entry chunk.
 */
type SceneProps = {
  animate: boolean;
  density: 'low' | 'high';
  scrollRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
};

export function HeroCore() {
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [visible, setVisible] = useState(true);
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvases = document.createElement('canvas');
    const supported = Boolean(
      canvases.getContext('webgl2') || canvases.getContext('webgl'),
    );
    if (!supported) return;

    let cancelled = false;
    let idle = 0 as unknown as number;

    // Wait for the browser to be idle so the headline paints first.
    const start = () => {
      import('./NeuralCoreScene').then((module) => {
        if (!cancelled) setScene(() => module.NeuralCoreScene);
      });
    };

    const idleApi = window as unknown as {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
    };
    if (idleApi.requestIdleCallback) {
      idle = idleApi.requestIdleCallback(start, { timeout: 1500 });
    } else {
      idle = window.setTimeout(start, 600);
    }

    return () => {
      cancelled = true;
      const idleApiWindow = window as unknown as { cancelIdleCallback?: (id: number) => void };
      if (idleApiWindow.cancelIdleCallback) idleApiWindow.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const height = window.innerHeight || 1;
      scrollRef.current = Math.min(window.scrollY / height, 1);
      if (hostRef.current) {
        hostRef.current.style.opacity = String(Math.max(0, 1 - scrollRef.current * 0.9));
      }
    };
    const onPointer = (event: PointerEvent) => {
      pointerRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -((event.clientY / window.innerHeight) * 2 - 1),
      };
    };
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    if (hostRef.current) observer.observe(hostRef.current);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-hero-core
      className="pointer-events-none absolute inset-0 z-0"
      style={{ transition: 'opacity 120ms linear' }}
    >
      {/* Static glow: what renders before the scene loads, and the whole
          visual for visitors who ask for reduced motion. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 'min(78vw, 640px)',
          height: 'min(78vw, 640px)',
          background:
            'radial-gradient(circle, rgba(0,206,209,0.16) 0%, rgba(0,206,209,0.05) 42%, transparent 70%)',
          filter: 'blur(6px)',
        }}
      />
      {Scene && visible && (
        <Scene
          animate={!reducedMotion}
          density={window.innerWidth < 768 ? 'low' : 'high'}
          scrollRef={scrollRef}
          pointerRef={pointerRef}
        />
      )}
    </div>
  );
}
