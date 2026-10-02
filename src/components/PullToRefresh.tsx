import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  lastUpdated?: Date | null;
}

type PullStatus = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'success';

const THRESHOLD = 65; // Distance in px needed to trigger refresh
const MAX_PULL = 110;  // Maximum visual drag limit

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  className = '',
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [status, setStatus] = useState<PullStatus>('idle');
  const [isGestureActive, setIsGestureActive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const hasVibratedRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to reliably retrieve vertical scroll position across window, iframe, and body
  const getScrollTop = (): number => {
    if (typeof window === 'undefined') return 0;
    return (
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  };

  // Clean up safety timeout on unmount
  useEffect(() => {
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  // Calculate damped pull distance (spring resistance)
  const calculateDampedPull = (rawDelta: number): number => {
    if (rawDelta <= 0) return 0;
    const damped = Math.pow(rawDelta, 0.82) * 0.7;
    return Math.min(MAX_PULL, damped);
  };

  // Perform refresh action with strict timeout safeguard
  const triggerRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setStatus('refreshing');
    setPullDistance(52); // Keep indicator visible during refresh

    // Safety timeout: reset after 5s max even if Firestore query hangs
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
      if (isRefreshingRef.current) {
        setPullDistance(0);
        setStatus('idle');
        isRefreshingRef.current = false;
      }
    }, 5000);

    try {
      await onRefresh();
      setStatus('success');
      // Gentle haptic feedback on completion
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(15);
        } catch {
          // Ignore
        }
      }
      setTimeout(() => {
        setPullDistance(0);
        setTimeout(() => {
          setStatus('idle');
          isRefreshingRef.current = false;
        }, 300);
      }, 600);
    } catch (err) {
      console.error('Refresh error:', err);
      setPullDistance(0);
      setTimeout(() => {
        setStatus('idle');
        isRefreshingRef.current = false;
      }, 300);
    } finally {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    }
  }, [onRefresh]);

  // -------------------------------------------------------------
  // TOUCH EVENT HANDLERS (Mobile / Tablets)
  // Designed so scrolling DOWN the page is NEVER hindered or trapped
  // -------------------------------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshingRef.current) return;

    // Only allow initiating a pull if strictly at the top of page
    if (getScrollTop() > 3) {
      startYRef.current = null;
      startXRef.current = null;
      isPullingRef.current = false;
      return;
    }

    startYRef.current = e.touches[0].clientY;
    startXRef.current = e.touches[0].clientX;
    isPullingRef.current = false;
    hasVibratedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshingRef.current || startYRef.current === null || startXRef.current === null) {
      return;
    }

    // If user has scrolled down anywhere, cancel pull immediately so native page scrolling proceeds
    if (getScrollTop() > 3) {
      if (isPullingRef.current) {
        isPullingRef.current = false;
        setPullDistance(0);
        setStatus('idle');
        setIsGestureActive(false);
      }
      return;
    }

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - startYRef.current;
    const deltaX = currentX - startXRef.current;

    // ESSENTIAL: If deltaY <= 0 (finger moving up, user scrolling DOWN the page to see links),
    // NEVER intercept or prevent! Let native browser scrolling handle everything with 100% speed.
    if (deltaY <= 0) {
      if (isPullingRef.current) {
        isPullingRef.current = false;
        setPullDistance(0);
        setStatus('idle');
        setIsGestureActive(false);
      }
      return;
    }

    // Only treat as pull-down if gesture is clearly vertical and moving downward
    if (!isPullingRef.current) {
      if (deltaY > 10 && deltaY > Math.abs(deltaX) * 1.3) {
        isPullingRef.current = true;
        setIsGestureActive(true);
      } else {
        return;
      }
    }

    if (isPullingRef.current && deltaY > 0) {
      const damped = calculateDampedPull(deltaY);
      setPullDistance(damped);

      if (damped >= THRESHOLD) {
        if (!hasVibratedRef.current) {
          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate?.(10);
            } catch {
              // Ignore
            }
          }
          hasVibratedRef.current = true;
        }
        setStatus('ready');
      } else {
        hasVibratedRef.current = false;
        setStatus('pulling');
      }
    }
  };

  const handleTouchEnd = () => {
    startYRef.current = null;
    startXRef.current = null;
    setIsGestureActive(false);

    if (disabled || isRefreshingRef.current) return;
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullDistance >= THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
      setStatus('idle');
    }
  };

  // -------------------------------------------------------------
  // MOUSE DRAG HANDLERS (Desktop / Trackpad emulation)
  // Allows testing "deslizar hacia abajo" on computers without locking links or text
  // -------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isRefreshingRef.current) return;
    if (e.button !== 0) return; // Only primary mouse button
    if (getScrollTop() > 3) return;

    // Do NOT capture clicks on interactive elements (links, buttons, inputs)
    const target = e.target as HTMLElement;
    if (target.closest('a, button, input, select, textarea, [role="button"], img')) {
      return;
    }

    startYRef.current = e.clientY;
    startXRef.current = e.clientX;
    isMouseDownRef.current = true;
    isPullingRef.current = false;
    hasVibratedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || disabled || isRefreshingRef.current || startYRef.current === null) {
      return;
    }

    if (getScrollTop() > 3) {
      isMouseDownRef.current = false;
      isPullingRef.current = false;
      setPullDistance(0);
      setStatus('idle');
      setIsGestureActive(false);
      return;
    }

    const deltaY = e.clientY - startYRef.current;
    if (deltaY <= 0) {
      if (isPullingRef.current) {
        isPullingRef.current = false;
        setPullDistance(0);
        setStatus('idle');
        setIsGestureActive(false);
      }
      return;
    }

    if (deltaY > 12) {
      isPullingRef.current = true;
      setIsGestureActive(true);
      const damped = calculateDampedPull(deltaY);
      setPullDistance(damped);

      if (damped >= THRESHOLD) {
        setStatus('ready');
      } else {
        setStatus('pulling');
      }
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    setIsGestureActive(false);
    startYRef.current = null;
    startXRef.current = null;

    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullDistance >= THRESHOLD) {
      triggerRefresh();
    } else {
      setPullDistance(0);
      setStatus('idle');
    }
  };

  // Rotation percentage for pull progress icon
  const progressRatio = Math.min(1, pullDistance / THRESHOLD);
  const arrowRotation = status === 'ready' ? 180 : Math.round(progressRatio * 180);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Pull-To-Refresh Floating Indicator */}
      <div
        id="pull-to-refresh-indicator"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all"
        style={{
          transform: `translateY(${Math.max(-50, pullDistance - 44)}px)`,
          opacity: pullDistance > 8 || status === 'refreshing' || status === 'success' ? 1 : 0,
          transition: isGestureActive ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        }}
      >
        <div className="mx-auto flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-slate-100 text-xs font-medium">
          {status === 'refreshing' && (
            <>
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin flex-shrink-0" />
              <span className="text-slate-200 font-medium">Actualizando datos...</span>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
              </div>
              <span className="text-emerald-300 font-semibold">¡Datos actualizados!</span>
            </>
          )}

          {status === 'ready' && (
            <>
              <div
                className="w-4 h-4 text-amber-400 flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                <ArrowDown className="w-4 h-4" />
              </div>
              <span className="text-amber-300 font-semibold">Suelta para actualizar</span>
            </>
          )}

          {status === 'pulling' && (
            <>
              <div
                className="w-4 h-4 text-slate-400 flex items-center justify-center flex-shrink-0 transition-transform duration-100"
                style={{ transform: `rotate(${arrowRotation}deg)` }}
              >
                <ArrowDown className="w-4 h-4" />
              </div>
              <span className="text-slate-300">Desliza para actualizar</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content with smooth displacement ONLY during active pull gesture */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${Math.round(pullDistance * 0.4)}px)` : 'none',
          transition: isGestureActive ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
