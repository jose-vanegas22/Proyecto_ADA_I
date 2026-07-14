import { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext.jsx';
import { TaskCard } from '../components/ui/TaskCard.jsx';
import { AddTaskModal } from '../components/ui/AddTaskModal.jsx';

export function TasksPage({ onToast }) {
  const { tasks, stats, topTask, searchById, extractHighestPriority } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('Todas');
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const filters = ['Todas', 'Pendiente', 'Completada', 'Alta', 'Media', 'Baja'];

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === 'Todas') return true;
      if (['Pendiente', 'Completada'].includes(filter)) return t.estado === filter;
      return t.prioridad === filter;
    });
  }, [tasks, filter]);

  function handleSearch() {
    if (!searchId.trim()) return;
    const result = searchById(Number(searchId));
    setSearchResult(result);
    setSearched(true);
    if (!result) onToast(`No se encontró tarea con ID ${searchId}`, 'error');
    else onToast(`Tarea #${searchId} encontrada en el AVL (O(log n))`, 'success');
  }

  function handleExtract() {
    const task = extractHighestPriority();
    if (task) onToast(`Extraída: "${task.titulo}" (${task.prioridad})`, 'success');
    else onToast('El heap está vacío', 'error');
  }

  const statCards = [
    { label: 'Total', value: stats.total },
    { label: 'Pendientes', value: stats.pendientes },
    { label: 'Completadas', value: stats.completadas },
    { label: 'Alta prioridad', value: stats.alta, cls: 'stat-alta' },
    { label: 'Media prioridad', value: stats.media, cls: 'stat-media' },
    { label: 'Baja prioridad', value: stats.baja, cls: 'stat-baja' },
  ];

  return (
    <div className="page-enter">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-title" style={{ fontSize: 22 }}>Tareas</div>
          <div className="section-sub">Heap (prioridad) + AVL (índice por ID) · {tasks.length} total</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Nueva tarea
        </button>
      </div>

      {/* Stats compactas */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {statCards.map((s) => (
          <div key={s.label} className={`stat-card ${s.cls ?? ''}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tarea más prioritaria (raíz del heap) */}
      <div className="viz-container" style={{ marginBottom: 20 }}>
        <div className="viz-header">
          <span className="viz-title">⚡ Tarea más prioritaria (Heap root)</span>
        </div>
        <div className="viz-body">
          {topTask ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div className={`priority-dot ${topTask.prioridad}`} />
              <span style={{ fontWeight: 600, fontSize: 15 }}>{topTask.titulo}</span>
              <span className={`badge ${topTask.prioridad}`}>{topTask.prioridad}</span>
              <span className="badge Pendiente">ID #{topTask.id}</span>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleExtract}>
                Extraer del Heap
              </button>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>Heap vacío</p>
            </div>
          )}
        </div>
      </div>

      {/* Búsqueda por ID (usa AVL internamente) */}
      <div className="viz-container" style={{ marginBottom: 20 }}>
        <div className="viz-header">
          <span className="viz-title">🔍 Buscar por ID (AVL — O(log n))</span>
        </div>
        <div className="viz-body">
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label">ID de la tarea</label>
              <input className="form-input" type="number" placeholder="ej. 3"
                value={searchId} onChange={(e) => { setSearchId(e.target.value); setSearched(false); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSearch}>Buscar</button>
          </div>

          {searched && (
            <div style={{ marginTop: 14 }}>
              {searchResult ? (
                <TaskCard task={searchResult} onToast={onToast} />
              ) : (
                <div style={{ fontSize: 13, color: 'var(--alta)', padding: '8px 0' }}>
                  ✕ No se encontró ninguna tarea con ese ID en el árbol AVL.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: 14 }}>
        <div className="chip-group">
          {filters.map((f) => (
            <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="task-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">☰</div>
            <p>No hay tareas con este filtro.</p>
          </div>
        )}
        {filtered.map((t) => (
          <TaskCard key={t.id} task={t} onToast={onToast} />
        ))}
      </div>

      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onSuccess={(msg) => onToast(msg, 'success')}
        />
      )}
    </div>
  );
}
