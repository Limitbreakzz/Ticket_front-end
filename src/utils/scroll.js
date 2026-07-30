/**
 * Smoothly scrolls an element to the top over a custom duration (in ms).
 * @param {HTMLElement} element - The scroll container element
 * @param {number} duration - Animation duration in milliseconds
 */
export function smoothScrollToTop(element, duration = 250) {
  if (!element) return;
  const start = element.scrollTop;
  const change = -start;
  const startTime = performance.now();

  function animateScroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // easeOutQuad: fast acceleration, gentle deceleration
    const ease = progress * (2 - progress);
    
    element.scrollTop = start + change * ease;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}
