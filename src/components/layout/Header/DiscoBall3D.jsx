import { useEffect, useRef } from 'react';
import p5 from 'p5';

export default function DiscoBall3D({ isRave = false }) {
  const containerRef = useRef(null);
  const sketchRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p) => {
      let rotationY = 0;
      let lastFullRotation = 0;
      let flashIntensity = 0;

      p.setup = () => {
        const size = 26; // ~1.6rem in pixels
        const canvas = p.createCanvas(size, size, p.WEBGL);
        canvas.parent(containerRef.current);
        p.smooth();
      };

      // Draw UV Sphere with quad grid (like Blender)
      const drawUVSphere = (radius, latSegments, lonSegments, fgColor, discoLineWidth) => {
        p.stroke(fgColor);
        p.strokeWeight(discoLineWidth);
        p.noFill();

        // Draw latitude lines (horizontal circles)
        for (let lat = 0; lat <= latSegments; lat++) {
          const theta = (lat / latSegments) * p.PI;
          const y = -radius * p.cos(theta);
          const ringRadius = radius * p.sin(theta);

          p.beginShape();
          for (let lon = 0; lon <= lonSegments; lon++) {
            const phi = (lon / lonSegments) * p.TWO_PI;
            const x = ringRadius * p.cos(phi);
            const z = ringRadius * p.sin(phi);
            p.vertex(x, y, z);
          }
          p.endShape();
        }

        // Draw longitude lines (vertical circles)
        for (let lon = 0; lon < lonSegments; lon++) {
          const phi = (lon / lonSegments) * p.TWO_PI;

          p.beginShape();
          for (let lat = 0; lat <= latSegments; lat++) {
            const theta = (lat / latSegments) * p.PI;
            const y = -radius * p.cos(theta);
            const ringRadius = radius * p.sin(theta);
            const x = ringRadius * p.cos(phi);
            const z = ringRadius * p.sin(phi);
            p.vertex(x, y, z);
          }
          p.endShape();
        }
      };

      p.draw = () => {
        p.clear();

        // Get CSS variables
        const styles = getComputedStyle(document.documentElement);
        const fgColor = styles.getPropertyValue('--color-fg').trim();
        const bgColor = styles.getPropertyValue('--color-bg').trim();
        const discoLineWidth = parseFloat(styles.getPropertyValue('--disco-line-width')) || 0.5;
        const detailX = parseInt(styles.getPropertyValue('--disco-detail-x')) || 8;
        const detailY = parseInt(styles.getPropertyValue('--disco-detail-y')) || 8;

        // Lighting
        p.ambientLight(255);
        p.directionalLight(255, 255, 255, 0, 0, -1);

        // Rotation on Y-axis only
        if (isRave) {
          rotationY += 0.025; // Fast spin
        } else {
          rotationY += 0.01; // Slow drift
        }

        // Check for full rotation and trigger flash
        const currentRotation = Math.floor(rotationY / p.TWO_PI);
        if (currentRotation > lastFullRotation) {
          lastFullRotation = currentRotation;
          flashIntensity = 255; // Full white flash
        }

        // Fade out flash
        if (flashIntensity > 0) {
          flashIntensity *= 0.85; // Fast fade
          if (flashIntensity < 1) flashIntensity = 0;
        }

        p.rotateY(rotationY);

        // First: Draw solid sphere (background to hide back lines)
        p.push();
        p.fill(bgColor);
        p.noStroke();
        p.sphere(10, 24, 24);
        p.pop();

        // Second: Draw UV sphere grid on top
        drawUVSphere(10, detailY, detailX, fgColor, discoLineWidth);

        // Third: Draw white flash in center when rotation completes
        if (flashIntensity > 0) {
          p.push();
          p.fill(255, 255, 255, flashIntensity);
          p.noStroke();
          p.sphere(3); // Small sphere in the center
          p.pop();
        }
      };
    };

    sketchRef.current = new p5(sketch);

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove();
      }
    };
  }, [isRave]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '26px',
        height: '26px',
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );
}
