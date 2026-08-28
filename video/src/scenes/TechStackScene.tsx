import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export const TechStackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const itemStyle = (delay: number): React.CSSProperties => ({
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 32,
    fontWeight: 500,
    color: "#e2e5ea",
    display: "flex",
    alignItems: "center",
    gap: 18,
  });

  return (
    <AbsoluteFill
      name="Tech Stack Background"
      style={{
        backgroundColor: "#0a0d14",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0 160px",
      }}
    >
      <Interactive.Div
        name="Section label"
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#a78bfa",
          marginBottom: 40,
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Under the hood
      </Interactive.Div>

      <Interactive.Div
        name="Stack item 1"
        style={{
          ...itemStyle(0),
          opacity: interpolate(frame, [0.3 * fps, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0.3 * fps, 0.7 * fps], ["-16px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          marginBottom: 22,
        }}
      >
        <span style={{ color: "#6d5bf0" }}>●</span> NestJS · TypeORM · Zod
      </Interactive.Div>

      <Interactive.Div
        name="Stack item 2"
        style={{
          ...itemStyle(0),
          opacity: interpolate(frame, [0.5 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0.5 * fps, 0.9 * fps], ["-16px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          marginBottom: 22,
        }}
      >
        <span style={{ color: "#6d5bf0" }}>●</span> TanStack Start · TanStack Query · shadcn
      </Interactive.Div>

      <Interactive.Div
        name="Stack item 3"
        style={{
          ...itemStyle(0),
          opacity: interpolate(frame, [0.7 * fps, 1.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0.7 * fps, 1.1 * fps], ["-16px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          marginBottom: 22,
        }}
      >
        <span style={{ color: "#6d5bf0" }}>●</span> CognoDB Cloud — Bolt + openCypher
      </Interactive.Div>

      <Interactive.Div
        name="Stack item 4"
        style={{
          ...itemStyle(0),
          opacity: interpolate(frame, [0.9 * fps, 1.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [0.9 * fps, 1.3 * fps], ["-16px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          marginBottom: 22,
        }}
      >
        <span style={{ color: "#6d5bf0" }}>●</span> Redis + BullMQ — async job queue
      </Interactive.Div>

      <Interactive.Div
        name="Stack item 5"
        style={{
          ...itemStyle(0),
          opacity: interpolate(frame, [1.1 * fps, 1.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [1.1 * fps, 1.5 * fps], ["-16px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <span style={{ color: "#6d5bf0" }}>●</span> Docker on Render — API, web, Postgres, Redis
      </Interactive.Div>
    </AbsoluteFill>
  );
};
