// ============================================
// ImageBlock.jsx – unified grid + 4-per-row with proper aspect ratios
// ============================================

import MasterMediaImage from '../../../common/MasterMediaImage.jsx';
import { alt_generate } from '../../../../utils/seoHelpers.js';

export default function ImageBlock({ images, projectTitle = "" }) {
  // Defensive: ensure images is an array
  let imageArray = images;
  if (!Array.isArray(images)) {
    return null;
  }
  
  if (!imageArray?.length) {
    return null;
  }

  const isVideo = (att) => {
    const mime = att.mimetype || att.type || "";
    const name = (att.name || "").toLowerCase();
    return mime.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(name);
  };

  // CASE 1: Single image (16:9 fullwidth)
  if (images.length === 1) {
    const item = images[0];
    const altText = alt_generate(item.name, projectTitle, 0);
    const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
    const videoSrc = `${NOCO}/${item.signedPath || item.path}`;
    
    return (
      <div className="image-block">
        <div className="image-wrapper image-wrapper--16x9">
          {isVideo(item) ? (
            <video
              className="image-media"
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <MasterMediaImage
              file={item}
              className="image-media"
              alt={altText}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>
    );
  }

  // CASE 2: Multiple images (4:5 grid)
  const isFourGrid = images.length >= 4;
  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";

  return (
    <div className="image-block">
      <div className={`image-grid ${isFourGrid ? "image-grid--4col" : ""}`}>
        {images.map((item, i) => {
          const altText = alt_generate(item.name, projectTitle, i);
          const videoSrc = `${NOCO}/${item.signedPath || item.path}`;

          return (
            <div key={i} className="image-wrapper image-wrapper--3x4">
              {isVideo(item) ? (
                <video
                  className="image-media"
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <MasterMediaImage
                  file={item}
                  className="image-media"
                  alt={altText}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

