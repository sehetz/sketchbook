import { useMemo, useRef } from "react";
import { resolveMediaPath } from "../../utils/mediaManifest.js";

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
      e.currentTarget.src = computed.secondary;
      return;
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
      style={style}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      onLoad={onLoad}
    />
  );
}
