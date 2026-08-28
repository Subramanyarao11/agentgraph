import { AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const GraphExplorerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const crossfadeStart = 1.6 * fps;
  const crossfadeEnd = 2.1 * fps;

  return (
    <AbsoluteFill name="Graph Explorer Background" style={{ backgroundColor: "#0a0d14", overflow: "hidden" }}>
      <Img
        name="Before expand"
        src={staticFile("screens/graph-explorer-before.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1280,
          height: 720,
          objectFit: "contain",
          objectPosition: "center",
          opacity: interpolate(frame, [crossfadeStart, crossfadeEnd], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
      <Img
        name="After expand"
        src={staticFile("screens/graph-explorer-after.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1280,
          height: 720,
          objectFit: "contain",
          objectPosition: "center",
          opacity: interpolate(frame, [crossfadeStart, crossfadeEnd], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [crossfadeEnd, durationInFrames], [1, 1.045], {
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
        name="Caption stack"
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 56,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <Interactive.Div
          name="Eyebrow"
          style={{
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
          Graph Explorer
        </Interactive.Div>
        <Interactive.Div
          name="Caption"
          style={{
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: 32,
            fontWeight: 600,
            color: "#f5f6f8",
            lineHeight: 1.32,
            opacity: interpolate(frame, [8, 0.55 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Click any node to pull in its connections — live, incremental graph traversal
        </Interactive.Div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
