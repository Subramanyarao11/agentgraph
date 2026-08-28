import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TitleScene } from "./scenes/TitleScene";
import { WhyGraphScene } from "./scenes/WhyGraphScene";
import { ScreenshotScene } from "./scenes/ScreenshotScene";
import { GraphExplorerScene } from "./scenes/GraphExplorerScene";
import { TechStackScene } from "./scenes/TechStackScene";
import { OutroScene } from "./scenes/OutroScene";

export const MyVideo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90} name="Title">
        <TitleScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="WhyGraph">
        <WhyGraphScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="Dashboard">
        <ScreenshotScene
          src="screens/dashboard.jpg"
          eyebrow="Dashboard"
          caption="Live overview — real seeded data, backed by CognoDB Cloud"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={150} name="GraphExplorer">
        <GraphExplorerScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="ImpactAnalysis">
        <ScreenshotScene
          src="screens/impact-analysis.jpg"
          eyebrow="Impact Analysis"
          caption="What breaks if this tool goes down? Variable-length traversal, N hops out"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="SensitiveExposure">
        <ScreenshotScene
          src="screens/sensitive-data-exposure.jpg"
          eyebrow="Sensitive-Data Exposure"
          caption="Which agents can reach PII, however indirectly — shortest path, ranked by hops"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="SimilarityLeaderboard">
        <ScreenshotScene
          src="screens/similarity-leaderboard.jpg"
          eyebrow="Similarity Leaderboard"
          caption="Expensive O(n²) computation, offloaded to a BullMQ background job"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="Observability">
        <ScreenshotScene
          src="screens/observability.jpg"
          eyebrow="Observability"
          caption="Every request and Cypher query timed live — no external collector"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="GlobalSearch">
        <ScreenshotScene
          src="screens/global-search.jpg"
          eyebrow="Global Search"
          caption="⌘K search across every agent, tool, workflow, dataset, and person"
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="TechStack">
        <TechStackScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />

      <TransitionSeries.Sequence durationInFrames={120} name="Outro">
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
