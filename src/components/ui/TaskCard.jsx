import { useTasks } from '../../context/TaskContext.jsx';

export function TaskCard({ task, onToast }) {
  const { completeTask, deleteTask } = useTasks();

  function handleComplete() {
    completeTask(task.id);
    onToast?.(`"${task.titulo}" marcada como completada`, 'success');
  }

  function handleDelete() {
    deleteTask(task.id);
    onToast?.(`Tarea eliminada del Heap y AVL`, 'info');
  }

  const overdue = task.estado === 'Pendiente' && new Date(task.fechaVencimiento) < new Date();

  return (
    <div className={`task-card ${task.estado === 'Completada' ? 'completed' : ''}`}>
      <div className={`priority-dot ${task.prioridad}`} title={`Prioridad ${task.prioridad}`} />

      <div className="task-body">
        <div className="task-title">{task.titulo}</div>
        {task.descripcion && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
            {task.descripcion}
          </div>
        )}
        <div className="task-meta">
          <span>#{task.id}</span>
          <span className={`badge ${task.prioridad}`}>{task.prioridad}</span>
          <span className={`badge ${task.estado}`}>{task.estado}</span>
          <span style={{ color: overdue ? 'var(--alta)' : undefined }}>
            {overdue ? '⚠ ' : ''}
            Vence: {new Date(task.fechaVencimiento).toLocaleDateString('es-CO')}
          </span>
        </div>
      </div>

      <div className="task-actions">
        {task.estado === 'Pendiente' && (
          <button className="btn btn-ghost btn-sm" title="Marca como completada y la elimina del Heap" onClick={handleComplete}
            style={{ color: 'var(--baja)', border: '1px solid var(--baja)', opacity: 0.8 }}>
            ✓ Completar
          </button>
        )}
        <button className="btn btn-danger-ghost btn-sm" title="Elimina del Heap y del AVL" onClick={handleDelete}
          style={{ border: '1px solid var(--border)' }}>
          ✕ Eliminar
        </button>
      </div>
    </div>
  );
}
