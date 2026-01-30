// ============================================
// ImageBlock.jsx – unified grid + 4-per-row with proper aspect ratios
// ============================================

import MasterMediaImage from '../../../common/MasterMediaImage.jsx';
import MasterMediaVideo from '../../../common/MasterMediaVideo.jsx';
import MasterMedia3D from '../../../common/MasterMedia3D.jsx';
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

  // Robustere Typ-Erkennung
  const getName = (att) => {
    if (!att) return "";
    return (
      att.name || att.filename || att.title || att.fileName || ""
    ).toString().toLowerCase().trim();
  };

  const getMime = (att) => {
    if (!att) return "";
    return (
      att.mimetype || att.type || att.mimeType || ""
    ).toString().toLowerCase().trim();
  };

  const is3D = (att) => {
    const name = getName(att);
    const mime = getMime(att);
    // Erlaube auch Leerzeichen, Klammern, Sonderzeichen im Namen
    return (
      /\.(fbx|glb|gltf)([?#].*)?$/i.test(name) ||
      mime === "model/fbx" ||
      mime === "model/gltf-binary" ||
      mime === "model/gltf+json" ||
      mime.startsWith("model/3d")
    );
  };

  const isVideo = (att) => {
    const name = getName(att);
    const mime = getMime(att);
    return (
      mime.startsWith("video/") ||
      /\.(mp4|webm|mov|m4v)([?#].*)?$/i.test(name)
    );
  };

  const isImage = (att) => {
    const name = getName(att);
    const mime = getMime(att);
    // Exkludiere 3D und Video
    if (is3D(att) || isVideo(att)) return false;
    return (
      mime.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|tiff?)([?#].*)?$/i.test(name)
    );
  };

  // CASE 1: Single media (16:9 fullwidth)
  if (images.length === 1) {
    const item = images[0];
    const altText = alt_generate(item.name, projectTitle, 0);
    
    return (
      <div className="image-block">
        <div className="image-wrapper image-wrapper--16x9">
          {is3D(item) ? (
            <MasterMedia3D file={item} className="image-media" />
          ) : isVideo(item) ? (
            <MasterMediaVideo
              file={item}
              className="image-media"
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

  return (
    <div className="image-block">
      <div className={`image-grid ${isFourGrid ? "image-grid--4col" : ""}`}>
        {images.map((item, i) => {
          const altText = alt_generate(item.name, projectTitle, i);

          return (
            <div key={i} className="image-wrapper image-wrapper--3x4">
              {is3D(item) ? (
                <MasterMedia3D file={item} className="image-media" />
              ) : isVideo(item) ? (
                <MasterMediaVideo
                  file={item}
                  className="image-media"
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

