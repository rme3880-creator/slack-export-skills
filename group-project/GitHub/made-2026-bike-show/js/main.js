/* =====================================================================
   MADE 2026 — interactions & page-navigation animations
   ===================================================================== */
(function () {
  "use strict";

  var body = document.body;
  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     0. Boot — entrance wipe
     Driven entirely by a timer (never gated on window.load) so a
     slow font/image can never leave the overlay covering the page.
  --------------------------------------------------------------- */
  body.classList.remove("preload");

  if (!reduceMotion) {
    body.classList.add("is-entering");
    window.setTimeout(function () {
      body.classList.remove("is-entering");
    }, 1000);
  }

  /* ---------------------------------------------------------------
     1. Page-transition wipe on internal navigation
     In-page #anchor links keep their native behaviour — the browser
     handles the smooth scroll via CSS scroll-behavior + scroll-padding.
  --------------------------------------------------------------- */
  function samePage(url) {
    return url.pathname === location.pathname && url.hostname === location.hostname;
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a");
    if (!link) return;

    var href = link.getAttribute("href");
    if (!href) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;
    if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    var url;
    try { url = new URL(link.href, location.href); } catch (err) { return; }
    if (url.hostname !== location.hostname) return;

    // Same page (anchor or not) → let the browser handle it, just tidy up
    if (samePage(url)) {
      closeNav();
      return;
    }

    // Cross-page → play the wipe, then navigate
    e.preventDefault();
    closeNav();

    if (reduceMotion) {
      location.href = link.href;
      return;
    }

    body.classList.add("is-leaving");
    window.setTimeout(function () {
      location.href = link.href;
    }, 500);
  });

  // Restore state if user returns via browser back/forward (bfcache)
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      body.classList.remove("is-leaving", "is-entering");
    }
  });

  /* ---------------------------------------------------------------
     2. Mobile nav
  --------------------------------------------------------------- */
  var navToggle = document.querySelector("[data-nav-toggle]");

  function closeNav() {
    body.classList.remove("nav-open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------------------------------------------------------------
     3. Sticky header state + scroll progress bar
  --------------------------------------------------------------- */
  var header = document.querySelector("[data-header]");
  var progress = document.querySelector("[data-progress]");

  function onScroll() {
    var y = window.pageYOffset;
    if (header) header.classList.toggle("is-stuck", y > 20);

    if (progress) {
      var h = docEl.scrollHeight - window.innerHeight;
      progress.style.width = h > 0 ? (y / h) * 100 + "%" : "0%";
    }

    var toTop = document.querySelector("[data-to-top]");
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------
     4. Reveal-on-scroll
  --------------------------------------------------------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------------------------------------------------------------
     5. Animated number counters
  --------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cObserver.unobserve(el);
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1400;
        var start = performance.now();
        function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.round(target * eased);
          el.textContent = val.toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        if (reduceMotion) {
          el.textContent = target.toLocaleString() + suffix;
        } else {
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObserver.observe(el); });
  }

  /* ---------------------------------------------------------------
     6. Active nav link based on section in view
  --------------------------------------------------------------- */
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".site-nav a[href*='#']");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var sObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href").indexOf("#" + id) !== -1);
        });
      });
    }, { threshold: 0.4 });
    sections.forEach(function (s) { sObserver.observe(s); });
  }

  /* ---------------------------------------------------------------
     7. Hero parallax
  --------------------------------------------------------------- */
  var heroBg = document.querySelector(".hero__bg");
  if (heroBg && !reduceMotion) {
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      if (y < window.innerHeight) {
        heroBg.style.transform = "scale(1.08) translateY(" + y * 0.18 + "px)";
      }
    }, { passive: true });

    window.addEventListener("mousemove", function (e) {
      var dx = (e.clientX / window.innerWidth - 0.5) * 14;
      var dy = (e.clientY / window.innerHeight - 0.5) * 10;
      heroBg.style.setProperty("--px", dx + "px");
      heroBg.style.setProperty("--py", dy + "px");
      heroBg.style.transform = "scale(1.08) translate(" + dx + "px," + dy + "px)";
    });
  }

  /* ---------------------------------------------------------------
     8. Bike pages: arrow-key prev / next navigation
  --------------------------------------------------------------- */
  var prevUrl = body.getAttribute("data-prev");
  var nextUrl = body.getAttribute("data-next");
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowLeft" && prevUrl) go(prevUrl);
    if (e.key === "ArrowRight" && nextUrl) go(nextUrl);
  });
  function go(url) {
    if (reduceMotion) { location.href = url; return; }
    body.classList.add("is-leaving");
    window.setTimeout(function () { location.href = url; }, 500);
  }

  /* ---------------------------------------------------------------
     9. Back-to-top
  --------------------------------------------------------------- */
  var toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------------------------------------------------------
     10. Footer year
  --------------------------------------------------------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     11. Tilt effect on bike cards (pointer)
  --------------------------------------------------------------- */
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".bike-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform =
          "translateY(-8px) perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }
})();
