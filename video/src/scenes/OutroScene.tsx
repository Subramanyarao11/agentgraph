import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Outro Background"
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
          width: 88,
          height: 88,
          borderRadius: 22,
          background: "linear-gradient(135deg, #6d5bf0 0%, #4338ca 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
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
        name="Live demo label"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "#a78bfa",
          marginBottom: 16,
          opacity: interpolate(frame, [0.3 * fps, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Live demo
      </Interactive.Div>

      <Interactive.Div
        name="Live URL"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 44,
          fontWeight: 700,
          color: "#f5f6f8",
          marginBottom: 44,
          opacity: interpolate(frame, [0.5 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        agentgraph-web.onrender.com
      </Interactive.Div>

      <Interactive.Div
        name="Repo label"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 24,
          fontWeight: 500,
          color: "#94a3b8",
          opacity: interpolate(frame, [0.9 * fps, 1.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        github.com/Subramanyarao11/agentgraph
      </Interactive.Div>
    </AbsoluteFill>
  );
};
