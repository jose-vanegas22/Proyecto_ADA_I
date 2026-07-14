/**
 * utils/index.js
 * Funciones auxiliares reutilizables en toda la aplicación.
 * Las separamos aquí para no ensuciar los componentes con lógica de presentación.
 *
 * Wilson David Gómez Gómez — José David Vanegas Martínez
 */

// --------------- Formateo de fechas ---------------

/**
 * Devuelve la fecha en formato local colombiano: ej. "20 dic 2025"
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Devuelve cuántos días faltan (o pasaron) para la fecha de vencimiento.
 * Negativo = vencida, 0 = hoy, positivo = días restantes.
 */
export function daysUntil(isoString) {
  if (!isoString) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(isoString);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

export function dueDateLabel(isoString) {
  const d = daysUntil(isoString);
  if (d === null) return '';
  if (d < 0) return `Venció hace ${Math.abs(d)} día${Math.abs(d) !== 1 ? 's' : ''}`;
  if (d === 0) return 'Vence hoy';
  if (d === 1) return 'Vence mañana';
  return `Vence en ${d} días`;
}

// --------------- Prioridades ---------------

export const PRIORITY_ORDER = { Alta: 3, Media: 2, Baja: 1 };
export const PRIORITY_COLORS = {
  Alta:  { fg: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  Media: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  Baja:  { fg: '#34d399', bg: 'rgba(52,211,153,0.12)' },
};

/**
 * Ordena un array de tareas por prioridad descendente,
 * y en caso de empate, por fecha de vencimiento ascendente.
 */
export function sortByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    const pd = PRIORITY_ORDER[b.prioridad] - PRIORITY_ORDER[a.prioridad];
    if (pd !== 0) return pd;
    return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
  });
}

// --------------- Estadísticas rápidas ---------------

export function buildStats(tasks) {
  return {
    total:       tasks.length,
    pendientes:  tasks.filter((t) => t.estado === 'Pendiente').length,
    completadas: tasks.filter((t) => t.estado === 'Completada').length,
    alta:        tasks.filter((t) => t.prioridad === 'Alta').length,
    media:       tasks.filter((t) => t.prioridad === 'Media').length,
    baja:        tasks.filter((t) => t.prioridad === 'Baja').length,
    vencidas:    tasks.filter((t) => t.estado === 'Pendiente' && daysUntil(t.fechaVencimiento) < 0).length,
  };
}

// --------------- Generador de tareas de prueba ---------------

const SAMPLE_TITLES = [
  'Estudiar para el examen de ADA',
  'Entregar informe de laboratorio',
  'Revisar correos del profesor',
  'Preparar exposición de algoritmos',
  'Comprar material de papelería',
  'Leer capítulo 5 del libro de Cormen',
  'Hacer tarea de cálculo diferencial',
  'Reunión con el grupo de proyecto',
  'Actualizar repositorio en GitHub',
  'Escribir conclusiones del proyecto',
];

export function generateSampleTasks(count = 5) {
  const prioridades = ['Alta', 'Media', 'Baja'];
  const tasks = [];
  for (let i = 0; i < count; i++) {
    tasks.push({
      titulo: SAMPLE_TITLES[i % SAMPLE_TITLES.length],
      descripcion: `Descripción de prueba para la tarea ${i + 1}`,
      prioridad: prioridades[i % 3],
      fechaVencimiento: new Date(Date.now() + (i + 1) * 3 * 86400000).toISOString().split('T')[0],
    });
  }
  return tasks;
}

// --------------- Árbol — helpers de visualización ---------------

/**
 * Calcula la posición X de cada nodo en el heap (árbol binario completo).
 * Útil para el HeapVisualizer.
 */
export function heapNodeX(idx, totalWidth = 800) {
  const level = Math.floor(Math.log2(idx + 1));
  const levelStart = Math.pow(2, level) - 1;
  const levelCount = Math.pow(2, level);
  const posInLevel = idx - levelStart;
  const step = totalWidth / (levelCount + 1);
  return step * (posInLevel + 1);
}

/**
 * Trunca texto con elipsis si supera maxLen caracteres.
 */
export function truncate(str, maxLen = 20) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}
