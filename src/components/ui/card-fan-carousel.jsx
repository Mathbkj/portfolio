import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";
import gsap from "gsap";

const MAX_VISIBLE = 7;
const HALF = 3;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7,  scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0,   scale: 1.0,    x: 0,   y: 0.0, zIndex: 10 },
  { rot: 7,   scale: 0.9346, x: 11,  y: 1.3, zIndex: 3 },
  { rot: 14,  scale: 0.8498, x: 22,  y: 4.0, zIndex: 2 },
  { rot: 21,  scale: 0.7756, x: 30,  y: 7.3, zIndex: 1 },
];

function getResponsiveMultiplier(width) {
  if (width < 480) return 0.28;
  if (width < 640) return 0.38;
  if (width < 768) return 0.5;
  if (width < 1024) return 0.75;
  return 1.0;
}

// Returns a multiplier (0..1] that scales y-offsets and entry animation
// distances when the viewport is too short for the ideal layout height.
function getHeightMultiplier(width) {
  // Ideal layout heights (in px at 16px root) matching the CSS breakpoints
  let idealPx;
  if (width < 480) idealPx = 22 * 16;
  else if (width < 640) idealPx = 26 * 16;
  else if (width < 768) idealPx = 28 * 16;
  else if (width < 1024) idealPx = 34 * 16;
  else idealPx = 38 * 16;

  const available = window.innerHeight * 0.7; // 70vh budget
  if (available >= idealPx) return 1;
  return available / idealPx;
}

function getSlotConfig(totalCards, slot) {
  if (totalCards >= MAX_VISIBLE) return FAN_POSITIONS[slot];
  // Fractional center keeps an even count symmetric (e.g. 4 cards: 1.5).
  const center = (totalCards - 1) / 2;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  // Fewer cards span proportionally less width than the full 7-card fan.
  const spread = (totalCards - 1) / (MAX_VISIBLE - 1);
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30 * spread,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.ceil(Math.abs(slot - center)),
  };
}

const ARROW_CLASSES =
  "relative flex items-center justify-center rounded-full border-[1.5px] border-black/10 bg-black/5 backdrop-blur-[16px] text-black/40 cursor-pointer shrink-0 z-30 outline-none shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:border-black/25 hover:text-black/70 active:opacity-70 transition-colors duration-300 before:content-[''] before:absolute before:inset-[3px] before:rounded-full before:border before:border-black/[0.04] before:pointer-events-none";

// On-screen box of a fanned card, unrotated: its center plus its scaled size
// and current rotation, so a fixed clone can start exactly on top of it.
function getCardBox(el) {
  const rect = el.getBoundingClientRect();
  const scale = gsap.getProperty(el, "scale");
  const width = el.offsetWidth * scale;
  const height = el.offsetHeight * scale;
  return {
    left: rect.left + rect.width / 2 - width / 2,
    top: rect.top + rect.height / 2 - height / 2,
    width,
    height,
    rotation: gsap.getProperty(el, "rotation"),
  };
}

// Clicked card, enlarged: a fixed clone flies from the card to the viewport
// center over a darkened backdrop, with the project link top-right. Closing
// (backdrop click or Escape) flies it back before unmounting.
function FocusOverlay({ card, fromEl, onClosed }) {
  const backdropRef = useRef(null);
  const imgRef = useRef(null);
  const linkRef = useRef(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const source = fromEl.querySelector("img");
    const ratio = source?.naturalWidth ? source.naturalWidth / source.naturalHeight : 16 / 10;
    const width = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.75 * ratio);
    const height = width / ratio;

    gsap.set(imgRef.current, getCardBox(fromEl));
    gsap.to(imgRef.current, {
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - height) / 2,
      width,
      height,
      rotation: 0,
      duration: 0.7,
      ease: "power3.inOut",
    });
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    gsap.fromTo(linkRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.5 });
  }, [fromEl]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    gsap.to(linkRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.5, delay: 0.2 });
    gsap.to(imgRef.current, {
      ...getCardBox(fromEl),
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: onClosed,
    });
  }, [fromEl, onClosed]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div ref={backdropRef} className="absolute inset-0 bg-black/75" onClick={close} />
      <img
        ref={imgRef}
        src={card.imgUrl}
        alt={card.alt || ""}
        className="fixed rounded-2xl object-cover shadow-2xl"
        onClick={close}
      />
      <div ref={linkRef} className="absolute top-6 right-6 text-right md:top-10 md:right-12">
        <p className="text-sm tracking-widest text-white/60 uppercase">{card.title}</p>
        {card.linkUrl ? (
          <a
            href={card.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl text-white underline-offset-4 hover:underline md:text-4xl"
          >
            View project ↗
          </a>
        ) : (
          <span className="font-heading text-3xl text-white/60 md:text-4xl">Link coming soon</span>
        )}
      </div>
    </div>,
    document.body
  );
}

// Fan of image cards; with more than MAX_VISIBLE cards, arrows cycle through
// them. Clicking a card opens it in FocusOverlay.
// cards: [{ imgUrl, alt?, title?, linkUrl? }]
export default function CardFanCarousel({ cards }) {
  const [focused, setFocused] = useState(null); // { index, el }
  const lenis = useLenis();
  const containerRef = useRef(null);
  const isAnimating = useRef(false);
  const hasEntered = useRef(false);
  const directionRef = useRef(null);
  const prevVisible = useRef(new Set());

  const totalCards = cards.length;
  const needsPagination = totalCards > MAX_VISIBLE;
  const [centerIndex, setCenterIndex] = useState(needsPagination ? HALF : totalCards >> 1);

  const getVisibleMap = useCallback((center) => {
    const map = new Map();
    if (!needsPagination) {
      cards.forEach((_, i) => map.set(i, i));
      return map;
    }
    for (let slot = 0; slot < MAX_VISIBLE; slot++) {
      map.set(((center + slot - HALF) % totalCards + totalCards) % totalCards, slot);
    }
    return map;
  }, [totalCards, needsPagination, cards]);

  const cycle = useCallback((direction) => {
    if (isAnimating.current || !needsPagination) return;
    isAnimating.current = true;
    directionRef.current = direction;
    setCenterIndex(prev =>
      direction === "right" ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
    );
  }, [totalCards, needsPagination]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) return;

    const cardElements = Array.from(container.querySelectorAll(".fan-card"));
    if (!cardElements.length) return;

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisible.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEntered.current;
    const multiplier = getResponsiveMultiplier(window.innerWidth);
    const hMult = getHeightMultiplier(window.innerWidth);
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
    const config = (slot) => getSlotConfig(slotCount, slot);

    if (isFirstMount) isAnimating.current = true;

    let completedCount = 0;
    const visibleCount = visibleMap.size;
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false;
        if (isFirstMount) hasEntered.current = true;
      }
    };

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        };

        if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${12 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 1.2, ease: "elastic.out(1.05,.78)", delay: 0.2 + slot * 0.06, onComplete: onCardDone });
        } else if (!wasVisible) {
          const enterX = direction === "right" ? 40 : -40;
          gsap.set(card, { x: `${enterX}rem`, y: `${y * hMult}rem`, rotation: direction === "right" ? 30 : -30, scale: 0.5, opacity: 0 });
          gsap.to(card, { ...target, duration: 0.6, ease: "power2.out", onComplete: onCardDone });
        } else {
          gsap.to(card, { ...target, duration: 0.5, ease: "power2.out", onComplete: onCardDone });
        }
      } else if (wasVisible) {
        const exitX = direction === "right" ? -40 : 40;
        gsap.to(card, { x: `${exitX}rem`, opacity: 0, scale: 0.5, rotation: direction === "right" ? -30 : 30, duration: 0.4, ease: "power2.in", zIndex: 0 });
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    prevVisible.current = new Set(visibleMap.keys());

    // Hover interactions
    const visibleEntries = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) visibleEntries.push({ el, slot });
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot = null;
    let leaveTimer = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot) => {
      const mult = getResponsiveMultiplier(window.innerWidth);
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= 2.5 * hM;
            targetScale *= 1.08;
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength = 8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= 3 / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += 3 / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= 1 * hM;
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= 1 * hM;
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${targetX}rem`, y: `${targetY}rem`, rotation: targetRot, scale: targetScale,
          duration: 0.5, delay, ease: "elastic.out(1,.75)", overwrite: "auto",
        });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return;
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
        if (activeSlot !== slot) { activeSlot = slot; updateHoverLayout(slot); }
      };
      el.addEventListener("mouseenter", handler);
      return { el, handler };
    });

    const onMouseLeave = () => {
      if (isAnimating.current) return;
      if (leaveTimer) clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { activeSlot = null; updateHoverLayout(null); }, 50);
    };
    container.addEventListener("mouseleave", onMouseLeave);

    const onResize = () => { if (!isAnimating.current) updateHoverLayout(activeSlot); };
    window.addEventListener("resize", onResize);

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener("mouseenter", handler));
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
      if (leaveTimer) clearTimeout(leaveTimer);
    };
  }, [centerIndex, totalCards, getVisibleMap, needsPagination]);

  // Freeze page scroll while a card is focused, so it stays aligned with the
  // card it flies back to.
  useEffect(() => {
    if (!focused) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [focused, lenis]);

  const handleClosed = useCallback(() => setFocused(null), []);

  if (!totalCards) return null;

  const chevron = (direction) => (
    <svg className="relative z-[2] w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  );

  return (
    <div className="flex flex-col items-center w-full py-4 lg:py-8 px-4 md:px-8 relative z-20">
      <div className="flex items-center justify-center w-full max-w-[90rem]">
        <div ref={containerRef} className="fan-layout flex relative justify-center items-center w-full max-w-[80rem]">
          {cards.map((card, index) => {
            const image = (
              <div className="relative w-full h-full overflow-hidden">
                <img src={card.imgUrl} loading="lazy" alt={card.alt || `Card ${index}`} className="absolute inset-0 w-full h-full object-cover z-10" />
              </div>
            );
            const open = (e) => setFocused({ index, el: e.currentTarget });
            return (
              <div
                key={index}
                role="button"
                tabIndex={0}
                aria-label={card.title || card.alt || `Card ${index}`}
                onClick={open}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } }}
                // Hidden (not removed) while focused so the clone can fly back to its box.
                className={`fan-card cursor-pointer ${focused?.index === index ? "invisible" : ""}`}
              >
                {image}
              </div>
            );
          })}
        </div>
      </div>

      {needsPagination && (
        <div className="flex items-center justify-center gap-4 mt-4 md:mt-6 z-30">
          <button className={`${ARROW_CLASSES} w-10 h-10 md:w-12 md:h-12`} onClick={() => cycle("left")} aria-label="Previous">
            {chevron("left")}
          </button>
          <div className="flex items-center gap-2">
            {cards.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === centerIndex ? "bg-black/70 scale-[1.3]" : "bg-black/15"}`} />
            ))}
          </div>
          <button className={`${ARROW_CLASSES} w-10 h-10 md:w-12 md:h-12`} onClick={() => cycle("right")} aria-label="Next">
            {chevron("right")}
          </button>
        </div>
      )}

      {focused && (
        <FocusOverlay card={cards[focused.index]} fromEl={focused.el} onClosed={handleClosed} />
      )}
    </div>
  );
}
