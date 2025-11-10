import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      {/* --- Top Line --- */}
      <div className="footer__top axis-between">
        <p className="text-3">Produced with faults, errors and lot’s of love.</p>
        <p className="text-3">Sarah Heitz 2026</p>
      </div>

      {/* --- Bottom Section --- */}
      <div className="footer__bottom">
        {/* Left Column – Contact */}
        <div className="footer__column text-left">
          <div className="footer__row axis-left">
            <p className="text-3">Contact</p>
          </div>
          <div className="footer__divider">Let’s zoom</div>
          <div className="footer__divider footer__divider--double">Or mail me</div>
        </div>

        {/* Middle Column – Social */}
        <div className="footer__column text-center">
          <div className="footer__row axis-center">
            <p className="text-3">Social</p>
          </div>
          <div className="footer__divider">DM me on Insta</div>
          <div className="footer__divider footer__divider--double">
            or keep distance on Linkedin
          </div>
        </div>

        {/* Right Column – Legal */}
        <div className="footer__column text-right">
          <div className="footer__row axis-right">
            <p className="text-3">Legal</p>
          </div>
          <div className="footer__divider">Privacy Policy</div>
          <div className="footer__divider footer__divider--double">Impressum</div>
        </div>
      </div>
    </footer>
  );
}
