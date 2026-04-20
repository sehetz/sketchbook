import { useEffect, useRef, useState } from "react";

export default function MasterMediaEmbed({ src, title = "" }) {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState("100svh");

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data?.type === "embed-height" && typeof e.data.height === "number") {
        setHeight(`${e.data.height}px`);
      } else if (e.data?.type === "wheel") {
        window.scrollBy({ top: e.data.deltaY, left: e.data.deltaX, behavior: "instant" });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!src) return null;

  return (
    <div className="image-block">
      <div className="image-wrapper" style={{ background: "transparent" }}>
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          style={{
            width: "100%",
            height,
            border: "none",
            display: "block",
            background: "transparent",
          }}
          loading="lazy"
          scrolling="no"
          allowTransparency="true"
        />
      </div>
    </div>
  );
}
