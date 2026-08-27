import { useMemo, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { motion } from "framer-motion";
import type { GraphEdgeDto, GraphNodeDto } from "@agentgraph/graph-schema";
import { NODE_DISPLAY, nodeName } from "@/lib/node-display";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SimNode extends SimulationNodeDatum {
  id: string;
  node: GraphNodeDto;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  edge: GraphEdgeDto;
}

const WIDTH = 640;
const HEIGHT = 420;
const PADDING = 34;

function layout(nodes: GraphNodeDto[], edges: GraphEdgeDto[]) {
  if (nodes.length === 0) return { nodes: [] as SimNode[], edges: [] as Array<{ edge: GraphEdgeDto; x1: number; y1: number; x2: number; y2: number }> };

  const simNodes: SimNode[] = nodes.map((n) => ({ id: n.id, node: n }));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const simLinks: SimLink[] = edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => ({ source: e.source, target: e.target, edge: e }));

  const simulation = forceSimulation(simNodes)
    .force(
      "link",
      forceLink<SimNode, SimLink>(simLinks)
        .id((d) => d.id)
        .distance(95)
        .strength(0.55),
    )
    .force("charge", forceManyBody().strength(-250))
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
    .force("collide", forceCollide(30))
    .stop();

  for (let i = 0; i < 260; i++) simulation.tick();

  for (const n of simNodes) {
    n.x = Math.max(PADDING, Math.min(WIDTH - PADDING, n.x ?? WIDTH / 2));
    n.y = Math.max(PADDING, Math.min(HEIGHT - PADDING, n.y ?? HEIGHT / 2));
  }

  const byId = new Map(simNodes.map((n) => [n.id, n]));
  const positionedEdges = simLinks
    .map((l) => {
      const sourceId = typeof l.source === "object" ? l.source.id : String(l.source);
      const targetId = typeof l.target === "object" ? l.target.id : String(l.target);
      const source = byId.get(sourceId);
      const target = byId.get(targetId);
      if (!source || !target) return null;
      return { edge: l.edge, x1: source.x!, y1: source.y!, x2: target.x!, y2: target.y! };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  return { nodes: simNodes, edges: positionedEdges };
}

export function GraphCanvas({
  nodes,
  edges,
  highlightId,
  onNodeClick,
}: {
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
  highlightId?: string;
  onNodeClick?: (node: GraphNodeDto) => void;
}) {
  const { nodes: positioned, edges: positionedEdges } = useMemo(() => layout(nodes, edges), [nodes, edges]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <TooltipProvider delayDuration={100}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full" role="img" aria-label="Graph visualization">
        <g strokeLinecap="round">
          {positionedEdges.map((e, i) => (
            <motion.line
              key={e.edge.id + i}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="currentColor"
              className="text-border"
              strokeWidth={1.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
            />
          ))}
        </g>
        <g>
          {positioned.map((n, i) => {
            const display = NODE_DISPLAY[n.node.label];
            const isHighlighted = n.id === highlightId;
            const isHovered = n.id === hoveredId;
            return (
              <Tooltip key={n.id}>
                <TooltipTrigger asChild>
                  <motion.g
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.02 * i }}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredId(n.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onNodeClick?.(n.node)}
                  >
                    {isHighlighted && (
                      <circle cx={n.x} cy={n.y} r={16} className={cn(display.fill, "opacity-20")} />
                    )}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isHovered || isHighlighted ? 9 : 7}
                      className={cn(display.fill, "stroke-card transition-[r]")}
                      strokeWidth={2}
                    />
                    <text
                      x={n.x}
                      y={(n.y ?? 0) + 20}
                      textAnchor="middle"
                      className="fill-foreground text-[9px] font-medium"
                      style={{ pointerEvents: "none" }}
                    >
                      {truncate(nodeName(n.node.properties), 16)}
                    </text>
                  </motion.g>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{nodeName(n.node.properties)}</p>
                  <p className="text-muted-foreground">{n.node.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </g>
      </svg>
    </TooltipProvider>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
