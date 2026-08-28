import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Title Background"
      style={{
        backgroundColor: "#0a0d14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Interactive.Div
        name="Logo mark"
        style={{
          width: 108,
          height: 108,
          borderRadius: 28,
          background: "linear-gradient(135deg, #6d5bf0 0%, #4338ca 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 36,
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [0, 0.6 * fps], [0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="6" r="2.6" fill="white" />
          <circle cx="18" cy="6" r="2.6" fill="white" />
          <circle cx="12" cy="18" r="2.6" fill="white" />
          <path
            d="M8.2 7.2L15.8 7.2M7 8.3L11 15.7M17 8.3L13 15.7"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </Interactive.Div>

      <Interactive.Div
        name="Product name"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 92,
          fontWeight: 700,
          color: "#f5f6f8",
          letterSpacing: "-0.02em",
          opacity: interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0.3 * fps, 0.9 * fps], ["0px 14px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        AgentGraph
      </Interactive.Div>

      <Interactive.Div
        name="Tagline"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 30,
          fontWeight: 400,
          color: "#94a3b8",
          marginTop: 18,
          textAlign: "center",
          opacity: interpolate(frame, [0.9 * fps, 1.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Agentic workflow impact &amp; lineage intelligence, on a graph
      </Interactive.Div>

      <Interactive.Div
        name="Submission label"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 20,
          fontWeight: 500,
          color: "#5b6472",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          position: "absolute",
          bottom: 72,
          opacity: interpolate(frame, [1.3 * fps, 1.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Wexa AI — Take-Home Submission
      </Interactive.Div>
    </AbsoluteFill>
  );
};
