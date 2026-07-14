import { useState } from 'react';
import { useTasks } from '../../context/TaskContext.jsx';

const DEFAULT = {
  titulo: '', descripcion: '',
  prioridad: 'Media',
  fechaVencimiento: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
};

export function AddTaskModal({ onClose, onSuccess }) {
  const { addTask } = useTasks();
  const [form, setForm] = useState(DEFAULT);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    if (!form.titulo.trim()) { setError('El título es obligatorio.'); return; }
    if (!form.fechaVencimiento) { setError('La fecha de vencimiento es obligatoria.'); return; }
    addTask(form);
    onSuccess?.(`Tarea "${form.titulo}" agregada`);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Nueva tarea</div>

        {error && (
          <div style={{ background: 'var(--alta-bg)', color: 'var(--alta)', borderRadius: 6, padding: '8px 12px', fontSize: 12, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Título *</label>
          <input className="form-input" name="titulo" value={form.titulo}
            onChange={handleChange} placeholder="ej. Estudiar para el examen" autoFocus />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea className="form-textarea" name="descripcion" value={form.descripcion}
            onChange={handleChange} placeholder="Detalles opcionales..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Prioridad *</label>
            <select className="form-select" name="prioridad" value={form.prioridad} onChange={handleChange}>
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de vencimiento *</label>
            <input className="form-input" type="date" name="fechaVencimiento"
              value={form.fechaVencimiento} onChange={handleChange} />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit}>➕ Agregar tarea</button>
        </div>
      </div>
    </div>
  );
}
