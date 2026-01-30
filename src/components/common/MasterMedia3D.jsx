// Objekt-Position (im Frame)
const MODEL_POSITION = [0, -3.5, 0]; // X, Y, Z
const MODEL_POSITION_MOBILE = [-1.5, -2, 0]; // Mobile: X nach links, Y höher
import React, { useMemo, useRef, useEffect, useState, Suspense } from "react";

// ErrorBoundary für 3D-Modelle
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    if (this.props.onError) this.props.onError(error, info);
  }
  render() {
    if (this.state.hasError) {
      // Zeige Pfade, falls übergeben
      const { debugPaths } = this.props;
      return (
        <div style={{
          width: '100%',
          aspectRatio: '16 / 9',
          background: 'var(--color-surface, #f6f6f6)',
          color: '#b00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1em',
          border: '1px solid #eee',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
        }}>
          <span>
            3D-Modell konnte nicht geladen werden.<br/>
            Bitte prüfe die Datei (FBX-Version, Export, Dateiname).<br/>
            <span style={{fontSize:'0.9em',color:'#888'}}>{this.state.error?.message}</span>
            {debugPaths && (
              <div style={{marginTop:8,fontSize:'0.9em',color:'#888',wordBreak:'break-all'}}>
                <div>primary: {debugPaths.primary}</div>
                <div>secondary: {debugPaths.secondary}</div>
              </div>
            )}
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

// === SCENE CONTROLS ===
// Kamera
const DEFAULT_CAMERA_POSITION = [0, -2, 25];
const DEFAULT_CAMERA_FOV = 35;

// Lichtquellen
const AMBIENT_INTENSITY = 1.0;
const DIRECTIONAL_1_POSITION = [5, 10, 7];
const DIRECTIONAL_1_INTENSITY = 1.2;
const DIRECTIONAL_2_POSITION = [-5, -10, -7];
const DIRECTIONAL_2_INTENSITY = 0.5;
const POINT_POSITION = [0, 10, 0];
const POINT_INTENSITY = 0.6;
const SHADOW_MAP_SIZE = 2048;
const BACKGROUND_COLOR = "var(--color-surface)";

// OrbitControls
const CONTROLS_ENABLE_PAN = true;
const CONTROLS_ENABLE_ZOOM = true;
const CONTROLS_ENABLE_ROTATE = true;
const CONTROLS_MIN_DISTANCE = 1;
const CONTROLS_MAX_DISTANCE = 100;
const CONTROLS_TARGET = [0, 0, 0];
import { resolveMediaPath } from "../../utils/mediaManifest.js";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBX } from "@react-three/drei";

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


function FBXModel({ url, position }) {
  const fbx = useFBX(url);
  return <primitive object={fbx} position={position} />;
}

export default function MasterMedia3D({
  file,
  filename,
  remoteSrc,
  className = "",
  style,
  onLoad,
  onError: externalOnError,
  background = BACKGROUND_COLOR,
  cameraPosition = DEFAULT_CAMERA_POSITION,
  cameraFov = DEFAULT_CAMERA_FOV,
  ambientIntensity = AMBIENT_INTENSITY,
  directional1Position = DIRECTIONAL_1_POSITION,
  directional1Intensity = DIRECTIONAL_1_INTENSITY,
  directional2Position = DIRECTIONAL_2_POSITION,
  directional2Intensity = DIRECTIONAL_2_INTENSITY,
  pointPosition = POINT_POSITION,
  pointIntensity = POINT_INTENSITY,
  shadowMapSize = SHADOW_MAP_SIZE,
  controlsEnablePan = CONTROLS_ENABLE_PAN,
  controlsEnableZoom = CONTROLS_ENABLE_ZOOM,
  controlsEnableRotate = CONTROLS_ENABLE_ROTATE,
  controlsMinDistance = CONTROLS_MIN_DISTANCE,
  controlsMaxDistance = CONTROLS_MAX_DISTANCE,
  controlsTarget = CONTROLS_TARGET,
}) {
  // Vor allen Hooks: Wenn keine Datei, sofort abbrechen
  const NOCO = import.meta.env.VITE_NOCO_BASE_URL || "http://localhost:8080";
  const computedEarly = (() => {
    const rawFilename = filename || extractFilename(file, remoteSrc);
    let computedRemoteSrc = remoteSrc;
    if (!computedRemoteSrc && file) {
      const path = file.signedPath || file.path;
      if (path) {
        computedRemoteSrc = `${NOCO}/${path}`;
      }
    }
    const localSrc = rawFilename ? resolveMediaPath(rawFilename) : null;
    
    // PRIORITÄT: Lokale Datei zuerst (zuverlässiger), dann Remote
    let primary = localSrc || computedRemoteSrc || "";
    let secondary = null;
    
    // Wenn beide existieren und unterschiedlich sind, nutze Remote als Fallback
    if (localSrc && computedRemoteSrc && localSrc !== computedRemoteSrc) {
      secondary = computedRemoteSrc;
    }
    
    return { rawFilename, localSrc, computedRemoteSrc, primary, secondary };
  })();
  if (!computedEarly.primary) {
    return null;
  }
  // Alle Hooks nach dem ersten return!
  const [error, setError] = useState(false);
  const [tried3DFallback, setTried3DFallback] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(computedEarly.primary);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    setCurrentSrc(computedEarly.primary);
    setTried3DFallback(false);
    setError(false);
  }, [computedEarly.primary]);

  const aspectStyle = {
    width: '100%',
    aspectRatio: '16 / 9',
    background,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const handleCanvasCreated = (gl) => {
    // gl.setClearColor('#f6f6f6');
  };

  const handleModelError = (e) => {
    // Log detailed error information
    const errorDetails = {
      message: e?.message || 'Unknown error',
      name: e?.name,
      stack: e?.stack,
      url: currentSrc
    };
    console.error('[MasterMedia3D] Load error details:', errorDetails);
    
    if (!tried3DFallback && computedEarly.secondary) {
      console.log('[MasterMedia3D] Trying fallback:', computedEarly.secondary);
      setTried3DFallback(true);
      setCurrentSrc(computedEarly.secondary);
      return;
    }
    console.error('[MasterMedia3D] No fallback available, showing error');
    setError(true);
    externalOnError?.(e);
  };

  if (!currentSrc || error) {
    return (
      <ModelErrorBoundary debugPaths={{primary: computedEarly.primary, secondary: computedEarly.secondary}}>
        <div className={className} style={aspectStyle} />
      </ModelErrorBoundary>
    );
  }

  return (
    <ModelErrorBoundary debugPaths={{primary: computedEarly.primary, secondary: computedEarly.secondary}} onError={handleModelError}>
      <div className={className} style={aspectStyle}>
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} shadows onCreated={({ gl }) => handleCanvasCreated(gl)}>
          {/* Hemisphere light für natürliches Licht */}
          <hemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={1.2} position={[0, 20, 0]} />
          {/* Ambient light */}
          <ambientLight intensity={2.5} />
          {/* Directional light */}
          <directionalLight
            position={directional1Position}
            intensity={directional1Intensity}
            castShadow
            shadow-mapSize-width={shadowMapSize}
            shadow-mapSize-height={shadowMapSize}
          />
          <directionalLight
            position={directional2Position}
            intensity={directional2Intensity}
          />
          <pointLight position={pointPosition} intensity={pointIntensity} />
          <Suspense fallback={null}>
            <FBXModel url={currentSrc} position={isMobile ? MODEL_POSITION_MOBILE : MODEL_POSITION} />
          </Suspense>
          <OrbitControls
            enablePan={controlsEnablePan}
            enableZoom={controlsEnableZoom}
            enableRotate={controlsEnableRotate}
            minDistance={controlsMinDistance}
            maxDistance={controlsMaxDistance}
            target={controlsTarget}
            enableDamping
            mouseButtons={{
              LEFT: 0,
              MIDDLE: 0,
              RIGHT: 0,
            }}
            touches={{
              ONE: 0,
              TWO: 1,
            }}
          />
        </Canvas>
      </div>
    </ModelErrorBoundary>
  );
}
