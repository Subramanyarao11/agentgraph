import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  src: string;
  eyebrow: string;
  caption: string;
};

export const ScreenshotScene: React.FC<Props> = ({ src, eyebrow, caption }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill name="Screenshot Background" style={{ backgroundColor: "#0a0d14", overflow: "hidden" }}>
      <Img
        name="Screenshot"
        src={staticFile(src)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1280,
          height: 720,
          objectFit: "contain",
          objectPosition: "center",
          scale: interpolate(frame, [0, durationInFrames], [1, 1.055], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.linear,
            output: "perceptual-scale",
          }),
        }}
      />
      <AbsoluteFill
        name="Bottom gradient"
        style={{
          background: "linear-gradient(to top, rgba(6,8,13,0.92) 0%, rgba(6,8,13,0.55) 40%, rgba(6,8,13,0) 75%)",
        }}
      />
      <Interactive.Div
        name="Eyebrow"
        style={{
          position: "absolute",
          left: 64,
          bottom: 128,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#a78bfa",
          opacity: interpolate(frame, [3, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {eyebrow}
      </Interactive.Div>
      <Interactive.Div
        name="Caption"
        style={{
          position: "absolute",
          left: 64,
          bottom: 64,
          right: 64,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 34,
          fontWeight: 600,
          color: "#f5f6f8",
          lineHeight: 1.3,
          opacity: interpolate(frame, [8, 0.55 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [8, 0.55 * fps], ["0px 10px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {caption}
      </Interactive.Div>
    </AbsoluteFill>
  );
};
