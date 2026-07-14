import { useState } from 'react';
import { useTasks } from '../context/TaskContext.jsx';

export function TestsPage({ onToast }) {
  const { runTests, clearAll } = useTasks();
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);

  function handleRun() {
    setRunning(true);
    setTimeout(() => {
      const r = runTests();
      setResults(r);
      setRunning(false);
      const passed = r.filter((x) => x.pass).length;
      onToast(`${passed}/${r.length} casos pasaron`, passed === r.length ? 'success' : 'error');
    }, 400);
  }

  const passed = results ? results.filter((r) => r.pass).length : 0;

  return (
    <div className="page-enter">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="section-title" style={{ fontSize: 22 }}>Casos de Prueba</div>
          <div className="section-sub">CP01–CP04 exigidos por la guía · Casos adicionales de borde</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => { clearAll(); onToast('Datos limpiados', 'info'); }}>
            Limpiar datos
          </button>
          <button className="btn btn-primary" onClick={handleRun} disabled={running}>
            {running ? '⏳ Ejecutando…' : '▶ Ejecutar pruebas'}
          </button>
        </div>
      </div>

      {/* Descripción de cada caso antes de ejecutar */}
      {!results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {[
            { id: 'CP01', nombre: 'Prueba de inserción', desc: 'Insertar tareas con prioridad Alta, Media y Baja. Verificar que el heap las extrae en el orden correcto (Alta primero).' },
            { id: 'CP02', nombre: 'Prueba de eliminación', desc: 'Extraer la tarea de mayor prioridad del heap. Verificar que la nueva raíz es la correcta y la estructura se mantiene.' },
            { id: 'CP03', nombre: 'Prueba de indexación', desc: 'Buscar un ID existente y uno inexistente en el AVL. Verificar que la búsqueda es eficiente y correcta.' },
            { id: 'CP04', nombre: 'Prueba de equilibrio AVL', desc: 'Insertar IDs 1 al 7 en orden ascendente. Un BST sin balance tendría altura 7; el AVL debe mantener altura ≤ 3.' },
          ].map((c) => (
            <div key={c.id} className="test-card" style={{ borderLeft: '3px solid var(--border-light)' }}>
              <div className="test-header">
                <span className="test-badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>{c.id}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Resultados */}
      {results && (
        <>
          {/* Resumen */}
          <div style={{
            background: passed === results.length ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${passed === results.length ? 'var(--baja)' : 'var(--alta)'}`,
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <span style={{ fontSize: 28 }}>{passed === results.length ? '✅' : '⚠️'}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                {passed}/{results.length} casos de prueba pasaron
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {passed === results.length
                  ? 'Todas las estructuras funcionan correctamente. ¡Listo para sustentación!'
                  : 'Revisar los casos fallidos.'}
              </div>
            </div>
          </div>

          {results.map((r) => (
            <div key={r.id} className={`test-card ${r.pass ? 'pass' : 'fail'}`}>
              <div className="test-header">
                <span className={`test-badge ${r.pass ? 'pass' : 'fail'}`}>
                  {r.pass ? '✓ PASS' : '✕ FAIL'}
                </span>
                <span style={{ fontWeight: 700, fontFamily: 'DM Mono', fontSize: 12, color: 'var(--text-muted)' }}>{r.id}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.nombre}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{r.descripcion}</p>
              <div className="test-detail">
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {r.detalle.map((d, i) => (
                    <li key={i} className="log-line">→ {d}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => setResults(null)}>
            ← Volver a descripción
          </button>
        </>
      )}

      {/* Explicación académica */}
      <div className="divider" />
      <div className="viz-container">
        <div className="viz-header">
          <span className="viz-title">📚 ¿Qué valida cada caso de prueba?</span>
        </div>
        <div className="viz-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p><strong style={{ color: 'var(--accent)' }}>CP01 — Inserción y extracción:</strong> Verifica la propiedad fundamental del heap: el elemento de mayor prioridad siempre está en la raíz. Si las tres extracciones no siguen el orden Alta → Media → Baja, el heapify está roto.</p>
          <br />
          <p><strong style={{ color: 'var(--accent)' }}>CP02 — Estructura post-eliminación:</strong> Tras extraer la raíz, el último elemento del array se mueve a la raíz y heapify-down lo ubica en su posición correcta. Este test valida que el invariante del heap se mantiene.</p>
          <br />
          <p><strong style={{ color: 'var(--accent)' }}>CP03 — Indexación AVL:</strong> La búsqueda por ID debe funcionar tanto para IDs existentes como para IDs que no están en el árbol. Valida la lógica de comparación y la terminación correcta de la recursión.</p>
          <br />
          <p><strong style={{ color: 'var(--accent)' }}>CP04 — Balanceo automático:</strong> Este es el caso más importante para demostrar el valor del AVL sobre un BST simple. Insertar 1→7 en orden creciente en un BST da una lista enlazada (altura 7). El AVL detecta el desbalance y aplica rotaciones, manteniendo altura ≤ 3.</p>
        </div>
      </div>
    </div>
  );
}
