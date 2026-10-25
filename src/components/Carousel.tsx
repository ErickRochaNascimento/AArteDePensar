"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type Props = {
  /** Nome do carrossel para leitores de tela (ex.: "Mais vendidos"). */
  label: string;
  children: ReactNode;
  /** Quantos itens cabem por vez; "authors" usa itens menores. */
  variant?: "books" | "authors";
  /** Tempo entre um avanço automático e outro, em ms. */
  intervalMs?: number;
};

const EDGE = 4; // tolerância (px) ao comparar posições de rolagem
const DRAG_THRESHOLD = 6; // px de arrasto antes de virar "arrastar"
const IDLE_AFTER_INTERACTION = 4000; // ms sem avançar após o usuário mexer
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Carrossel de uma única linha. Movimento por:
// - rolagem automática (pausa com mouse em cima, foco, toque, botão de pausa
//   e para quem prefere menos movimento);
// - arrastar com o mouse e deslizar com o dedo (rolagem nativa + snap);
// - setas anterior/próximo, que dão a volta ao chegar no fim.
export function Carousel({ label, children, variant = "books", intervalMs = 4500 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [playing, setPlaying] = useState(true);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  const [dragging, setDragging] = useState(false);

  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const touchRef = useRef(false);
  const lastInteractionRef = useRef(0);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startScroll: 0, pointerId: -1 });
  const suppressClickRef = useRef(false);

  const items = Children.toArray(children);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setOverflowing(track.scrollWidth - track.clientWidth > EDGE);
  }, []);

  // Detecta se há mais itens do que cabem na tela (e reage a redimensionamentos).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, items.length]);

  const behavior = reducedMotion ? "auto" : "smooth";

  const stepSize = useCallback(() => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return { item: 0, page: 0 };
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const item = first.getBoundingClientRect().width + gap;
    const perView = Math.max(1, Math.floor((track.clientWidth + gap) / item));
    return { item, page: item * perView };
  }, []);

  const move = useCallback(
    (direction: 1 | -1, amount: "item" | "page") => {
      const track = trackRef.current;
      if (!track) return;
      const max = track.scrollWidth - track.clientWidth;
      const size = stepSize();
      const delta = (amount === "item" ? size.item : size.page) * direction;
      if (direction === 1 && track.scrollLeft >= max - EDGE) {
        track.scrollTo({ left: 0, behavior });
      } else if (direction === -1 && track.scrollLeft <= EDGE) {
        track.scrollTo({ left: max, behavior });
      } else {
        track.scrollBy({ left: delta, behavior });
      }
    },
    [behavior, stepSize],
  );

  const markInteraction = () => {
    lastInteractionRef.current = Date.now();
  };

  // Rolagem automática.
  const autoplay = playing && overflowing && !reducedMotion;
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (hoverRef.current || focusRef.current || touchRef.current) return;
      if (dragRef.current.active) return;
      if (Date.now() - lastInteractionRef.current < IDLE_AFTER_INTERACTION) return;
      move(1, "item");
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [autoplay, intervalMs, move]);

  // Arrastar com o mouse (toque usa a rolagem nativa do navegador).
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      pointerId: event.pointerId,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag.active || !track || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      drag.moved = true;
      setDragging(true);
      track.setPointerCapture(event.pointerId);
    }
    track.scrollLeft = drag.startScroll - dx;
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active || event.pointerId !== drag.pointerId) return;
    const track = trackRef.current;
    if (drag.moved) {
      suppressClickRef.current = true; // evita abrir o link ao soltar o arrasto
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
      if (track?.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
      setDragging(false);
      markInteraction();
    }
    dragRef.current = { ...drag, active: false, moved: false };
  };

  const controlsHidden = !overflowing;

  return (
    <div
      className={`carousel carousel--${variant}`}
      role="group"
      aria-roledescription="carrossel"
      aria-label={label}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hoverRef.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") hoverRef.current = false;
      }}
      onFocusCapture={() => {
        focusRef.current = true;
      }}
      onBlurCapture={() => {
        focusRef.current = false;
        markInteraction();
      }}
    >
      <div
        ref={trackRef}
        className={dragging ? "carousel-track is-dragging" : "carousel-track"}
        aria-live={autoplay ? "off" : "polite"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onDragStart={(event) => event.preventDefault()}
        onTouchStart={() => {
          touchRef.current = true;
          markInteraction();
        }}
        onTouchEnd={() => {
          touchRef.current = false;
          markInteraction();
        }}
        onTouchCancel={() => {
          touchRef.current = false;
        }}
        onWheel={markInteraction}
      >
        {items.map((child, index) => (
          <div className="carousel-item" key={index}>
            {child}
          </div>
        ))}
      </div>

      {!controlsHidden && (
        <div className="carousel-foot">
          {!reducedMotion ? (
            <button
              type="button"
              className="carousel-pause"
              aria-pressed={!playing}
              onClick={() => setPlaying((value) => !value)}
            >
              <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>{" "}
              {playing ? "Pausar rolagem automática" : "Retomar rolagem automática"}
            </button>
          ) : (
            <span />
          )}
          <div className="carousel-arrows">
            <button
              type="button"
              className="carousel-btn"
              aria-label={`${label}: anterior`}
              onClick={() => {
                markInteraction();
                move(-1, "page");
              }}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              className="carousel-btn"
              aria-label={`${label}: próximo`}
              onClick={() => {
                markInteraction();
                move(1, "page");
              }}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
