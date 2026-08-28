import "./index.css";
import { Composition, Folder } from "remotion";
import { MyVideo } from "./MyVideo";
import { TitleScene } from "./scenes/TitleScene";
import { WhyGraphScene } from "./scenes/WhyGraphScene";
import { GraphExplorerScene } from "./scenes/GraphExplorerScene";
import { TechStackScene } from "./scenes/TechStackScene";
import { OutroScene } from "./scenes/OutroScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="AgentGraphDemo-Scenes">
        <Composition id="Title" component={TitleScene} durationInFrames={120} fps={30} width={1280} height={720} />
        <Composition id="WhyGraph" component={WhyGraphScene} durationInFrames={150} fps={30} width={1280} height={720} />
        <Composition
          id="GraphExplorer"
          component={GraphExplorerScene}
          durationInFrames={180}
          fps={30}
          width={1280}
          height={720}
        />
        <Composition id="TechStack" component={TechStackScene} durationInFrames={180} fps={30} width={1280} height={720} />
        <Composition id="Outro" component={OutroScene} durationInFrames={165} fps={30} width={1280} height={720} />
      </Folder>
      <Composition id="AgentGraphDemo" component={MyVideo} durationInFrames={1815} fps={30} width={1280} height={720} />
    </>
  );
};
