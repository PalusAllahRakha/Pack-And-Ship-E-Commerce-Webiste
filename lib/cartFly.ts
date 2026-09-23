export function flyProductToCart(imageSrc: string, fromElement: HTMLElement | null) {
  const target = document.getElementById("cart-icon-target");
  if (!target || !fromElement) return;

  const from = fromElement.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const flyer = document.createElement("div");
  flyer.style.cssText = `
    position: fixed;
    z-index: 9999;
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: url(${imageSrc}) center/cover;
    border: 2px solid rgba(34, 211, 238, 0.5);
    box-shadow: 0 8px 32px rgba(34, 211, 238, 0.35);
    pointer-events: none;
    left: ${from.left + from.width / 2 - 24}px;
    top: ${from.top + from.height / 2 - 24}px;
    transition: none;
  `;
  document.body.appendChild(flyer);

  const startX = from.left + from.width / 2 - 24;
  const startY = from.top + from.height / 2 - 24;
  const endX = to.left + to.width / 2 - 24;
  const endY = to.top + to.height / 2 - 24;
  const duration = 650;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const ease = 1 - Math.pow(1 - t, 3);
    const arc = Math.sin(t * Math.PI) * -80;
    flyer.style.left = `${startX + (endX - startX) * ease}px`;
    flyer.style.top = `${startY + (endY - startY) * ease + arc}px`;
    flyer.style.transform = `scale(${1 - t * 0.55}) rotate(${t * 180}deg)`;
    flyer.style.opacity = `${1 - t * 0.25}`;
    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      flyer.remove();
      target.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.2)" },
          { transform: "scale(1)" },
        ],
        { duration: 280, easing: "ease-out" },
      );
    }
  };

  requestAnimationFrame(tick);
}
