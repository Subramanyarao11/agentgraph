import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { m } from "framer-motion";
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

const BASE_WIDTH = 640;
const BASE_HEIGHT = 420;
const PADDING = 36;
const MIN_SCALE = 0.4;
const MAX_SCALE = 4;

function layout(nodes: GraphNodeDto[], edges: GraphEdgeDto[]) {
  // A canvas sized for ~15 nodes gets cramped fast once the graph explorer
  // merges in more neighborhoods — grow the internal coordinate space with
  // node count so the force simulation has room to spread out, instead of
  // packing an ever-denser cluster into a fixed 640x420 box.
  const spread = Math.max(1, Math.sqrt(nodes.length / 18));
  const width = Math.round(BASE_WIDTH * spread);
  const height = Math.round(BASE_HEIGHT * spread);

  if (nodes.length === 0) {
    return { nodes: [] as SimNode[], edges: [] as SimLink[], width, height };
  }

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
    .force("charge", forceManyBody().strength(-260))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collide", forceCollide(30))
    .stop();

  for (let i = 0; i < 260; i++) simulation.tick();

  for (const n of simNodes) {
    n.x = Math.max(PADDING, Math.min(width - PADDING, n.x ?? width / 2));
    n.y = Math.max(PADDING, Math.min(height - PADDING, n.y ?? height / 2));
  }

  return { nodes: simNodes, edges: simLinks, width, height };
}

/** Shortens a line's endpoint so an arrowhead marker lands on the target circle's edge, not under it. */
function shorten(x1: number, y1: number, x2: number, y2: number, gap: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x2: x2 - (dx / dist) * gap, y2: y2 - (dy / dist) * gap };
}

type Transform = { x: number; y: number; k: number };

/** Converts a pointer event to coordinates in the outer <svg>'s own viewBox space (before the pan/zoom <g> transform). */
function toViewBoxPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const local = pt.matrixTransform(ctm.inverse());
  return { x: local.x, y: local.y };
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
  // Callers frequently pass `data?.nodes ?? []` / freshly-mapped arrays, so a
  // new array *reference* shows up on every render (including a `enabled`
  // refetch that resolves to byte-identical data) even though the graph
  // itself hasn't changed. Re-running the 260-tick force simulation on those
  // renders is pure waste, so memoize on an id-based signature instead of
  // object identity — same node/edge set skips the simulation entirely.
  const signature = `${nodes.map((n) => n.id).join(",")}|${edges.map((e) => e.id).join(",")}`;
  // Intentional: re-run only when the id-based signature changes, not on every
  // new-but-equivalent nodes/edges array reference (see comment above).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { nodes: positioned, edges: positionedLinks, width, height } = useMemo(() => layout(nodes, edges), [signature]);

  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const dragRef = useRef<{ id: string } | null>(null);
  const panRef = useRef<{ startWorld: { x: number; y: number }; startTransform: Transform } | null>(null);
  // Wheel/button zoom and the pan/drag pointermove handler below all need the
  // *current* transform, but reading `transform` from the closure goes stale
  // when several updates land inside one React batch (e.g. a few rapid clicks
  // on the zoom button, or a fast wheel gesture) — each computes its delta
  // from the same pre-batch value instead of the previous update's result.
  // Keeping a ref in lockstep sidesteps that; it also lets the pointermove
  // effect below register its window listeners once instead of on every
  // transform change during a drag.
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // A fresh layout invalidates any manual drag overrides from the previous graph.
  useEffect(() => {
    setPositions({});
  }, [signature]);

  const positionOf = (n: SimNode) => positions[n.id] ?? { x: n.x ?? width / 2, y: n.y ?? height / 2 };
  const byId = useMemo(() => new Map(positioned.map((n) => [n.id, n])), [positioned]);

  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    }
    return map;
  }, [edges]);
  const degreeOf = (nodeId: string) => adjacency.get(nodeId)?.size ?? 0;

  function isDimmed(nodeId: string) {
    if (!hoveredId) return false;
    if (nodeId === hoveredId) return false;
    return !adjacency.get(hoveredId)?.has(nodeId);
  }

  function onWheel(e: React.WheelEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    e.preventDefault();
    const cursor = toViewBoxPoint(svg, e.clientX, e.clientY);
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    // Functional update, not transformRef: several wheel ticks (or zoom-button
    // clicks) can fire before React commits and runs the ref-sync effect, so
    // a ref read here would repeatedly compute from the same pre-batch value.
    // `prev` is always the true latest value regardless of batching.
    setTransform((t) => {
      const nextK = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.k * factor));
      const contentX = (cursor.x - t.x) / t.k;
      const contentY = (cursor.y - t.y) / t.k;
      return { k: nextK, x: cursor.x - contentX * nextK, y: cursor.y - contentY * nextK };
    });
  }

  function onBackgroundPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    panRef.current = { startWorld: toViewBoxPoint(svg, e.clientX, e.clientY), startTransform: transformRef.current };
  }

  function onNodePointerDown(e: React.PointerEvent, nodeId: string) {
    e.stopPropagation();
    dragRef.current = { id: nodeId };
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const svg = svgRef.current;
      if (!svg) return;
      if (dragRef.current) {
        const world = toViewBoxPoint(svg, e.clientX, e.clientY);
        const t = transformRef.current;
        const x = (world.x - t.x) / t.k;
        const y = (world.y - t.y) / t.k;
        setPositions((prev) => ({ ...prev, [dragRef.current!.id]: { x, y } }));
      } else if (panRef.current) {
        const world = toViewBoxPoint(svg, e.clientX, e.clientY);
        const { startWorld, startTransform } = panRef.current;
        setTransform({
          ...startTransform,
          x: startTransform.x + (world.x - startWorld.x),
          y: startTransform.y + (world.y - startWorld.y),
        });
      }
    }
    function onUp() {
      dragRef.current = null;
      panRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  function zoomBy(factor: number) {
    const cx = width / 2;
    const cy = height / 2;
    setTransform((t) => {
      const nextK = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.k * factor));
      const contentX = (cx - t.x) / t.k;
      const contentY = (cy - t.y) / t.k;
      return { k: nextK, x: cx - contentX * nextK, y: cy - contentY * nextK };
    });
  }

  function resetView() {
    setTransform({ x: 0, y: 0, k: 1 });
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="relative h-full w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
          role="img"
          aria-label="Graph visualization — scroll to zoom, drag to pan, drag a node to reposition it"
          onWheel={onWheel}
          onPointerDown={onBackgroundPointerDown}
        >
          <defs>
            <marker id="graph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-border" />
            </marker>
          </defs>
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
            <g strokeLinecap="round">
              {positionedLinks.map((l, i) => {
                const source = byId.get(l.edge.source);
                const target = byId.get(l.edge.target);
                if (!source || !target) return null;
                const sp = positionOf(source);
                const tp = positionOf(target);
                const targetR = 6 + Math.min(7, Math.sqrt(degreeOf(target.id)) * 1.7);
                const { x2, y2 } = shorten(sp.x, sp.y, tp.x, tp.y, targetR + 5);
                const dimmed = hoveredId ? l.edge.source !== hoveredId && l.edge.target !== hoveredId : false;
                return (
                  <m.line
                    key={l.edge.id + i}
                    x1={sp.x}
                    y1={sp.y}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth={hoveredId && !dimmed ? 2 : 1.5}
                    markerEnd="url(#graph-arrow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: dimmed ? 0.12 : 1 }}
                    transition={{ duration: 0.3, delay: hoveredId ? 0 : 0.05 * i }}
                  >
                    <title>{l.edge.type}</title>
                  </m.line>
                );
              })}
            </g>
            <g>
              {positioned.map((n, i) => {
                const display = NODE_DISPLAY[n.node.label];
                const isHighlighted = n.id === highlightId;
                const isHovered = n.id === hoveredId;
                const dimmed = isDimmed(n.id);
                const p = positionOf(n);
                const degree = degreeOf(n.id);
                const r = 6 + Math.min(7, Math.sqrt(degree) * 1.7);
                return (
                  <Tooltip key={n.id}>
                    <TooltipTrigger asChild>
                      <m.g
                        // Enter from ~95% scale, not 0 — scaling up from nothing reads as a
                        // cheap "pop", while a near-full-size fade-in feels calmer and more
                        // considered for something that's about to sit still on screen.
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: dimmed ? 0.25 : 1, scale: 1 }}
                        // Opacity is reused for hover-dimming, not just the entrance fade — it
                        // must react instantly regardless of index, so only `scale` (entrance
                        // only) keeps the staggered delay.
                        transition={{ scale: { duration: 0.3, delay: 0.02 * i }, opacity: { duration: 0.15 } }}
                        className="cursor-pointer"
                        onPointerDown={(e) => onNodePointerDown(e, n.id)}
                        onMouseEnter={() => setHoveredId(n.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => onNodeClick?.(n.node)}
                      >
                        {isHighlighted && <circle cx={p.x} cy={p.y} r={r + 7} className={cn(display.fill, "opacity-20")} />}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered || isHighlighted ? r + 2 : r}
                          className={cn(display.fill, "stroke-card transition-[r]")}
                          strokeWidth={2}
                        />
                        <text
                          x={p.x}
                          y={p.y + r + 13}
                          textAnchor="middle"
                          className="fill-foreground text-[9px] font-medium"
                          style={{ pointerEvents: "none" }}
                        >
                          {truncate(nodeName(n.node.properties), 16)}
                        </text>
                      </m.g>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{nodeName(n.node.properties)}</p>
                      <p className="text-tertiary-foreground">
                        {n.node.label} · {degree} connection{degree === 1 ? "" : "s"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </g>
          </g>
        </svg>
        <div className="absolute bottom-2 right-2 flex gap-1 rounded-md border border-border bg-popover/90 p-1 shadow-card backdrop-blur-sm">
          <button
            type="button"
            onClick={() => zoomBy(1.3)}
            aria-label="Zoom in"
            className="flex h-6 w-6 items-center justify-center rounded text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.3)}
            aria-label="Zoom out"
            className="flex h-6 w-6 items-center justify-center rounded text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            aria-label="Reset zoom and pan"
            className="flex h-6 items-center rounded px-1.5 text-[10px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Reset
          </button>
        </div>
      </div>
    </TooltipProvider>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
