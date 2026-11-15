document.addEventListener("DOMContentLoaded", () => {
  // 0. PRELOADER & VIDEO BUFFERING CHECK
  const preloader = document.getElementById("preloader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");
  const allVideos = Array.from(document.querySelectorAll("video"));

  if (preloader) {
    document.body.classList.add("is-loading");

    let displayedProgress = 0;
    let targetProgress = 15;
    let isDismissed = false;

    function dismissPreloader() {
      if (isDismissed) return;
      isDismissed = true;
      targetProgress = 100;

      // Ensure bar hits 100% visually before sliding up
      if (loaderBar) loaderBar.style.width = "100%";
      if (loaderPercent) loaderPercent.textContent = "100%";

      setTimeout(() => {
        preloader.classList.add("is-hidden");
        document.body.classList.remove("is-loading");
        updateParallax(); // Recalculate positions once visible
      }, 300);
    }

    // Check how many videos have enough frames ready to display
    function checkVideosReady() {
      if (allVideos.length === 0) {
        dismissPreloader();
        return;
      }

      let readyCount = 0;
      allVideos.forEach((vid) => {
        // readyState >= 2 means current frame is loaded and visible
        if (vid.readyState >= 2) {
          readyCount++;
        }
      });

      const realPercent = Math.round((readyCount / allVideos.length) * 100);
      targetProgress = Math.max(targetProgress, realPercent);

      if (readyCount === allVideos.length) {
        dismissPreloader();
      }
    }

    // Listen for each video loading its first frame
    allVideos.forEach((vid) => {
      vid.addEventListener("loadeddata", checkVideosReady);
      vid.addEventListener("canplay", checkVideosReady);
      vid.addEventListener("error", checkVideosReady); // Don't hang if a file fails
    });

    // Smooth counter animation loop
    const progressTimer = setInterval(() => {
      if (displayedProgress < targetProgress) {
        displayedProgress += Math.ceil((targetProgress - displayedProgress) * 0.25);
        if (displayedProgress > 100) displayedProgress = 100;

        if (loaderBar) loaderBar.style.width = `${displayedProgress}%`;
        if (loaderPercent) {
          loaderPercent.textContent = `${String(displayedProgress).padStart(2, "0")}%`;
        }
      }

      if (isDismissed) {
        clearInterval(progressTimer);
      }
    }, 40);

    // Run initial check immediately (in case video is already cached)
    checkVideosReady();

    // Safety fallback: never trap visitors longer than 3.5 seconds on slow networks
    setTimeout(dismissPreloader, 3500);
  }

  // 1. PARALLAX FOR DESKTOP & MOBILE
  const parallaxItems = document.querySelectorAll("[data-parallax], [data-rotate]");
  let ticking = false;

  function updateParallax() {
    const windowHeight = window.innerHeight;
    const viewportCenter = windowHeight / 2;
    const isMobile = window.innerWidth <= 850;
    // Scale down movement slightly on mobile so stacked sections don't overlap
    const intensity = isMobile ? 0.45 : 1;

    parallaxItems.forEach((el) => {
      const parentSlide = el.closest(".slide");
      if (!parentSlide) return;

      const rect = parentSlide.getBoundingClientRect();

      if (rect.bottom > -250 && rect.top < windowHeight + 250) {
        const slideCenter = rect.top + rect.height / 2;
        const distanceFromCenter = slideCenter - viewportCenter;

        const speed = (parseFloat(el.dataset.parallax) || 0) * intensity;
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
  updateParallax();

  // 2. SCROLL REVEAL ANIMATIONS FOR SMALL ELEMENTS
  const textAndCardElements = document.querySelectorAll(
    ".bio-text, .tagline, .small-caps, .exp-item, .col-label, .service-note, .contact-row, .contact-sub, .footer-note, .vertical-label"
  );

  const badgeAndIconElements = document.querySelectorAll(
    ".red-dot, .sparkle, .clover-icon, .star-burst, .rec-badge, .play-tag, .red-circle"
  );

  textAndCardElements.forEach((el) => el.classList.add("reveal-item"));
  badgeAndIconElements.forEach((el) => el.classList.add("reveal-pop"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Slight stagger delay when multiple small items appear together
          setTimeout(() => {
            entry.target.classList.add("is-visible");
          }, (index % 5) * 75);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal-item, .reveal-pop").forEach((el) => {
    revealObserver.observe(el);
  });

  // 3. SMART VIDEO PLAYBACK (SAVES MOBILE BATTERY & KEEPS PARALLAX SMOOTH)
  const videos = document.querySelectorAll("video");
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.play().catch(() => {});
          } else {
            entry.target.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    videos.forEach((video) => videoObserver.observe(video));
  }
});
