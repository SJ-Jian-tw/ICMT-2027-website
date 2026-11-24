// ICMT 2027 PDF viewer (PDF.js 4.10.38, legacy build, hosted in js/pdfjs/).
// Markup:  <div class="pdf-viewer" data-src="docs/file.pdf" data-mode="slides|scroll"></div>
//   slides: one page at a time with previous / next buttons (16:9 decks)
//   scroll: all pages stacked in a scrolling box (A4 documents)
// Links inside the PDF stay clickable. If PDF.js fails, a download link is shown instead.

import * as pdfjsLib from "./pdfjs/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("./pdfjs/pdf.worker.min.mjs", import.meta.url).href;
const STANDARD_FONTS = new URL("./pdfjs/standard_fonts/", import.meta.url).href;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

// Draw one page into a wrapper sized to cssWidth, with a link layer on top.
async function drawPage(page, wrap, cssWidth) {
  const base = page.getViewport({ scale: 1 });
  const scale = cssWidth / base.width;
  const viewport = page.getViewport({ scale });
  const ratio = Math.min(window.devicePixelRatio || 1, 2.5);

  const canvas = el("canvas", "pdf-canvas");
  canvas.width = Math.floor(viewport.width * ratio);
  canvas.height = Math.floor(viewport.height * ratio);
  canvas.style.width = viewport.width + "px";
  canvas.style.height = viewport.height + "px";

  await page.render({
    canvasContext: canvas.getContext("2d"),
    viewport,
    transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : null,
  }).promise;

  const links = el("div", "pdf-links");
  try {
    const annots = await page.getAnnotations();
    for (const a of annots) {
      if (a.subtype !== "Link" || !a.url) continue;
      const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(a.rect);
      const link = el("a");
      link.href = a.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.title = a.url;
      link.style.left = Math.min(x1, x2) + "px";
      link.style.top = Math.min(y1, y2) + "px";
      link.style.width = Math.abs(x2 - x1) + "px";
      link.style.height = Math.abs(y2 - y1) + "px";
      links.appendChild(link);
    }
  } catch (e) { /* links are optional */ }

  wrap.replaceChildren(canvas, links);
  wrap.style.width = viewport.width + "px";
  wrap.style.height = viewport.height + "px";
}

function showFallback(root, src) {
  root.classList.add("is-failed");
  const box = el("div", "pdf-fallback");
  box.append(el("p", null, "The document preview could not be loaded in this browser."));
  const a = el("a", "btn btn-primary", "OPEN PDF");
  a.href = src;
  a.target = "_blank";
  a.rel = "noopener";
  box.append(a);
  root.querySelector(".pdf-stage").replaceChildren(box);
}

async function setup(root) {
  const src = root.dataset.src;
  const mode = root.dataset.mode === "scroll" ? "scroll" : "slides";
  root.classList.add("mode-" + mode);

  const stage = el("div", "pdf-stage");
  stage.append(el("p", "pdf-loading", "Loading document…"));
  root.append(stage);

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ url: src, standardFontDataUrl: STANDARD_FONTS }).promise;
  } catch (e) {
    showFallback(root, src);
    return;
  }

  const total = pdf.numPages;
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(await pdf.getPage(i));
  const width = () => Math.max(240, stage.clientWidth - (mode === "scroll" ? 32 : 0));

  if (mode === "slides") {
    let current = 1;
    const wrap = el("div", "pdf-page");
    stage.replaceChildren(wrap);

    const bar = el("div", "pdf-bar");
    const prev = el("button", "pdf-nav", "‹");
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous page");
    const next = el("button", "pdf-nav", "›");
    next.type = "button";
    next.setAttribute("aria-label", "Next page");
    const count = el("span", "pdf-count");
    count.setAttribute("aria-live", "polite");
    bar.append(prev, count, next);
    root.append(bar);

    const show = async (n) => {
      current = Math.min(Math.max(n, 1), total);
      count.textContent = current + " / " + total;
      prev.disabled = current === 1;
      next.disabled = current === total;
      await drawPage(pages[current - 1], wrap, width());
    };
    prev.addEventListener("click", () => show(current - 1));
    next.addEventListener("click", () => show(current + 1));
    root.tabIndex = 0;
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(current + 1); }
    });
    // swipe on touch screens
    let x0 = null;
    stage.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    await show(1);
    let lastW = width();
    new ResizeObserver(() => {
      const w = width();
      if (Math.abs(w - lastW) > 4) { lastW = w; show(current); }
    }).observe(stage);
  } else {
    const drawAll = async () => {
      const w = width();
      const wraps = pages.map(() => el("div", "pdf-page"));
      stage.replaceChildren(...wraps);
      for (let i = 0; i < total; i++) await drawPage(pages[i], wraps[i], w);
    };
    await drawAll();
    let lastW = width();
    let timer;
    new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const w = width();
        if (Math.abs(w - lastW) > 4) { lastW = w; drawAll(); }
      }, 200);
    }).observe(stage);
  }
}

document.querySelectorAll(".pdf-viewer[data-src]").forEach((root) => { setup(root); });
