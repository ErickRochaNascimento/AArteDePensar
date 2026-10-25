"use client";

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
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
  /** "authors" usa itens menores. */
  variant?: "books" | "authors";
  /** Tempo entre um avanço automático e outro, em ms. */
  intervalMs?: number;
  /**
   * Laço infinito: repete os itens para que o carrossel sempre se mova, mesmo
   * quando todos cabem na tela (ex.: poucos autores).
   */
  loop?: boolean;
};

const EDGE = 4; // tolerância (px) ao comparar posições de rolagem
const DRAG_THRESHOLD = 6; // px de arrasto antes de virar "arrastar"
const IDLE_AFTER_INTERACTION = 4000; // ms sem avançar após o usuário mexer
const MAX_PER_VIEW = 7; // maior número de itens visíveis (ver CSS)
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Carrossel de uma única linha. Movimento por:
// - rolagem automática (pausa com mouse em cima, foco e toque);
// - arrastar com o mouse e deslizar com o dedo (rolagem nativa + snap);
// - setas anterior/próximo nas laterais, no meio do carrossel.
// Quem prefere menos movimento (configuração do sistema) continua com a
// rolagem automática, mas os avanços são instantâneos, sem animação suave.
export function Carousel({
  label,
  children,
  variant = "books",
  intervalMs = 4500,
  loop = false,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );

  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const touchRef = useRef(false);
  const lastInteractionRef = useRef(0);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startScroll: 0, pointerId: -1 });
  const suppressClickRef = useRef(false);
  const settleTimerRef = useRef<number | undefined>(undefined);

  const items = Children.toArray(children);
  const count = items.length;
  const looping = loop && count >= 2;
  // Cópias suficientes para nunca faltar item dos dois lados; a do meio é a "real".
  const copies = looping ? Math.max(3, Math.ceil((MAX_PER_VIEW * 3) / count)) : 1;
  const realSet = 1;

  const setWidth = useCallback(() => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    const next = track?.children[count] as HTMLElement | undefined;
    if (!first || !next) return 0;
    return next.offsetLeft - first.offsetLeft;
  }, [count]);

  // Mantém a rolagem dentro da cópia do meio sem que se perceba o salto.
  const normalize = useCallback(() => {
    const track = trackRef.current;
    if (!track || !looping) return;
    const width = setWidth();
    if (width <= 0) return;
    const x = track.scrollLeft;
    if (x < width * 0.5) track.scrollLeft = x + width;
    else if (x >= width * 1.5) track.scrollLeft = x - width;
  }, [looping, setWidth]);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setOverflowing(looping || track.scrollWidth - track.clientWidth > EDGE);
    normalize();
  }, [looping, normalize]);

  // Posição inicial do laço: início da cópia real.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || !looping) return;
    track.scrollLeft = setWidth() * realSet;
  }, [looping, setWidth]);

  // Detecta se há mais itens do que cabem na tela (e reage a redimensionamentos).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, count]);

  // Cópias do laço não entram na ordem de tabulação nem na leitura de tela.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !looping) return;
    track
      .querySelectorAll<HTMLElement>("[data-clone] a, [data-clone] button")
      .forEach((el) => el.setAttribute("tabindex", "-1"));
  }, [looping, count, copies]);

  useEffect(() => () => window.clearTimeout(settleTimerRef.current), []);

  const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

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
      const size = stepSize();
      const delta = (amount === "item" ? size.item : size.page) * direction;

      if (looping) {
        track.scrollBy({ left: delta, behavior });
        return;
      }
      const max = track.scrollWidth - track.clientWidth;
      if (direction === 1 && track.scrollLeft >= max - EDGE) {
        track.scrollTo({ left: 0, behavior });
      } else if (direction === -1 && track.scrollLeft <= EDGE) {
        track.scrollTo({ left: max, behavior });
      } else {
        track.scrollBy({ left: delta, behavior });
      }
    },
    [behavior, looping, stepSize],
  );

  const markInteraction = () => {
    lastInteractionRef.current = Date.now();
  };

  // Rolagem automática.
  const autoplay = overflowing;
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

  // Quando a rolagem para, o laço volta para a cópia do meio.
  const onScroll = () => {
    if (!looping) return;
    window.clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(normalize, 140);
  };

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
      normalize();
    }
    dragRef.current = { ...drag, active: false, moved: false };
  };

  const showControls = overflowing;

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
      <div className="carousel-stage">
        <div
          ref={trackRef}
          className={dragging ? "carousel-track is-dragging" : "carousel-track"}
          aria-live={autoplay ? "off" : "polite"}
          onScroll={onScroll}
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
          {Array.from({ length: copies }).flatMap((_, copy) =>
            items.map((child, index) => {
              const clone = looping && copy !== realSet;
              return (
                <div
                  className="carousel-item"
                  key={`${copy}-${index}`}
                  {...(clone ? { "data-clone": "", "aria-hidden": true } : {})}
                >
                  {child}
                </div>
              );
            }),
          )}
        </div>

        {showControls && (
          <>
            <button
              type="button"
              className="carousel-btn carousel-btn--prev"
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
              className="carousel-btn carousel-btn--next"
              aria-label={`${label}: próximo`}
              onClick={() => {
                markInteraction();
                move(1, "page");
              }}
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

    </div>
  );
}
