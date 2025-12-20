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

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    const key = `${computed.rawFilename || ""}|${computed.primary}|${computed.secondary || ""}`;
    if (!loggedKeys.has(key)) {
      loggedKeys.add(key);
      console.log("🎨 MasterMediaImage", {
        filename: computed.rawFilename,
        hasLocal: !!computed.localSrc,
        hasRemote: !!computed.computedRemoteSrc,
        primary: computed.primary,
        secondary: computed.secondary,
      });
    }
  }

  const handleError = (e) => {
    if (!triedFallback.current && computed.secondary) {
      triedFallback.current = true;
      console.warn("📸 Fallback to remote:", computed.rawFilename || computed.computedRemoteSrc);
      e.currentTarget.src = computed.secondary;
      return;
    }
    externalOnError?.(e);
  };

  if (!computed.primary) {
    if (import.meta.env?.DEV) {
      console.warn("🚫 MasterMediaImage: No valid source", { file, filename, remoteSrc });
    }
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
