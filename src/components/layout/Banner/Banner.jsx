import "./Banner.css";

export default function Banner({ href = "mailto:hoi@sehetz.ch" }) {
  const bannerText = "Let's work together!";

  return (
    <a 
      href={href}
      className="banner"
      target="_blank"
      rel="noopener noreferrer"
      role="button"
    >
      <div className="banner__content text-3">
        <div className="banner__scroll">
          {/* Repeat text multiple times for seamless loop */}
          {[...Array(100)].map((_, i) => (
            <span key={i} className="banner__text">
              {bannerText}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
