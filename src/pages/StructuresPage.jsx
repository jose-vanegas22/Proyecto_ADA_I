/**
 * StructuresPage.jsx
 * Muestra las visualizaciones SVG del Heap y el AVL en tiempo real.
 * Accede al root del AVL directamente desde el TaskService singleton,
 * que React re-renderiza porque el contexto notifica cada cambio.
 */

import { useTasks } from '../context/TaskContext.jsx';
import { taskService } from '../services/TaskService.js';
import { HeapVisualizer } from '../components/visualizations/HeapVisualizer.jsx';
import { AVLVisualizer } from '../components/visualizations/AVLVisualizer.jsx';

export function StructuresPage() {
  // El contexto se suscribe al taskService; cada cambio dispara re-render.
  // Entonces al leer taskService.avl.root aquí siempre tenemos el valor actual.
  const { heapSnapshot, stats, logs } = useTasks();
  const avlRoot = taskService.avl.root;

  return (
    <div className="page-enter">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="section-title" style={{ fontSize: 22 }}>Estructuras de Datos</div>
          <div className="section-sub">Visualización en tiempo real — actualiza al agregar o eliminar tareas</div>
        </div>
      </div>

      {/* MAX HEAP */}
      <div className="viz-container" style={{ marginBottom: 24 }}>
        <div className="viz-header">
          <span className="viz-title">⬡ Max-Heap Binario</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
            {heapSnapshot.length} nodos · raíz = mayor prioridad · O(log n) insert/extract
          </span>
        </div>
        <div className="viz-body">
          <HeapVisualizer heap={heapSnapshot} />
        </div>
      </div>

      {/* AVL TREE */}
      <div className="viz-container" style={{ marginBottom: 24 }}>
        <div className="viz-header">
          <span className="viz-title">⬡ Árbol AVL</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
            altura actual: {stats.avlHeight} · BF en cada nodo · O(log n) garantizado
          </span>
        </div>
        <div className="viz-body">
          <AVLVisualizer avlRoot={avlRoot} />
        </div>
      </div>

      {/* Logs de operaciones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="viz-container">
          <div className="viz-header">
            <span className="viz-title">📋 Log Heap</span>
          </div>
          <div className="viz-body">
            <div className="log-block">
              {logs.heap.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  Sin operaciones aún. Agrega tareas para ver el log.
                </div>
              )}
              {logs.heap.map((l, i) => (
                <div key={i} className="log-line">
                  <span className="op-name">{l.op}</span>
                  {l.taskId !== undefined && <> · <span className="op-id">#{l.taskId}</span></>}
                  {l.steps !== undefined && <> · pasos: {l.steps}</>}
                  {l.heapSize !== undefined && <> · size: {l.heapSize}</>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="viz-container">
          <div className="viz-header">
            <span className="viz-title">📋 Log AVL</span>
          </div>
          <div className="viz-body">
            <div className="log-block">
              {logs.avl.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  Sin operaciones aún.
                </div>
              )}
              {logs.avl.map((l, i) => (
                <div key={i} className="log-line">
                  <span className="op-name">{l.op ?? l.type}</span>
                  {l.taskId !== undefined && <> · <span className="op-id">#{l.taskId}</span></>}
                  {l.comparisons !== undefined && <> · cmp: {l.comparisons}</>}
                  {l.treeHeight !== undefined && <> · h: {l.treeHeight}</>}
                  {l.type && l.nodeKey !== undefined && <> · nodo: {l.nodeKey}</>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explicación de ambas estructuras */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <InfoBox title="¿Cómo funciona el Max-Heap?" color="var(--accent)">
          <p>
            El Max-Heap es un árbol binario completo donde cada nodo es <strong>mayor o igual</strong> que sus
            hijos. Esto garantiza que la raíz siempre sea el elemento de mayor prioridad.
          </p>
          <ul style={{ paddingLeft: 16, marginTop: 8 }}>
            <li><strong>insert:</strong> agrega al final y hace heapify-up — O(log n)</li>
            <li><strong>extractMax:</strong> toma la raíz, pone el último elemento arriba y hace heapify-down — O(log n)</li>
            <li><strong>peek:</strong> retorna heap[0] sin modificar — O(1)</li>
          </ul>
          <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            Internamente es un array plano. Nodo en índice <code>i</code>: hijos en <code>2i+1</code> y <code>2i+2</code>, padre en <code>⌊(i-1)/2⌋</code>.
          </p>
        </InfoBox>

        <InfoBox title="¿Cómo funciona el Árbol AVL?" color="var(--baja)">
          <p>
            El AVL es un BST auto-balanceado. Tras cada inserción o eliminación calcula el{' '}
            <strong>factor de balance</strong> (BF = h_izq − h_der) en cada nodo afectado.
          </p>
          <ul style={{ paddingLeft: 16, marginTop: 8 }}>
            <li>Si |BF| &gt; 1 → aplica una rotación</li>
            <li>Rotaciones: LL, RR, LR (doble), RL (doble)</li>
            <li>Garantiza altura máxima ≤ 1.44·log₂(n+2)</li>
          </ul>
          <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            El BF de cada nodo se muestra en la visualización. Verde = 0, Amarillo = ±1, Rojo = desequilibrado (no debería ocurrir).
          </p>
        </InfoBox>
      </div>
    </div>
  );
}

function InfoBox({ title, color, children }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderTop: `2px solid ${color}`,
      borderRadius: 'var(--radius)',
      padding: 20,
      fontSize: 13,
      color: 'var(--text-secondary)',
      lineHeight: 1.7,
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, fontSize: 14 }}>
        {title}
      </div>
      {children}
    </div>
  );
}
