import { useAppSelector } from '../store/hooks';
import { selectFlow, type FlowStage } from '../store/flowSlice';

// Which nodes / edges light up for each stage an action travels through.
const ACTIVE_NODES: Record<FlowStage, string[]> = {
  reducer: ['component', 'middleware', 'reducer', 'store'],
  thunk: ['component', 'middleware', 'api'],
  api: ['api', 'reducer', 'store', 'component'],
};
const ACTIVE_EDGES: Record<FlowStage, string[]> = {
  reducer: ['dispatch', 'action', 'state', 'select'],
  thunk: ['dispatch', 'async'],
  api: ['fulfilled', 'state', 'select'],
};

interface NodeDef {
  id: string;
  x: number;
  y: number;
  title: string;
  subtitle: string;
}
const NODES: NodeDef[] = [
  { id: 'component', x: 30, y: 40, title: 'Component', subtitle: 'dispatch() / useSelector' },
  { id: 'middleware', x: 285, y: 40, title: 'Middleware', subtitle: 'thunk runs here' },
  { id: 'api', x: 540, y: 40, title: 'Fake Store API', subtitle: 'fetch products' },
  { id: 'reducer', x: 285, y: 280, title: 'Reducer', subtitle: 'pure (state, action)' },
  { id: 'store', x: 30, y: 280, title: 'Store', subtitle: 'single state tree' },
];

interface EdgeDef {
  id: string;
  d: string;
  label: string;
  labelX: number;
  labelY: number;
  dashed?: boolean;
}
const EDGES: EdgeDef[] = [
  { id: 'dispatch', d: 'M180,72 H285', label: 'dispatch(action)', labelX: 232, labelY: 62 },
  { id: 'async', d: 'M435,72 H540', label: 'async fetch', labelX: 487, labelY: 62, dashed: true },
  { id: 'fulfilled', d: 'M615,104 V180 Q615,200 595,200 H435', label: 'fulfilled', labelX: 560, labelY: 150 },
  { id: 'action', d: 'M360,104 V280', label: 'action', labelX: 388, labelY: 195 },
  { id: 'state', d: 'M285,312 H180', label: 'new state', labelX: 232, labelY: 302 },
  { id: 'select', d: 'M105,280 V104', label: 'useSelector', labelX: 62, labelY: 195 },
];

const NODE_W = 150;
const NODE_H = 64;

export default function ReduxFlowDiagram() {
  const flow = useAppSelector(selectFlow);
  const stage = flow.stage;
  const activeNodes = stage ? ACTIVE_NODES[stage] : [];
  const activeEdges = stage ? ACTIVE_EDGES[stage] : [];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Redux data flow (live)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Every action is unidirectional. Add or remove items, or change a filter,
          and watch the path the action travels light up in real time.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <svg
          viewBox="0 0 720 360"
          className="w-full"
          role="img"
          aria-label="Redux unidirectional data flow diagram"
        >
          {/* key={seq} remounts the graphic each dispatch so the pulse replays */}
          <g key={flow.seq}>
            <style>{`
              @keyframes flowpulse {
                0% { opacity: 0.35; }
                40% { opacity: 1; }
                100% { opacity: 1; }
              }
              .flow-active { animation: flowpulse 0.6s ease-out; }
            `}</style>

            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#cbd5e1" />
              </marker>
              <marker id="arrow-on" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
              </marker>
            </defs>

            {/* Edges */}
            {EDGES.map((e) => {
              const on = activeEdges.includes(e.id);
              return (
                <g key={e.id} className={on ? 'flow-active' : undefined}>
                  <path
                    d={e.d}
                    fill="none"
                    stroke={on ? '#2563eb' : '#cbd5e1'}
                    strokeWidth={on ? 3 : 2}
                    strokeDasharray={e.dashed ? '6 5' : undefined}
                    markerEnd={on ? 'url(#arrow-on)' : 'url(#arrow)'}
                  />
                  <text
                    x={e.labelX}
                    y={e.labelY}
                    textAnchor="middle"
                    className="select-none"
                    fontSize="11"
                    fill={on ? '#2563eb' : '#94a3b8'}
                    fontWeight={on ? 600 : 400}
                  >
                    {e.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((n) => {
              const on = activeNodes.includes(n.id);
              return (
                <g key={n.id} className={on ? 'flow-active' : undefined}>
                  <rect
                    x={n.x}
                    y={n.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={14}
                    fill={on ? '#2563eb' : '#ffffff'}
                    stroke={on ? '#1d4ed8' : '#cbd5e1'}
                    strokeWidth={on ? 2 : 1.5}
                  />
                  <text
                    x={n.x + NODE_W / 2}
                    y={n.y + 26}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight={600}
                    fill={on ? '#ffffff' : '#1e293b'}
                  >
                    {n.title}
                  </text>
                  <text
                    x={n.x + NODE_W / 2}
                    y={n.y + 45}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill={on ? '#dbeafe' : '#94a3b8'}
                  >
                    {n.subtitle}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Last action:</span>
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
            {flow.lastActionType ?? '— (dispatch something)'}
          </code>
          {stage && (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 font-medium text-sky-700">
              stage: {stage}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          {
            t: 'Sync action',
            d: 'e.g. cart/addItem → middleware → reducer produces the next state → components re-read via useSelector.',
          },
          {
            t: 'Async thunk (pending)',
            d: 'products/fetch/pending fires as the thunk starts and calls the Fake Store API.',
          },
          {
            t: 'Async thunk (fulfilled)',
            d: 'The API response dispatches products/fetch/fulfilled → reducer stores the items.',
          },
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">{c.t}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
