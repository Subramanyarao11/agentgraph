import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const WhyGraphScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Why Graph Background"
      style={{
        backgroundColor: "#0a0d14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 140px",
      }}
    >
      <Interactive.Div
        name="Headline"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 46,
          fontWeight: 600,
          color: "#f5f6f8",
          textAlign: "center",
          lineHeight: 1.35,
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0, 0.5 * fps], ["0px 12px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Agents, tools, workflows, and data form a dense web of many-to-many relationships.
      </Interactive.Div>

      <Interactive.Div
        name="Subline"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 28,
          fontWeight: 400,
          color: "#94a3b8",
          textAlign: "center",
          lineHeight: 1.5,
          marginTop: 34,
          opacity: interpolate(frame, [0.9 * fps, 1.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        "What breaks if this tool goes down?" — multi-hop traversals, natural in Cypher,
        <br />
        expensive joins in SQL.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
