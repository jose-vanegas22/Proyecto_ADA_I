/**
 * AVLVisualizer.jsx
 * Visualiza el Árbol AVL con SVG.
 * Muestra factor de balance (BF) y altura en cada nodo.
 * Nodos con BF fuera de [-1,0,1] se marcan en rojo (no debería pasar si el AVL es correcto).
 */

import { useMemo } from 'react';

const NODE_R = 28;
const LEVEL_H = 90;
const H_GAP = 52; // separación horizontal mínima entre nodos del mismo nivel

const PRIORITY_COLOR = { Alta: '#f87171', Media: '#fbbf24', Baja: '#34d399' };

// Algoritmo Reingold-Tilford simplificado:
// Asignamos x en pre-order dando a cada nodo una posición acumulativa.
function assignPositions(node, depth = 0, counter = { val: 0 }) {
  if (!node) return null;

  const left = assignPositions(node.left, depth + 1, counter);
  const x = counter.val * H_GAP * 2;
  counter.val++;
  const right = assignPositions(node.right, depth + 1, counter);

  return { ...node, x, y: 50 + depth * LEVEL_H, left, right };
}

// Recolecta todos los nodos y aristas del árbol posicionado
function flatten(node, result = { nodes: [], edges: [] }) {
  if (!node) return result;
  result.nodes.push(node);
  if (node.left) {
    result.edges.push({ x1: node.x, y1: node.y, x2: node.left.x, y2: node.left.y });
    flatten(node.left, result);
  }
  if (node.right) {
    result.edges.push({ x1: node.x, y1: node.y, x2: node.right.x, y2: node.right.y });
    flatten(node.right, result);
  }
  return result;
}

export function AVLVisualizer({ avlRoot }) {
  const { nodes, edges, svgWidth, svgHeight } = useMemo(() => {
    if (!avlRoot) return { nodes: [], edges: [], svgWidth: 200, svgHeight: 120 };

    const positioned = assignPositions(avlRoot);
    const { nodes, edges } = flatten(positioned);

    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const minX = Math.min(...xs) - NODE_R - 20;
    const maxX = Math.max(...xs) + NODE_R + 20;
    const maxY = Math.max(...ys) + NODE_R + 40;

    // Normalizar X para que arranque en 0
    const offset = -minX;
    nodes.forEach((n) => { n.x += offset; });
    edges.forEach((e) => { e.x1 += offset; e.x2 += offset; });

    return {
      nodes,
      edges,
      svgWidth: maxX - minX,
      svgHeight: maxY,
    };
  }, [avlRoot]);

  if (!avlRoot) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⬡</div>
        <p>El Árbol AVL está vacío.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(svgWidth, 200)} height={svgHeight}
        style={{ display: 'block', margin: '0 auto' }}>

        {/* Aristas */}
        {edges.map((e, i) => (
          <line key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="#2a2a3a" strokeWidth="2"
          />
        ))}

        {/* Nodos */}
        {nodes.map((node) => {
          const bf = node.bf ?? 0;
          const isBalanced = bf >= -1 && bf <= 1;
          const prioColor = PRIORITY_COLOR[node.task?.prioridad] ?? '#8888aa';
          const bfColor = bf === 0 ? '#34d399' : Math.abs(bf) === 1 ? '#fbbf24' : '#f87171';

          return (
            <g key={node.key}>
              {/* Sombra de prioridad */}
              <circle cx={node.x} cy={node.y} r={NODE_R + 5}
                fill={prioColor} opacity={0.07} />

              {/* Nodo principal */}
              <circle cx={node.x} cy={node.y} r={NODE_R}
                fill="#16161e"
                stroke={isBalanced ? '#333345' : '#f87171'}
                strokeWidth={1.8}
              />

              {/* ID del nodo (centro) */}
              <text x={node.x} y={node.y - 4}
                textAnchor="middle" fontSize="11"
                fill="var(--text-primary)" fontFamily="DM Mono" fontWeight="600">
                {node.key}
              </text>

              {/* Prioridad (debajo del ID) */}
              <text x={node.x} y={node.y + 9}
                textAnchor="middle" fontSize="8"
                fill={prioColor} fontFamily="DM Mono">
                {node.task?.prioridad?.slice(0, 1)}
              </text>

              {/* Factor de balance (arriba derecha) */}
              <rect x={node.x + NODE_R - 2} y={node.y - NODE_R - 1}
                width={16} height={14} rx={3}
                fill={bfColor} opacity={0.9} />
              <text x={node.x + NODE_R + 6} y={node.y - NODE_R + 9}
                textAnchor="middle" fontSize="9"
                fill="#0a0a0f" fontFamily="DM Mono" fontWeight="700">
                {bf > 0 ? `+${bf}` : bf}
              </text>

              {/* Altura (arriba izquierda) */}
              <text x={node.x - NODE_R + 4} y={node.y - NODE_R - 4}
                fontSize="8" fill="#55556a" fontFamily="DM Mono">
                h{node.height}
              </text>

              {/* Título truncado debajo */}
              <text x={node.x} y={node.y + NODE_R + 14}
                textAnchor="middle" fontSize="8"
                fill="#55556a" fontFamily="Sora">
                {node.task?.titulo?.slice(0, 8)}{node.task?.titulo?.length > 8 ? '…' : ''}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Leyenda factor de balance */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#34d399', display: 'inline-block' }} /> BF = 0
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#fbbf24', display: 'inline-block' }} /> BF = ±1
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f87171', display: 'inline-block' }} /> BF &gt; ±1 (desbalanceado)
        </span>
        <span>h = altura del nodo</span>
      </div>
    </div>
  );
}
