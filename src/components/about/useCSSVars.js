import { useState, useEffect, useMemo } from "react";
import { getCSSVar, parseCSSValueInPx } from "./timelineUtils.js";

export function useCSSVars() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return useMemo(() => {
    const root = document.documentElement;
    return {
      // Colors
      colorFg: getCSSVar("--color-fg", root),
      colorBg: getCSSVar("--color-bg", root),
      colorCircle: getCSSVar("--color-timeline-circle", root),
      colorGradientStart: getCSSVar("--color-timeline-gradient-start", root),
      colorGradientEnd: getCSSVar("--color-timeline-gradient-end", root),
      // Dimensions
      dotRadiusDesktop: parseCSSValueInPx("--timeline-dot-radius-desktop", root),
      dotRadiusMobile: parseCSSValueInPx("--timeline-dot-radius-mobile", root),
      dotHitArea: parseCSSValueInPx("--timeline-dot-hit-area", root),
      yearSpacingDesktop: parseCSSValueInPx("--timeline-year-spacing-desktop", root),
      yearSpacingMobile: parseCSSValueInPx("--timeline-year-spacing-mobile", root),
      projectStackY: parseCSSValueInPx("--timeline-project-stack-y", root),
      projectStackYMobile: parseCSSValueInPx("--timeline-project-stack-y-mobile", root),
      barWidthDesign: parseCSSValueInPx("--timeline-bar-width-design", root),
      barWidthNondesign: parseCSSValueInPx("--timeline-bar-width-nondesign", root),
      barRadiusDesign: parseCSSValueInPx("--timeline-bar-radius-design", root),
      barRadiusNondesign: parseCSSValueInPx("--timeline-bar-radius-nondesign", root),
      barOvershoot: parseCSSValueInPx("--timeline-bar-overshoot", root),
      circleRadiusDesign: parseCSSValueInPx("--timeline-circle-radius-design", root),
      circleRadiusNondesign: parseCSSValueInPx("--timeline-circle-radius-nondesign", root),
      circleOffset: parseCSSValueInPx("--timeline-circle-offset", root),
      labelOffsetAboveBar: parseCSSValueInPx("--timeline-label-offset-above-bar", root),
      labelLineHeight: parseCSSValueInPx("--timeline-label-line-height", root),
      labelLineHeightMobile: parseCSSValueInPx("--timeline-label-line-height-mobile", root),
      teamsMinGap: parseCSSValueInPx("--timeline-teams-min-gap", root),
      teamsStartX: parseCSSValueInPx("--timeline-teams-start-x", root),
      teamsEndXOffset: parseCSSValueInPx("--timeline-teams-end-x-offset", root),
      tooltipOffsetX: parseCSSValueInPx("--timeline-tooltip-offset-x", root),
      tooltipOffsetXMobile: parseCSSValueInPx("--timeline-tooltip-offset-x-mobile", root),
      tooltipPadding: parseCSSValueInPx("--timeline-tooltip-padding", root),
      tooltipHeight: parseCSSValueInPx("--timeline-tooltip-height", root),
      tooltipHeightMobile: parseCSSValueInPx("--timeline-tooltip-height-mobile", root),
      tooltipPaddingTop: parseCSSValueInPx("--timeline-tooltip-padding-top", root),
      mobileHeaderMargin: parseCSSValueInPx("--timeline-mobile-header-margin", root),
      paddingTop: parseCSSValueInPx("--timeline-padding-top", root),
      paddingRight: parseCSSValueInPx("--timeline-padding-right", root),
      paddingBottom: parseCSSValueInPx("--timeline-padding-bottom", root),
      paddingLeft: parseCSSValueInPx("--timeline-padding-left", root),
      yearFontSize: parseCSSValueInPx("--timeline-year-font-size", root),
      yearFontSizeMobile: parseCSSValueInPx("--timeline-year-font-size-mobile", root),
      labelFontSize: parseCSSValueInPx("--timeline-label-font-size", root),
      labelFontSizeMobile: parseCSSValueInPx("--timeline-label-font-size-mobile", root),
      labelFontWeight: getCSSVar("--timeline-label-font-weight", root),
      labelFontWeightMobile: getCSSVar("--timeline-label-font-weight-mobile", root),
      projectLabelFontSize: parseCSSValueInPx("--timeline-project-label-font-size", root),
      projectLabelFontSizeMobile: parseCSSValueInPx("--timeline-project-label-font-size-mobile", root),
      lineStrokeWidth: parseCSSValueInPx("--line-width", root),
      lineDotSize: parseCSSValueInPx("--line-dot-size", root),
      lineDotGap: parseCSSValueInPx("--line-dot-gap", root),
      fontSans: getCSSVar("--font-sans", root),
    };
  }, [isDarkMode]);
}
