document.addEventListener("DOMContentLoaded", () => {
  const parallaxItems = document.querySelectorAll("[data-parallax], [data-rotate]");
  let ticking = false;

  function updateParallax() {
    const windowHeight = window.innerHeight;
    const viewportCenter = windowHeight / 2;

    parallaxItems.forEach((el) => {
      const parentSlide = el.closest(".slide");
      if (!parentSlide) return;

      const rect = parentSlide.getBoundingClientRect();

      // Only animate sections currently visible or near the viewport
      if (rect.bottom > -200 && rect.top < windowHeight + 200) {
        const slideCenter = rect.top + rect.height / 2;
        const distanceFromCenter = slideCenter - viewportCenter;

        const speed = parseFloat(el.dataset.parallax) || 0;
        const rotateSpeed = parseFloat(el.dataset.rotate) || 0;

        const translateY = distanceFromCenter * speed;
        const rotation = distanceFromCenter * rotateSpeed;

        el.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg)`;
      }
    });

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateParallax);

  // Set initial positions on page load
  updateParallax();
});

  // Pause off-screen videos to save mobile battery & boost scroll smoothness
  const videos = document.querySelectorAll("video");
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.15 });

    videos.forEach((video) => videoObserver.observe(video));
  }
