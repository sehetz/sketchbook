export default function Footer() {
  return (
    <footer className="footer flex-col w-full p-6-all">
      {/* --- Top Line --- */}
      <div className="flex w-full pb-8">
        <p className="flex-1 text-3">
          Made with faults, errors and lot’s of love.
        </p>
        <p className="flex-1 text-3 axis-right">Sarah Heitz 2026</p>
      </div>

      {/* --- Bottom Section --- */}
      <div className="flex w-full gap-6 pt-6">
        {/* Left Column – Contact */}
        <div className="flex-col flex-1">
          <p className="text-3 pb-2 axis-left">Contact</p>
          <div className="w-full border-top-thin pt-2 pb-2 flex axis-left text-3">
            Let’s zoom
          </div>
          <div className="w-full border-top-thin border-bottom-thin pt-2 pb-2 flex axis-left text-3">
            Or mail me
          </div>
        </div>
        {/* Middle Column – Social */}
        <div className="flex-col flex-1">
          <p className="text-3 pb-2 axis-center">Social</p>
          <div className="w-full border-top-thin pt-2 pb-2 flex axis-center text-3">
            DM me on Insta
          </div>
          <div className="w-full border-top-thin border-bottom-thin pt-2 pb-2 flex axis-center text-3">
            Or keep distance on Linkedin
          </div>
        </div>
        {/* Right Column – Legal */}
        <div className="flex-col flex-1">
          <p className="text-3 pb-2 axis-right">Legal</p>
          <div className="w-full border-top-thin pt-2 pb-2 flex axis-right text-3">
            Privacy Policy
          </div>
          <div className="w-full border-top-thin border-bottom-thin pt-2 pb-2 flex axis-right text-3">
            Impressum
          </div>
        </div>
      </div>
    </footer>
  );
}
