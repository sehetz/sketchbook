import { useEffect, useRef } from "react";
import p5 from "p5";

export default function BackgroundGrid() {
  const sketchRef = useRef();
  const p5Instance = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      const cols = 6;
      const rows =6;
      let mouseXPos = 0;
      let mouseYPos = 0;

      p.setup = function () {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const canvas = p.createCanvas(width, height);
        canvas.parent(sketchRef.current);
        
        // Track mouse position
        document.addEventListener("mousemove", (e) => {
          mouseXPos = e.clientX;
          mouseYPos = e.clientY;
        });
      };

      p.draw = function () {
        p.background(255);

        const spacingX = p.width / cols;
        const spacingY = p.height / rows;

        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            // Zellmitte
            const px = x * spacingX + spacingX / 2;
            const py = y * spacingY + spacingY / 2;

            const d = p.dist(px, py, mouseXPos, mouseYPos);

            // max Länge relativ zur Zellgröße
            const maxLen = Math.min(spacingX, spacingY) * 0.125;
            let len = p.map(d, 0, p.width, 5, maxLen);
            len = p.constrain(len, 5, maxLen);

            const angle = Math.atan2(py - mouseYPos, px - mouseXPos);

            drawArrow(p, px, py, angle, len);
          }
        }
      };

      p.windowResized = function () {
        if (p.width !== window.innerWidth || p.height !== window.innerHeight) {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
        }
      };

      function drawArrow(p, x, y, angle, len) {
        p.push();
        p.translate(x, y);
        p.rotate(angle);

        p.stroke(0);
        p.strokeWeight(1);
        p.line(0, 0, len, 0);

        p.pop();
      }
    };

    p5Instance.current = new p5(sketch);

    return () => {
      p5Instance.current.remove();
      p5Instance.current = null;
    };
  }, []);

  return <div ref={sketchRef} className="background-grid" />;
}
