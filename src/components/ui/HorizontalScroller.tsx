import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface HorizontalScrollerProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  ariaLabel?: string;
  role?: string;
  showIndicators?: boolean;
  showArrowsOnDesktop?: boolean;
}

export interface HorizontalScrollerHandle {
  scrollBy: (amount: number) => void;
  scrollTo: (options: ScrollToOptions) => void;
  getContainer: () => HTMLDivElement | null;
}

export const HorizontalScroller = forwardRef<HorizontalScrollerHandle, HorizontalScrollerProps>(({
  children,
  className = '',
  innerClassName = '',
  ariaLabel,
  role = 'region',
  showIndicators = true,
  showArrowsOnDesktop = false,
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll bounds with small 2px tolerance for fractional subpixels
  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);

    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(maxScroll - scrollLeft > 2);
  }, []);

  useImperativeHandle(ref, () => ({
    scrollBy: (amount: number) => {
      containerRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
    },
    scrollTo: (options: ScrollToOptions) => {
      containerRef.current?.scrollTo({ behavior: 'smooth', ...options });
    },
    getContainer: () => containerRef.current
  }));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateScrollState();
      });
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    window.addEventListener('resize', updateScrollState, { passive: true });

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  // Support smooth arrow buttons on desktop if enabled
  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const offset = direction === 'left' ? -240 : 240;
    containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Keyboard navigation support for arrow keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.currentTarget.scrollBy({ left: 100, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      e.currentTarget.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={`relative w-full min-w-0 max-w-full group ${className}`}
      role={role}
      aria-label={ariaLabel}
    >
      {/* Indicador visual esquerdo (fade sutil quando há itens anteriores) */}
      {showIndicators && canScrollLeft && (
        <div 
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-10 transition-opacity duration-200"
        />
      )}

      {/* Seta discreta desktop esquerda */}
      {showArrowsOnDesktop && canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 items-center justify-center shadow-lg transition active:scale-90"
          aria-label="Rolar para esquerda"
          tabIndex={-1}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Container rolável nativo */}
      <div
        ref={containerRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={`
          flex w-full min-w-0 max-w-full
          items-center gap-2
          overflow-x-auto overflow-y-hidden
          overscroll-x-contain
          touch-pan-x
          scroll-smooth
          outline-none
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          ${innerClassName}
        `}
      >
        {children}
      </div>

      {/* Seta discreta desktop direita */}
      {showArrowsOnDesktop && canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 items-center justify-center shadow-lg transition active:scale-90"
          aria-label="Rolar para direita"
          tabIndex={-1}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Indicador visual direito (fade sutil quando há itens posteriores) */}
      {showIndicators && canScrollRight && (
        <div 
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-l from-slate-950 via-slate-950/90 to-transparent pointer-events-none z-10 transition-opacity duration-200"
        />
      )}
    </div>
  );
});

HorizontalScroller.displayName = 'HorizontalScroller';
