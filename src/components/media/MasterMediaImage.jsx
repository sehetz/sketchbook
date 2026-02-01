import { useMemo, useRef } from "react";
import { resolveMediaPath } from "../../utils/project.js";

const loggedKeys = new Set();

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

export default function MasterMediaImage({
  file,
  filename,
  remoteSrc,
  alt = "",
  className = "",
  style,
  loading = "lazy",
  decoding = "async",
  onLoad,
  onError: externalOnError,
}) {
  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
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

  const handleError = (e) => {
    if (!triedFallback.current && computed.secondary) {
      triedFallback.current = true;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Media] Remote failed for "${computed.rawFilename}", trying fallback:`, computed.secondary);
      }
      e.currentTarget.src = computed.secondary;
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Media] Failed to load: ${computed.rawFilename}`, {
        primary: computed.primary,
        secondary: computed.secondary,
        triedFallback: triedFallback.current,
      });
    }
    
    externalOnError?.(e);
  };

  if (!computed.primary) {
    return null;
  }

  return (
    <img
      src={computed.primary}
      alt={alt}
      className={className}
      style={{
        ...style,
        // Prevent CLS by maintaining aspect ratio
        aspectRatio: style?.aspectRatio || 'auto',
        objectFit: style?.objectFit || 'cover',
      }}
      loading={loading}
      decoding={decoding}
      fetchPriority={loading === 'eager' ? 'high' : 'auto'}
      onError={handleError}
      onLoad={onLoad}
    />
  );
}
