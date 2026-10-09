import { useCallback, useEffect, useRef, useState } from "react";

import { PointerRipples } from "./PointerRipples.jsx";

const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
const heroPoster = () => asset("109.png");

const projects = [
  { cover: asset("project-cover-1.webp?v=20261008b"), mobileCover: asset("project-cover-1-mobile.webp?v=20261008b"), src: asset("project-kv.webp"), index: "01", title: "运营 KV", full: true },
  { cover: asset("project-cover-2.webp?v=20261008b"), mobileCover: asset("project-cover-2-mobile.webp?v=20261008b"), src: asset("project-brand.webp"), index: "02", title: "品牌活动", full: true },
  { cover: asset("project-cover-3.webp?v=20261008b"), mobileCover: asset("project-cover-3-mobile.webp?v=20261008b"), src: asset("project-ip.webp"), index: "03", title: "IP 设计", full: true },
  { cover: asset("project-cover-4.webp?v=20261008b"), mobileCover: asset("project-cover-4-mobile.webp?v=20261008b"), src: asset("project-play.webp"), index: "04", title: "玩法活动", full: true },
];

const otherProjects = [
  {
    src: asset("other-project-1.png"),
    detail: asset("other-project-1-full.png"),
    index: "01",
    title: "中国电信",
  },
  { src: asset("other-project-2.png"), index: "02", title: "Mindview内宣KV", previewSize: "wide" },
  { src: asset("other-project-3.jpg"), index: "03", title: "CTB运营海报" },
  { src: asset("other-project-4.jpg"), index: "04", title: "CTB运营海报" },
  {
    src: asset("other-project-5.png"),
    video: asset("other-project-5-full.mp4"),
    index: "05",
    title: "测测你的旅行搭子H5",
    type: "video",
  },
  {
    src: asset("other-project-6-cropped.png"),
    preview: asset("other-project-6.png"),
    index: "06",
    title: "CTB运营海报",
  },
  {
    src: asset("other-project-7.png"),
    video: asset("other-project-7-full.mp4"),
    index: "07",
    title: "端午节KV",
    type: "video",
  },
  {
    src: asset("other-project-8-cropped.png"),
    preview: asset("other-project-8.png"),
    index: "08",
    title: "CTB运营海报",
  },
  {
    src: asset("other-project-9.png"),
    detail: asset("other-project-9-full.png"),
    index: "09",
    title: "人头马父亲节",
  },
];

const otherProjectColumns = [
  [otherProjects[0], otherProjects[3], otherProjects[6]],
  [otherProjects[1], otherProjects[4], otherProjects[7]],
  [otherProjects[2], otherProjects[5], otherProjects[8]],
];

const contactDetails = {
  wechat: { label: "微信", english: "WeChat", value: "15846127579" },
  email: { label: "邮箱", english: "Email", value: "2677375336@qq.com" },
};

function ContactIcon({ type }) {
  return type === "wechat" ? (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4C7.5 4 2.5 8 2.5 13.4c0 2.8 1.4 5.2 3.8 7l-1 4 4.5-2.2c1.3.4 2.7.6 4.2.6 6.5 0 11.5-4 11.5-9.4S20.5 4 14 4Z" />
      <path d="M18.3 22.1c1.2 2.5 3.9 4 7 4 .8 0 1.5-.1 2.2-.3l2.5 1.2-.7-2.4c1.4-1.1 2.2-2.7 2.2-4.5 0-3.1-2.6-5.7-6.2-6.3" />
      <path d="M10 12h.1M18 12h.1M22.6 20h.1M27.2 20h.1" strokeWidth="2.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="26" height="20" rx="3" />
      <path d="m4.5 9 11.5 9 11.5-9" />
    </svg>
  );
}

function ContactDetailPage({ type }) {
  const [copied, setCopied] = useState(false);
  const contact = contactDetails[type];

  useEffect(() => {
    document.title = `${contact.english} — Portfolio`;
    document.getElementById("site-preloader")?.remove();
    return () => { document.title = "Portfolio — Yara"; };
  }, [contact.english]);

  const copyContact = async () => {
    try {
      await navigator.clipboard.writeText(contact.value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="contact-page">
      <div className="contact-page-top">
        <a className="contact-page-brand" href={import.meta.env.BASE_URL}>Portfolio</a>
        <a className="contact-page-back" href={import.meta.env.BASE_URL}>返回作品集 ↗</a>
      </div>
      <div className="contact-page-main">
        <span className="contact-page-kicker">LET&apos;S CONNECT / {contact.label}</span>
        <div className="contact-page-icon"><ContactIcon type={type} /></div>
        <h1>{contact.english}.</h1>
        <p className="contact-page-value">{contact.value}</p>
        <div className="contact-page-actions">
          <button type="button" onClick={copyContact}>{copied ? "已复制" : `复制${contact.label}`}</button>
        </div>
      </div>
      <div className="contact-page-bottom"><span>Yara / Visual Designer</span><span>© 2026 Portfolio</span></div>
    </main>
  );
}

function HeroArtwork({ onReady }) {
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const preferStatic = window.matchMedia("(prefers-reduced-motion: reduce)").matches || navigator.connection?.saveData;
  const [videoReady, setVideoReady] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const videoRefs = useRef([]);
  const source = asset(isMobile ? "home-109-clean-mobile.mp4" : "home-109-clean.mp4");

  useEffect(() => {
    if (preferStatic || !posterReady) return undefined;
    const videos = [...videoRefs.current];
    let active = 0;
    let transitioning = false;
    let disposed = false;
    let frame;
    let fallback = false;
    const blendDuration = 0.35;
    const showActive = () => videos.forEach((video, index) => {
      video.style.opacity = index === active ? "1" : "0";
      video.style.zIndex = index === active ? "1" : "0";
    });
    const play = (video) => {
      video.muted = true;
      return video.play();
    };
    const ready = () => {
      if (disposed) return;
      setVideoReady(true);
      onReady();

    };
    const nativeFallback = () => {
      transitioning = false;
      fallback = true;
      videos[1 - active].pause();
      videos[active].loop = true;
      showActive();
      if (videos[active].ended) play(videos[active]).catch(onReady);
    };
    const tick = () => {
      if (disposed) return;
      const current = videos[active];
      const next = videos[1 - active];
      // Reuse the fully buffered main resource before preparing a second decoder.
      if (!next.getAttribute("src") && Number.isFinite(current.duration)
        && current.buffered.length && current.buffered.end(current.buffered.length - 1) >= current.duration - 0.1) {
        next.src = source;
        next.load();
      }
      if (!document.hidden && !fallback) {
        if (!transitioning && !current.paused && current.duration > 0
          && current.duration - current.currentTime <= 0.5 && next.readyState >= 2) {
          transitioning = true;
          next.currentTime = 0;
          next.style.zIndex = "2";
          next.style.opacity = "0";
          play(next).catch(() => { if (!disposed) nativeFallback(); });
        }
        if (transitioning && next.readyState >= 2 && next.currentTime > 0) {
          // Incoming playback time keeps the blend aligned with decoded frames.
          const progress = Math.min(next.currentTime / blendDuration, 1);
          next.style.opacity = String(progress * progress * (3 - 2 * progress));
          if (progress === 1) {
            current.pause();
            active = 1 - active;
            transitioning = false;
            showActive();
            current.currentTime = 0;
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    const ended = (event) => {
      if (event.currentTarget === videos[active] && !transitioning) nativeFallback();
    };
    const resume = () => {
      if (document.hidden) {
        videos.forEach((video) => video.pause());
      } else {
        play(videos[active]).catch(onReady);
        if (transitioning) play(videos[1 - active]).catch(nativeFallback);
      }
    };
    const interact = () => { if (!document.hidden && videos[active].paused) resume(); };
    videos.forEach((video) => {
      video.addEventListener("playing", ready);
      video.addEventListener("ended", ended);
    });
    showActive();
    play(videos[active]).catch(onReady);
    frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    window.addEventListener("pointerdown", interact, { passive: true });
    window.addEventListener("keydown", interact);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      videos.forEach((video) => {
        video.pause();
        video.removeEventListener("playing", ready);
        video.removeEventListener("ended", ended);
      });
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("pointerdown", interact);
      window.removeEventListener("keydown", interact);
    };
  }, [preferStatic, posterReady, source, onReady]);

  return (
    <div className="hero-artwork">
      <img className="hero-art" src={heroPoster()} alt="紫色未来感角色作品集封面" fetchPriority="high" decoding="async" onLoad={async (event) => {
        try { await event.currentTarget.decode(); } catch { /* Loaded image can still render. */ }
        setPosterReady(true);
        onReady();
      }} onError={() => { setPosterReady(true); onReady(); }} />
      {!preferStatic && <div className={videoReady ? "hero-motion is-ready" : "hero-motion"} aria-hidden="true">
        {[0, 1].map((index) => <video
          key={index}
          ref={(video) => { videoRefs.current[index] = video; }}
          className="hero-loop-video"
          src={index === 0 && posterReady ? source : undefined}
          poster={heroPoster()}
          onError={onReady}
          muted playsInline preload={posterReady ? "auto" : "none"}
        />)}
      </div>}
      <span className="hero-caption">视觉设计作品集</span>
    </div>
  );
}

function HeroSection({ onReady }) {
  return (
    <section id="home" className="hero-transition" aria-label="首页">
      <div className="hero"><HeroArtwork onReady={onReady} /></div>
    </section>
  );
}

function AboutSection() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const revealLine = window.innerHeight * 0.42;
      const revealDistance = Math.max(window.innerHeight * 0.72, 1);
      setProgress(Math.min(Math.max((revealLine - rect.top) / revealDistance, 0), 1));
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const left = Math.min(Math.max(progress / 0.58, 0), 1);
  const right = Math.min(Math.max((progress - 0.24) / 0.6, 0), 1);
  const copy = Math.min(Math.max((progress - 0.12) / 0.5, 0), 1);

  return (
    <section id="about" ref={sectionRef} className="about" aria-label="自我介绍">
      <div className="about-stage section-shell">
        <figure
          className="about-photo about-photo-left"
          style={{
            transform: `rotate(${-2.6 + left * 2.1}deg) scale(${0.96 + left * 0.04})`,
          }}
        >
          <div className="about-photo-sheet" style={{ clipPath: `inset(0 0 ${(1 - left) * 100}% 0)` }}>
            <picture>
              <source media="(max-width: 720px)" srcSet={asset("photo-portrait-left-mobile.webp")} type="image/webp" />
              <img src={asset("photo-portrait-left.jpg")} alt="Yara 个人照片" loading="lazy" decoding="async" fetchPriority="low" />
            </picture>
          </div>
        </figure>
        <p className="about-copy" style={{ opacity: copy, transform: `translate3d(-50%, ${-50 + (1 - copy) * 12}%, 0)` }}>
          <span className="about-greeting">Hi，我是严祥君！</span>
          <span>从0到1搭建视觉方向，融合品牌叙事、视觉系统与AI工作流。</span>
          <span>在创意、技术与商业之间找到平衡，</span>
          <span>持续输出有记忆点、能传播、可落地的视觉项目。</span>
        </p>
        <figure
          className="about-photo about-photo-right"
          style={{
            transform: `rotate(${2.8 - right * 2.2}deg) scale(${0.96 + right * 0.04})`,
          }}
        >
          <div className="about-photo-sheet" style={{ clipPath: `inset(0 0 ${(1 - right) * 100}% 0)` }}>
            <picture>
              <source media="(max-width: 720px)" srcSet={asset("photo-portrait-2-mobile.webp")} type="image/webp" />
              <img src={asset("photo-portrait-2.webp")} alt="Yara 个人照片" loading="lazy" decoding="async" fetchPriority="low" />
            </picture>
          </div>
        </figure>
      </div>
    </section>
  );
}

function ProjectShowcase({ onOpen }) {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);
  const titleRef = useRef(null);
  const [coversReady, setCoversReady] = useState(false);
  const [motion, setMotion] = useState(() => projects.map(() => 0));
  const [stackSync, setStackSync] = useState(() => projects.map(() => 0));

  useEffect(() => {
    if (!window.IntersectionObserver) {
      setCoversReady(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setCoversReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "600px 0px" });
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;
      const stickyTop = Math.min(Math.max(viewport * 0.26, 190), 240);
      const start = viewport * 0.93;
      const range = Math.max(start - stickyTop, 1);
      const rowRects = rowRefs.current.map((row) => row?.getBoundingClientRect());
      setMotion(projects.map((_, index) => {
        const row = rowRefs.current[index];
        if (!row) return 0;
        const raw = Math.min(Math.max((start - rowRects[index].top) / range, 0), 1);
        return 1 - Math.pow(1 - raw, 3);
      }));

      const lastRow = rowRefs.current[projects.length - 1];
      if (lastRow && titleRef.current) {
        const rowStickyTop = Number.parseFloat(window.getComputedStyle(lastRow).top) || 0;
        const lastTop = rowRects[projects.length - 1].top;
        const stackIsAligned = lastTop <= rowStickyTop + 0.5;
        setStackSync(projects.map((_, index) => {
          const rowTop = rowRects[index]?.top;
          return stackIsAligned && Number.isFinite(rowTop) ? lastTop - rowTop : 0;
        }));
        const exitOffset = Math.min(lastTop - rowStickyTop, 0);
        titleRef.current.style.setProperty("--project-exit-y", `${exitOffset}px`);
      }
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section id="projects" className="project-showcase" aria-label="重点项目" ref={sectionRef}>
      <h2 className="project-title" ref={titleRef}>Project</h2>
      <div className="project-list">
        {projects.map((project, index) => {
          const eased = motion[index] ?? 0;
          const syncOffset = stackSync[index] ?? 0;
          return (
            <div
              className={`project-sticky-row${index === projects.length - 1 ? " project-sticky-row-last" : ""}`}
              key={project.cover}
              ref={(node) => { rowRefs.current[index] = node; }}
              style={{ zIndex: index + 1 }}
            >
              <button
                className="project-cover"
                onClick={() => onOpen(project)}
                aria-label={`打开完整项目：${project.title}`}
                style={{
                  transform: `translate3d(0, calc(${(1 - eased) * 18}% + ${syncOffset}px), 0) rotate(${(1 - eased) * 10}deg) scale(${0.98 + eased * 0.02})`,
                }}
              >
                {coversReady ? (
                  <picture>
                    <source media="(max-width: 720px)" srcSet={project.mobileCover} type="image/webp" />
                    <img src={project.cover} alt={`${project.title}封面`} loading="eager" decoding="async" />
                  </picture>
                ) : <span className="project-cover-placeholder" aria-hidden="true" />}
              </button>
            </div>
          );
        })}
        <div className="project-exit-space" aria-hidden="true" />
      </div>
    </section>
  );
}

function OtherProjectCard({ project, onOpen }) {
  return (
    <button
      className="other-card other-card-button"
      onClick={() => onOpen(project)}
      aria-label={`打开${project.title || `其他项目 ${project.index}`}`}
    >
      <img src={project.src} alt={`${project.title || `其他项目作品 ${project.index}`}封面`} loading="lazy" decoding="async" fetchPriority="low" />
      {project.type === "video" && <span className="other-video-mark" aria-hidden="true">▶</span>}
    </button>
  );
}

function OtherProjects({ onOpen }) {
  return (
    <section className="other-projects" aria-labelledby="other-project-title">
      <h2 id="other-project-title" className="other-project-title">Other Project</h2>
      <div className="other-columns" aria-label="其他项目瀑布流">
        {otherProjectColumns.map((column, columnIndex) => (
          <div className="other-column" key={columnIndex}>
            {column.map((project) => <OtherProjectCard project={project} onOpen={onOpen} key={project.src} />)}
          </div>
        ))}
      </div>
      <div className="other-mobile-stream" aria-label="其他项目瀑布流">
        {otherProjects.map((project) => <OtherProjectCard project={project} onOpen={onOpen} key={project.src} />)}
      </div>
    </section>
  );
}

function PortfolioApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [heroReady, setHeroReady] = useState(false);
  const markHeroReady = useCallback(() => setHeroReady(true), []);

  useEffect(() => {
    const overlay = document.getElementById("site-preloader");
    if (!overlay) return undefined;

    let removeTimer;
    const revealTimer = window.setTimeout(() => {
      overlay.classList.add("is-hidden");
      removeTimer = window.setTimeout(() => overlay.remove(), 650);
    }, heroReady ? 100 : 2500);
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(removeTimer);
    };
  }, [heroReady]);

  // Warm the next sections in small batches without competing with the hero.
  useEffect(() => {
    if (!heroReady || navigator.connection?.saveData) return undefined;
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const queue = [
      asset(mobile ? "photo-portrait-left-mobile.webp" : "photo-portrait-left.jpg"),
      asset(mobile ? "photo-portrait-2-mobile.webp" : "photo-portrait-2.webp"),
      mobile ? projects[0].mobileCover : projects[0].cover,
    ];
    let disposed = false;
    const warm = async () => {
      while (!disposed && queue.length) {
        await Promise.all(queue.splice(0, 2).map((src) => new Promise((resolve) => {
          const image = new Image();
          image.fetchPriority = "low";
          image.onload = image.onerror = resolve;
          image.src = src;
        })));
      }
    };
    const timer = window.setTimeout(warm, 3500);
    return () => { disposed = true; window.clearTimeout(timer); };
  }, [heroReady]);

  useEffect(() => {
    document.body.style.overflow = activeProject ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeProject]);

  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setActiveProject(null);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const jumpTo = (id) => {
    setMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const isPosterPreview = Boolean(
    activeProject
    && activeProject.type !== "video"
    && !activeProject.detail
    && !activeProject.full
  );

  return (
    <main>
      <PointerRipples />
      <header className="site-header">
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="主导航">
          <button onClick={() => jumpTo("#about")}>关于</button>
          <button onClick={() => jumpTo("#projects")}>项目</button>
          <button onClick={() => jumpTo("#contact")}>联系</button>
        </nav>
        <button className={menuOpen ? "menu-button active" : "menu-button"} onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="打开导航菜单">
          <span /><span />
        </button>
      </header>

      <HeroSection onReady={markHeroReady} />

      <AboutSection />

      <ProjectShowcase onOpen={setActiveProject} />

      <OtherProjects onOpen={setActiveProject} />

      <footer id="contact" className="footer section-shell">
        <p>Portfolio</p>
        <h2>Let&apos;s create{" "}<br />something vivid.</h2>
        <div className="footer-contacts" aria-label="联系方式">
          <a href="?contact=wechat" target="_blank" rel="noopener noreferrer" aria-label="在新页面查看微信联系方式" title="微信"><ContactIcon type="wechat" /></a>
          <a href="?contact=email" target="_blank" rel="noopener noreferrer" aria-label="在新页面查看邮箱联系方式" title="邮箱"><ContactIcon type="email" /></a>
        </div>
        <div className="footer-row"><span>Yara / Visual Designer</span><span>© 2026 Portfolio</span></div>
      </footer>

      {activeProject && (
        <div className="project-modal" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActiveProject(null);
        }}>
          <div className={`project-window${activeProject.type === "video" ? " project-video-window" : isPosterPreview ? ` project-preview-window${activeProject.previewSize === "wide" ? " project-preview-window-wide" : ""}` : ""}`} role="dialog" aria-modal="true" aria-label={`${activeProject.title || `其他项目 ${activeProject.index}`}完整项目`}>
            <div className="modal-bar">
              <div><span>{activeProject.index}</span><strong>{activeProject.title || `其他项目 ${activeProject.index}`}</strong></div>
              <button onClick={() => setActiveProject(null)} aria-label="关闭项目">关闭</button>
            </div>
            <div className="modal-scroll">
              {activeProject.type === "video" ? (
                <video className="modal-video" controls playsInline preload="metadata" poster={activeProject.src}>
                  <source src={activeProject.video} type="video/mp4" />
                  当前浏览器不支持视频播放。
                </video>
              ) : (
                <img src={activeProject.detail || activeProject.preview || activeProject.src} alt={`${activeProject.title || `其他项目 ${activeProject.index}`}完整长图`} />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export function App() {
  const contactType = new URLSearchParams(window.location.search).get("contact");
  return contactType && contactDetails[contactType]
    ? <ContactDetailPage type={contactType} />
    : <PortfolioApp />;
}
