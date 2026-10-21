/* ============================================================
   Massimo Data Downloads and Dashboard app — shared gallery logic
   ============================================================ */

(function () {
  "use strict";

  /* ---------- scaled "device frame" iframe preview ---------- */

  function mountScaledIframe(container, src, virtualW, virtualH, interactive) {
    container.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "device-frame__iframe-wrap";

    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.width = virtualW;
    iframe.height = virtualH;
    iframe.style.width = virtualW + "px";
    iframe.style.height = virtualH + "px";
    iframe.loading = "lazy";
    iframe.setAttribute("scrolling", interactive ? "yes" : "no");
    iframe.tabIndex = interactive ? 0 : -1;
    if (!interactive) {
      iframe.style.pointerEvents = "none";
      iframe.setAttribute("aria-hidden", "true");
    }
    wrap.appendChild(iframe);
    container.appendChild(wrap);

    function applyScale() {
      const w = container.clientWidth;
      if (!w) return;
      wrap.style.transform = "scale(" + (w / virtualW) + ")";
    }
    applyScale();

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(applyScale);
      ro.observe(container);
      container.__ro = ro;
    } else {
      window.addEventListener("resize", applyScale);
    }

    return { iframe, wrap };
  }

  function destroyFrame(container) {
    if (container && container.__ro) {
      container.__ro.disconnect();
    }
    if (container) container.innerHTML = "";
  }

  /* ---------- plain full-size iframe (real interaction, no scaling) ---------- */

  function mountFullIframe(container, src) {
    container.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.loading = "lazy";
    container.appendChild(iframe);
    return iframe;
  }

  /* ---------- project grid ---------- */

  function renderGrid(gridEl, projects, opts) {
    projects.forEach(function (project, idx) {
      const card = document.createElement("div");
      card.className = "project-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Open gallery for " + project.title);

      const frame = document.createElement("div");
      frame.className =
        "device-frame " +
        (opts.landscape ? "device-frame--landscape" : "device-frame--portrait");
      card.appendChild(frame);

      const caption = document.createElement("div");
      caption.className = "project-card__caption";
      caption.textContent = project.title;
      card.appendChild(caption);

      const meta = document.createElement("div");
      meta.className = "project-card__meta";
      meta.textContent = project.folder;
      card.appendChild(meta);

      gridEl.appendChild(card);

      if (opts.useScreenshot && project.screenshot) {
        // lightweight static snapshot — the real page only loads once opened
        const img = document.createElement("img");
        img.className = "device-frame__screenshot";
        img.src = project.screenshot;
        img.loading = "lazy";
        img.alt = project.title;
        frame.appendChild(img);
      } else {
        mountScaledIframe(frame, project.preview, opts.virtualW, opts.virtualH, false);
      }

      const hoverSource = document.createElement("div");
      hoverSource.className = "device-frame__hover-source";
      hoverSource.textContent = project.source;
      frame.appendChild(hoverSource);

      function open() {
        Gallery.open(projects, idx, opts);
      }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  /* ---------- modal gallery ---------- */

  const Gallery = {
    state: null,
    els: null,

    ensureModal: function () {
      if (this.els) return this.els;

      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true">' +
        '  <div class="modal__header">' +
        '    <div class="modal__title-group">' +
        '      <p class="modal__title"></p>' +
        '      <p class="modal__counter"></p>' +
        "    </div>" +
        '    <button type="button" class="modal__close" aria-label="Close">&times;</button>' +
        "  </div>" +
        '  <div class="modal__tabs">' +
        '    <button type="button" class="modal__tab" data-slide="0">View</button>' +
        '    <button type="button" class="modal__tab" data-slide="1">Downloaded File</button>' +
        '    <button type="button" class="modal__tab" data-slide="2">Original</button>' +
        "  </div>" +
        '  <div class="modal__view-stage">' +
        '    <div class="modal__view-slide" data-slide="0">' +
        '      <div class="modal__view-preview-wrap"></div>' +
        "    </div>" +
        '    <div class="modal__view-slide" data-slide="1">' +
        '      <pre class="modal__view-source"></pre>' +
        "    </div>" +
        '    <div class="modal__view-slide" data-slide="2">' +
        '      <img class="modal__view-original" alt="">' +
        "    </div>" +
        "  </div>" +
        '  <div class="modal__footer">' +
        '    <div class="modal__project-nav">' +
        '      <button type="button" class="modal__project-nav-btn" data-nav="prev">&#8249; Previous project</button>' +
        '      <button type="button" class="modal__project-nav-btn" data-nav="next">Next project &#8250;</button>' +
        "    </div>" +
        '    <div class="modal__dots">' +
        '      <button type="button" class="modal__dot" data-dot="0" aria-label="View slide"></button>' +
        '      <button type="button" class="modal__dot" data-dot="1" aria-label="Downloaded file slide"></button>' +
        '      <button type="button" class="modal__dot" data-dot="2" aria-label="Original slide"></button>' +
        "    </div>" +
        "  </div>" +
        "</div>";
      document.body.appendChild(overlay);

      const els = {
        overlay: overlay,
        title: overlay.querySelector(".modal__title"),
        counter: overlay.querySelector(".modal__counter"),
        closeBtn: overlay.querySelector(".modal__close"),
        tabs: Array.prototype.slice.call(overlay.querySelectorAll(".modal__tab")),
        slides: Array.prototype.slice.call(overlay.querySelectorAll(".modal__view-slide")),
        previewWrap: overlay.querySelector(".modal__view-preview-wrap"),
        sourcePre: overlay.querySelector(".modal__view-source"),
        originalImg: overlay.querySelector(".modal__view-original"),
        prevProjectBtn: overlay.querySelector('[data-nav="prev"]'),
        nextProjectBtn: overlay.querySelector('[data-nav="next"]'),
        dots: Array.prototype.slice.call(overlay.querySelectorAll(".modal__dot")),
      };

      els.closeBtn.addEventListener("click", function () {
        Gallery.close();
      });
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) Gallery.close();
      });
      els.tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          Gallery.setSlide(parseInt(tab.dataset.slide, 10));
        });
      });
      els.dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          Gallery.setSlide(parseInt(dot.dataset.dot, 10));
        });
      });
      els.prevProjectBtn.addEventListener("click", function () {
        Gallery.showProject(Gallery.state.index - 1);
      });
      els.nextProjectBtn.addEventListener("click", function () {
        Gallery.showProject(Gallery.state.index + 1);
      });

      document.addEventListener("keydown", function (e) {
        if (!Gallery.state || !Gallery.state.open) return;
        const count = Gallery.state.slideCount || 2;
        if (e.key === "Escape") Gallery.close();
        else if (e.key === "ArrowLeft") Gallery.setSlide((Gallery.state.slide - 1 + count) % count);
        else if (e.key === "ArrowRight") Gallery.setSlide((Gallery.state.slide + 1) % count);
      });

      els.originalImg.addEventListener("load", function () {
        const stage = els.originalImg.closest(".modal__view-stage");
        if (!stage || !els.originalImg.naturalWidth) return;
        const stageRatio = stage.clientWidth / stage.clientHeight;
        const imgRatio = els.originalImg.naturalWidth / els.originalImg.naturalHeight;
        if (imgRatio > stageRatio) {
          els.originalImg.style.width = "auto";
          els.originalImg.style.height = "100%";
        } else {
          els.originalImg.style.width = "100%";
          els.originalImg.style.height = "auto";
        }
      });

      this.els = els;
      return els;
    },

    open: function (projects, index, opts) {
      const els = this.ensureModal();
      this.state = { projects: projects, index: index, opts: opts, slide: 0, open: true };
      els.overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      this.showProject(index);
    },

    close: function () {
      if (!this.els) return;
      this.els.overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      destroyFrame(this.els.previewWrap);
      if (this.state) this.state.open = false;
    },

    showProject: function (idx) {
      const els = this.els;
      const state = this.state;
      const total = state.projects.length;
      state.index = (idx + total) % total;
      const project = state.projects[state.index];

      els.title.textContent = project.title;
      els.counter.textContent = state.index + 1 + " / " + total;
      els.sourcePre.textContent = project.source;

      const hasOriginal = !!project.original;
      els.tabs[2].hidden = !hasOriginal;
      els.dots[2].hidden = !hasOriginal;
      els.originalImg.style.width = "100%";
      els.originalImg.style.height = "auto";
      els.originalImg.src = hasOriginal ? project.original : "";
      els.originalImg.alt = hasOriginal ? project.title + " — original" : "";
      state.slideCount = hasOriginal ? 3 : 2;

      // the real page only loads once the project is actually opened
      destroyFrame(els.previewWrap);
      mountFullIframe(els.previewWrap, project.preview);

      this.setSlide(0);
    },

    setSlide: function (n) {
      const els = this.els;
      const state = this.state;
      state.slide = n;
      els.slides.forEach(function (slideEl) {
        slideEl.classList.toggle("is-active", parseInt(slideEl.dataset.slide, 10) === n);
      });
      els.tabs.forEach(function (tab) {
        tab.classList.toggle("is-active", parseInt(tab.dataset.slide, 10) === n);
      });
      els.dots.forEach(function (dot) {
        dot.classList.toggle("is-active", parseInt(dot.dataset.dot, 10) === n);
      });
    },
  };

  window.SiteGallery = {
    renderGrid: renderGrid,
    Gallery: Gallery,
  };
})();
