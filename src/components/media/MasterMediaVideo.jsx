import { useMemo, useRef } from "react";
import { resolveMediaPath } from "../../utils/project.js";

function extractFilename(file, remoteSrc) {
  if (file?.name) return file.name;
  if (file?.title) return file.title;
  if (!remoteSrc) return null;
  try {
    const url = new URL(remoteSrc);
    const last = url.pathname.split("/").pop();
    return last ? decodeURIComponent(last) : null;
  } catch {
    const last = remoteSrc.split("/").pop();
    return last ? decodeURIComponent(last) : null;
  }
}

export default function MasterMediaVideo({
  file,
  filename,
  remoteSrc,
  className = "",
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  aspectRatio = "",
  onError: externalOnError,
}) {
  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const videoRef = useRef(null);
  const triedFallback = useRef(false);

  const computed = useMemo(() => {
    const rawFilename = filename || extractFilename(file, remoteSrc);
    let computedRemoteSrc = remoteSrc;
    if (!computedRemoteSrc && file) {
      const path = file.signedPath || file.path || file.thumbnails?.card_cover?.signedPath;
      if (path) {
        computedRemoteSrc = `${NOCO}/${path}`;
      }
    }
    const localSrc = rawFilename ? resolveMediaPath(rawFilename) : null;
    const primary = localSrc || computedRemoteSrc || "";
    const secondary = localSrc && computedRemoteSrc && primary !== computedRemoteSrc ? computedRemoteSrc : null;
    return { rawFilename, localSrc, computedRemoteSrc, primary, secondary };
  }, [file, filename, remoteSrc, NOCO]);

  const handleError = () => {
    if (!triedFallback.current && computed.secondary) {
      triedFallback.current = true;
      if (videoRef.current) {
        videoRef.current.src = computed.secondary;
        videoRef.current.load();
      }
      return;
    }

    externalOnError?.();
  };

  if (!computed.primary) {
    return null;
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      display: 'block',
      position: 'relative',
      overflow: 'hidden',
      fontSize: 0,
      lineHeight: 0,
    }}>
      <video
        ref={videoRef}
        className={className}
        src={computed.primary}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        onError={handleError}
        style={{ display: 'block', width: '100%', height: '100%', verticalAlign: 'bottom' }}
      />
      {aspectRatio === '16x9' && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'var(--color-bg)',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}
