import "./Banner.css";

export default function Banner({ pdfUrl = "https://raw.githubusercontent.com/sehetz/sketchbook/main/public/Mission%20Iris%20Concept.pdf" }) {
  const bannerText = "Mission Iris + Comic Concept ";

  return (
    <a 
      href={pdfUrl}
      className="banner"
      target="_blank"
      rel="noopener noreferrer"
      role="button"
    >
      <div className="banner__content">
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
