(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
      });
    });
  }

  /* ---------- scroll-spy active nav state + sliding indicator ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id], .hero[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".primary-nav .nav-link"));
  var navIndicator = document.getElementById("nav-indicator");

  function moveIndicatorTo(link) {
    if (!navIndicator || !link) return;
    navIndicator.style.opacity = "1";
    navIndicator.style.transform = "translateX(" + link.offsetLeft + "px)";
    navIndicator.style.width = link.offsetWidth + "px";
  }

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              var isActive = link.getAttribute("data-section") === id;
              link.classList.toggle("active", isActive);
              if (isActive) moveIndicatorTo(link);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });

    var activeLink = document.querySelector(".primary-nav .nav-link.active");
    window.addEventListener("load", function () { moveIndicatorTo(activeLink); });
    window.addEventListener("resize", function () {
      var current = document.querySelector(".primary-nav .nav-link.active");
      moveIndicatorTo(current);
    });
  }

  /* ---------- scroll reveal (single restrained pass) ---------- */
  var revealTargets = document.querySelectorAll(
    ".about-grid, .matrix-grid, .project-card, .ledger, .gdg-panel, .focus-list, .timeline"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- project card tilt (subtle, pointer-driven only) ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var tiltCards = document.querySelectorAll("[data-tilt]");
    tiltCards.forEach(function (card) {
      var frame = null;
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          card.style.setProperty("--ry", (px * 5).toFixed(2) + "deg");
          card.style.setProperty("--rx", (py * -5).toFixed(2) + "deg");
        });
      });
      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- animated stat count-up ---------- */
  var countEls = document.querySelectorAll("[data-count-to]");
  if (countEls.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (reduceMotion) {
        el.textContent = target.toFixed(decimals);
        return;
      }
      var duration = 1100;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(decimals);
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach(function (el) { countObserver.observe(el); });
    } else {
      countEls.forEach(animateCount);
    }
  }

  /* ---------- learning-focus meter fill on reveal ---------- */
  var focusList = document.querySelector(".focus-list");
  if (focusList && "IntersectionObserver" in window) {
    var meterObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".focus-fill").forEach(function (fill, idx) {
              setTimeout(function () { fill.classList.add("filled"); }, idx * 110);
            });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    meterObserver.observe(focusList);
  } else if (focusList) {
    focusList.querySelectorAll(".focus-fill").forEach(function (fill) { fill.classList.add("filled"); });
  }

  /* ---------- single terminal typing moment ---------- */
  var typedEl = document.getElementById("typed-text");
  if (typedEl && !reduceMotion) {
    var phrase = "open-to-opportunities";
    var i = 0;
    var typeStep = function () {
      if (i <= phrase.length) {
        typedEl.textContent = phrase.slice(0, i);
        i++;
        setTimeout(typeStep, 55);
      }
    };
    setTimeout(typeStep, 900);
  } else if (typedEl) {
    typedEl.textContent = "open-to-opportunities";
  }
})();
