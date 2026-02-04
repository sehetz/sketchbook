import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBX, useGLTF } from "@react-three/drei";
import { resolveMediaPath } from "../../utils/project.js";

// === CONSTANTS ===
const MODEL_POSITION = [2, -2.25, 0];
const MODEL_POSITION_MOBILE = [0, -2, 0];

const DEFAULT_CAMERA_POSITION = [-5, 2.5, 15];
const DEFAULT_CAMERA_FOV = 35;

const AMBIENT_INTENSITY = 1.0;
const DIRECTIONAL_1_POSITION = [5, 10, 7];
const DIRECTIONAL_1_INTENSITY = 1.2;
const DIRECTIONAL_2_POSITION = [-5, -10, -7];
const DIRECTIONAL_2_INTENSITY = 0.5;
const POINT_POSITION = [0, 10, 0];
const POINT_INTENSITY = 0.6;
const SHADOW_MAP_SIZE = 1048;
const BACKGROUND_COLOR = "var(--color-surface)";

const CONTROLS_ENABLE_PAN = true;
const CONTROLS_ENABLE_ZOOM = true;
const CONTROLS_ENABLE_ROTATE = true;
const CONTROLS_MIN_DISTANCE = 5;
const CONTROLS_MAX_DISTANCE = 40;
const CONTROLS_TARGET = [0, 0, 0];

// === ERROR BOUNDARY ===
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
      const { debugPaths, isMobile } = this.props;
      return (
        <div style={{
          width: '100%',
          aspectRatio: isMobile ? '3 / 4' : '16 / 9',
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

// === HELPER FUNCTIONS ===
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

function getFileExtension(url) {
  if (!url) return null;
  const path = url.split('?')[0]; // Remove query params
  const ext = path.split('.').pop()?.toLowerCase();
  return ext;
}

function FBXModel({ url, position }) {
  const fbx = useFBX(url);
  return <primitive object={fbx} position={position} />;
}

function GLBModel({ url, position }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} position={position} />;
}

function Model3D({ url, position }) {
  const ext = getFileExtension(url);
  
  if (ext === 'glb' || ext === 'gltf') {
    return <GLBModel url={url} position={position} />;
  }
  
  if (ext === 'fbx') {
    return <FBXModel url={url} position={position} />;
  }
  
  // Default to FBX for backwards compatibility
  return <FBXModel url={url} position={position} />;
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
    
    // Debug logging für 3D-Dateien
    const ext = getFileExtension(primary);
    if (ext === 'fbx' || ext === 'glb' || ext === 'gltf') {
      console.log('[MasterMedia3D] Loading 3D model:', {
        rawFilename,
        localSrc,
        computedRemoteSrc,
        primary,
        secondary,
        format: ext
      });
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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const controlsRef = useRef(null);
  const containerDivRef = useRef(null);
  
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

  // Reset camera when mobile state changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, [isMobile]);

  // Reset camera when model source changes
  useEffect(() => {
    if (currentSrc && controlsRef.current) {
      // Small delay to ensure model is loaded
      const timer = setTimeout(() => {
        controlsRef.current?.reset();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSrc]);

  const aspectStyle = isMobile ? {
    width: '100%',
    maxWidth: '100%',
    aspectRatio: '3 / 4',
    height: 'auto',
    background,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'var(--size-svg-rx, 6px)',
    touchAction: 'pan-y',
    ...style,
  } : {
    width: '100%',
    aspectRatio: '16 / 9',
    background,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 'var(--size-svg-rx, 6px)',
    ...style,
  };

  const controlsButtonStyle = {
    position: 'absolute',
    bottom: 'var(--space-4)',
    right: 'var(--space-4)',
    zIndex: 10,
    display: 'flex',
    gap: 'var(--space-2)',
    background: 'var(--color-bg)',
    borderRadius: 'var(--size-svg-rx, 6px)',
    border: 'var(--stroke-thin) solid var(--color-stroke)',
    padding: 'var(--space-2)',
  };

  const buttonStyle = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-fg)',
    fontSize: '18px',
    transition: 'var(--transition-smooth)',
    padding: 0,
  };

  const zoomIn = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const direction = camera.position.clone().sub(target).normalize();
      const distance = camera.position.distanceTo(target);
      const newDistance = Math.max(controlsMinDistance, distance - 3);
      camera.position.copy(target).add(direction.multiplyScalar(newDistance));
      controlsRef.current.update();
    }
  };

  const zoomOut = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const direction = camera.position.clone().sub(target).normalize();
      const distance = camera.position.distanceTo(target);
      const newDistance = Math.min(controlsMaxDistance, distance + 3);
      camera.position.copy(target).add(direction.multiplyScalar(newDistance));
      controlsRef.current.update();
    }
  };

  const handleCanvasCreated = (gl) => {
    // Reset camera when canvas is created
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
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
      <ModelErrorBoundary isMobile={isMobile} debugPaths={{primary: computedEarly.primary, secondary: computedEarly.secondary}}>
        <div className={className} style={aspectStyle} />
      </ModelErrorBoundary>
    );
  }

  return (
    <ModelErrorBoundary isMobile={isMobile} debugPaths={{primary: computedEarly.primary, secondary: computedEarly.secondary}} onError={handleModelError}>
      <div ref={containerDivRef} className={className} style={aspectStyle}>
        {/* Zoom Controls - Mobile & Desktop */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: 'var(--space-2, 6px)',
          pointerEvents: 'auto',
        }}>
          {[
            { label: 'Zoom in', icon: '+', handler: zoomIn },
            { label: 'Zoom out', icon: '−', handler: zoomOut },
          ].map((btn) => (
            <button
              key={btn.label}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                btn.handler();
              }}
              style={{
                background: 'rgba(246, 246, 246, 0.5)',
                color: 'var(--color-fg)',
                border: 'none',
                width: 'var(--space-12, 48px)',
                height: 'var(--space-12, 48px)',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--text-2-size)',
                lineHeight: 'var(--text-2-line)',
                fontWeight: 425,
                transition: 'var(--transition-smooth)',
                padding: 0,
                touchAction: 'none',
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--color-bg)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(246, 246, 246, 0.5)'}
              aria-label={btn.label}
            >
              {btn.icon}
            </button>
          ))}
        </div>
        <Canvas 
          camera={{ position: cameraPosition, fov: cameraFov }} 
          shadows 
          onCreated={({ gl }) => handleCanvasCreated(gl)}
        >
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
            <Model3D url={currentSrc} position={isMobile ? MODEL_POSITION_MOBILE : MODEL_POSITION} />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={false}
            enableRotate={true}
            minDistance={controlsMinDistance}
            maxDistance={controlsMaxDistance}
            target={controlsTarget}
            enableDamping
            autoRotate={false}
            mouseButtons={{
              LEFT: 0,   // Left click: Rotate
              MIDDLE: 0, // Middle: Rotate
              RIGHT: 2,  // Right click: Pan
            }}
            touches={{
              ONE: 0,    // 1-finger: Rotate
              TWO: 2,    // 2-finger: Pan
            }}
          />
        </Canvas>
      </div>
    </ModelErrorBoundary>
  );
}
