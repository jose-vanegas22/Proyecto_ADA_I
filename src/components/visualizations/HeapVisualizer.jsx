/**
 * HeapVisualizer.jsx
 * Visualiza el Max-Heap como árbol binario usando SVG.
 * Los nodos se posicionan por nivel con separación proporcional.
 */

import { useMemo } from 'react';

const PRIORITY_COLOR = { Alta: '#f87171', Media: '#fbbf24', Baja: '#34d399' };
const NODE_R = 26;
const LEVEL_H = 80;
const BASE_W = 800;

export function HeapVisualizer({ heap }) {
  const nodes = useMemo(() => {
    if (!heap || heap.length === 0) return [];

    const positions = [];

    // Calculamos posición X por nivel
    // Nivel 0: centro; Nivel 1: ±offset; etc.
    function getX(idx) {
      const level = Math.floor(Math.log2(idx + 1));
      const levelStart = Math.pow(2, level) - 1;
      const levelCount = Math.pow(2, level);
      const posInLevel = idx - levelStart;
      const step = BASE_W / (levelCount + 1);
      return step * (posInLevel + 1);
    }

    for (let i = 0; i < heap.length; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const x = getX(i);
      const y = 40 + level * LEVEL_H;
      const parentIdx = i > 0 ? Math.floor((i - 1) / 2) : null;
      positions.push({ idx: i, task: heap[i], x, y, level, parentIdx });
    }

    return positions;
  }, [heap]);

  const svgHeight = nodes.length === 0 ? 80 : 40 + (Math.floor(Math.log2(nodes.length)) + 1) * LEVEL_H + 40;

  if (!heap || heap.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⬡</div>
        <p>El Heap está vacío. Agrega tareas para visualizar.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={BASE_W} height={svgHeight} style={{ display: 'block', margin: '0 auto' }}>
        {/* Líneas padre→hijo */}
        {nodes.map(({ idx, x, y, parentIdx }) => {
          if (parentIdx === null) return null;
          const parent = nodes[parentIdx];
          return (
            <line
              key={`line-${idx}`}
              x1={parent.x} y1={parent.y}
              x2={x} y2={y}
              stroke="#2a2a3a"
              strokeWidth="2"
            />
          );
        })}

        {/* Nodos */}
        {nodes.map(({ idx, task, x, y }) => {
          const color = PRIORITY_COLOR[task.prioridad] ?? '#8888aa';
          const isRoot = idx === 0;
          return (
            <g key={`node-${idx}`}>
              {/* Glow para el root */}
              {isRoot && (
                <circle cx={x} cy={y} r={NODE_R + 6}
                  fill={color} opacity={0.12} />
              )}
              <circle
                cx={x} cy={y} r={NODE_R}
                fill="#16161e"
                stroke={color}
                strokeWidth={isRoot ? 2.5 : 1.5}
              />
              {/* Índice (pequeño, arriba a la derecha) */}
              <text x={x + NODE_R - 4} y={y - NODE_R + 8}
                fontSize="8" fill="#55556a" fontFamily="DM Mono">
                [{idx}]
              </text>
              {/* Prioridad (inicial) */}
              <text x={x} y={y - 6}
                textAnchor="middle" fontSize="10"
                fill={color} fontFamily="DM Mono" fontWeight="600">
                {task.prioridad.slice(0, 1).toUpperCase()}
              </text>
              {/* ID */}
              <text x={x} y={y + 7}
                textAnchor="middle" fontSize="9"
                fill="#8888aa" fontFamily="DM Mono">
                #{task.id}
              </text>
              {/* Tooltip-like: título truncado debajo */}
              <text x={x} y={y + NODE_R + 14}
                textAnchor="middle" fontSize="9"
                fill="#55556a" fontFamily="Sora">
                {task.titulo?.length > 10 ? task.titulo.slice(0, 10) + '…' : task.titulo}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
        {Object.entries(PRIORITY_COLOR).map(([p, c]) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block', boxShadow: `0 0 4px ${c}` }} />
            {p}
          </div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          ★ Raíz = mayor prioridad
        </div>
      </div>
    </div>
  );
}
