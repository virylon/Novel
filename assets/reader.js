/* ============================================================
   小说阅读网站逻辑
   依赖：marked.js（index.html 中通过 CDN 引入）
   ============================================================ */

(function () {
  "use strict";

  const state = { book: null, current: 0 };

  const store = {
    get: (k, d) => { try { const v = localStorage.getItem("novel:" + k); return v === null ? d : v; } catch (e) { return d; } },
    set: (k, v) => { try { localStorage.setItem("novel:" + k, v); } catch (e) {} }
  };

  const $ = (s) => document.querySelector(s);
  const els = {
    title: $("#book-title"), author: $("#book-author"), desc: $("#book-desc"),
    toc: $("#toc"), content: $("#content"), pager: $("#pager"),
    sidebar: $("#sidebar"), overlay: $("#overlay"), progress: $("#progress"),
    crumbBook: $("#crumb-book"), crumbChapter: $("#crumb-chapter"),
    docTitle: document.title,
  };

  async function init() {
    applyTheme(store.get("theme", "light"));
    applyFontSize(parseInt(store.get("fontSize", "19"), 10));
    bindToolbar();
    bindProgress();

    try {
      const res = await fetch("book.json", { cache: "no-cache" });
      if (!res.ok) throw new Error();
      state.book = await res.json();
    } catch (e) {
      els.content.innerHTML =
        '<div class="placeholder"><div class="big">⚠</div>' +
        "<p>没能读取 book.json。<br>请通过 GitHub Pages 链接或本地服务器访问，<br>不要直接双击 html 文件打开。</p></div>";
      return;
    }

    renderShell();
    renderToc();

    const fromHash = parseInt((location.hash.match(/#ch=(\d+)/) || [])[1], 10);
    const saved = parseInt(store.get("last", "0"), 10);
    const start = !isNaN(fromHash) ? fromHash : (isNaN(saved) ? 0 : saved);
    goTo(Math.min(Math.max(start, 0), state.book.chapters.length - 1));
  }

  function renderShell() {
    const b = state.book;
    els.title.textContent = b.title || "无标题";
    els.author.textContent = b.author ? "著　" + b.author : "";
    els.desc.textContent = b.description || "";
    els.crumbBook.textContent = b.title || "小说";
    document.title = b.title || els.docTitle;
  }

  function renderToc() {
    els.toc.innerHTML = "";
    state.book.chapters.forEach((ch, i) => {
      const btn = document.createElement("button");
      btn.className = "toc-item";
      btn.dataset.index = i;
      const num = document.createElement("span");
      num.className = "toc-num";
      num.textContent = String(i + 1).padStart(2, "0");
      const t = document.createElement("span");
      t.textContent = ch.title || ("第 " + (i + 1) + " 章");
      btn.appendChild(num); btn.appendChild(t);
      btn.addEventListener("click", () => { goTo(i); closeSidebar(); });
      els.toc.appendChild(btn);
    });
  }

  async function goTo(index) {
    const chapters = state.book.chapters;
    if (index < 0 || index >= chapters.length) return;
    state.current = index;

    els.toc.querySelectorAll(".toc-item").forEach((el) => {
      el.classList.toggle("active", parseInt(el.dataset.index, 10) === index);
    });

    const title = chapters[index].title || ("第 " + (index + 1) + " 章");
    els.crumbChapter.textContent = title;

    els.content.innerHTML = '<div class="placeholder"><p>翻页中…</p></div>';
    try {
      const res = await fetch(chapters[index].file, { cache: "no-cache" });
      if (!res.ok) throw new Error();
      const md = await res.text();
      const wrap = document.createElement("div");
      wrap.className = "content";
      wrap.innerHTML = marked.parse(md);
      els.content.innerHTML = "";
      els.content.appendChild(wrap);
    } catch (e) {
      els.content.innerHTML =
        '<div class="placeholder"><div class="big">✕</div><p>这一章读取失败：<br>' +
        chapters[index].file + "</p></div>";
    }

    renderPager();
    location.hash = "ch=" + index;
    store.set("last", String(index));
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderPager() {
    const chapters = state.book.chapters;
    const i = state.current;
    els.pager.innerHTML = "";

    const prev = document.createElement("button");
    prev.className = "prev";
    prev.disabled = i <= 0;
    prev.innerHTML = '<span class="dir">← 上一章</span><span class="ch">' +
      (i > 0 ? esc(chapters[i - 1].title) : "已是开篇") + "</span>";
    prev.addEventListener("click", () => goTo(i - 1));

    const next = document.createElement("button");
    next.className = "next";
    next.disabled = i >= chapters.length - 1;
    next.innerHTML = '<span class="dir">下一章 →</span><span class="ch">' +
      (i < chapters.length - 1 ? esc(chapters[i + 1].title) : "敬请期待") + "</span>";
    next.addEventListener("click", () => goTo(i + 1));

    els.pager.appendChild(prev);
    els.pager.appendChild(next);
  }

  function esc(s) { const d = document.createElement("div"); d.textContent = s || ""; return d.innerHTML; }

  // ---------- 工具栏 ----------
  function bindToolbar() {
    $("#theme-btn").addEventListener("click", toggleTheme);
    $("#font-dec").addEventListener("click", () => changeFont(-1));
    $("#font-inc").addEventListener("click", () => changeFont(1));
    $("#menu-btn").addEventListener("click", openSidebar);
    els.overlay.addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(state.current - 1);
      if (e.key === "ArrowRight") goTo(state.current + 1);
    });
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    const next = cur === "light" ? "dark" : "light";
    applyTheme(next); store.set("theme", next);
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    $("#theme-btn").textContent = t === "dark" ? "☀ 深色" : "◐ 浅色";
  }

  function changeFont(d) {
    let s = parseInt(store.get("fontSize", "19"), 10) + d;
    s = Math.max(15, Math.min(28, s));
    applyFontSize(s); store.set("fontSize", String(s));
  }
  function applyFontSize(s) { document.documentElement.style.setProperty("--reader-font-size", s + "px"); }

  // ---------- 阅读进度条 ----------
  function bindProgress() {
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }
  function updateProgress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
    els.progress.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  // ---------- 移动端侧栏 ----------
  function openSidebar() { els.sidebar.classList.add("open"); els.overlay.classList.add("show"); }
  function closeSidebar() { els.sidebar.classList.remove("open"); els.overlay.classList.remove("show"); }

  document.addEventListener("DOMContentLoaded", init);
})();
