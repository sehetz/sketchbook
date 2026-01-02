export default function Footer() {
  // client-side internal navigation (prevents full page reload)
  const handleInternal = (e) => {
    const href = e.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("/")) return;
    e.preventDefault();
    
    // Always navigate, even if same path (to ensure scroll to top and re-render)
    window.history.pushState({}, "", href);
    // notify App about navigation
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <footer className="footer flex-col w-full p-6-all">
      {/* --- Top Line --- */}
      <div className="flex w-full pb-8">
        <p className="flex-1 text-3">
          Made with faults, errors and lot's of love.
        </p>
        <p className="flex-1 text-3 axis-right footer-exception">Sarah Heitz 2026</p>
      </div>

      {/* --- Bottom Section --- */}
      <div className="flex w-full gap-6 pt-6">
        {/* Left Column – Contact */}
        <div className="flex-col flex-1">
          <p className="text-3 pb-2 footer-title">Contact</p>
          <a href="https://open.spotify.com/playlist/55H70kIwDQhHEBM81WNSbp?si=85b728e402dc477d" target="_blank" rel="noopener noreferrer" className="w-full border-top-thin pt-2 pb-2 flex text-3 footer-link">
            Listen to my Spotify
          </a>
          <a href="mailto:hoi@sehetz.ch" className="w-full border-top-thin border-bottom-thin pt-2 pb-2 flex text-3 footer-link">
            Or mail me
          </a>
        </div>
        {/* Middle Column – Social */}
        <div className="flex-col flex-1">
          <p className="text-3 pb-2 axis-center footer-title">Social</p>
          <a href="https://instagram.com/sehetz" target="_blank" rel="noopener noreferrer" className="w-full border-top-thin pt-2 pb-2 flex axis-center text-3 footer-link">
            DM me on Insta
          </a>
          <a href="https://www.linkedin.com/in/sarah-heitz-7b722b118/" target="_blank" rel="noopener noreferrer" className="w-full border-top-thin border-bottom-thin pt-2 pb-2 flex axis-center text-3 footer-link">
            Or keep distance on Linkedin
          </a>
        </div>
        {/* Right Column – Legal */}
        <div className="flex-col flex-1">
          <p className="text-3 pb-2 axis-right footer-title">Legal</p>
          <a href="/privacy" onClick={handleInternal} className="w-full border-top-thin pt-2 pb-2 flex axis-right text-3 footer-link">
            Privacy Policy
          </a>
          <a href="/impressum" onClick={handleInternal} className="w-full border-top-thin border-bottom-thin pt-2 pb-2 flex axis-right text-3 footer-link">
            Imprint
          </a>
        </div>
      </div>
    </footer>
  );
}
