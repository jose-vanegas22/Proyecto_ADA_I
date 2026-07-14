/**
 * TaskService.test.js
 * Pruebas de integración: verifica que el Heap y el AVL
 * siempre permanecen sincronizados bajo todas las operaciones.
 *
 * Ejecutar con: node src/tests/TaskService.test.js
 * Wilson David Gómez Gómez — José David Vanegas Martínez
 */

// Simulamos localStorage para Node.js
global.localStorage = {
  _data: {},
  getItem(k) { return this._data[k] ?? null; },
  setItem(k, v) { this._data[k] = v; },
  removeItem(k) { delete this._data[k]; },
};

// Importamos las clases directamente (sin el singleton)
import { MaxHeap } from '../algorithms/heap/MaxHeap.js';
import { AVLTree } from '../algorithms/avl/AVLTree.js';

// ---------- Mini framework ----------
let passed = 0; let failed = 0;

function test(nombre, fn) {
  try { fn(); console.log(`  ✓ ${nombre}`); passed++; }
  catch (e) { console.log(`  ✕ ${nombre}\n    → ${e.message}`); failed++; }
}

function expect(v) {
  return {
    toBe(e) { if (v !== e) throw new Error(`Esperaba ${e}, obtuvo ${v}`); },
    toBeNull() { if (v !== null) throw new Error(`Esperaba null, obtuvo ${v}`); },
    toBe(e) { if (v !== e) throw new Error(`Esperaba ${e}, obtuvo ${v}`); },
    toBeGreaterThan(n) { if (v <= n) throw new Error(`Esperaba > ${n}, obtuvo ${v}`); },
    toBeLessThanOrEqual(n) { if (v > n) throw new Error(`Esperaba ≤ ${n}, obtuvo ${v}`); },
  };
}

// ---------- Clase ligera de servicio para tests (sin LocalStorage) ----------
class TestTaskService {
  constructor() {
    this.heap = new MaxHeap();
    this.avl = new AVLTree();
    this._nextId = 1;
  }

  add(titulo, prioridad, fechaVencimiento = '2025-12-31') {
    const task = {
      id: this._nextId++, titulo, descripcion: '',
      prioridad, fechaCreacion: new Date().toISOString(),
      fechaVencimiento, estado: 'Pendiente',
    };
    this.heap.insert(task);
    this.avl.insert(task);
    return task;
  }

  delete(id) {
    this.heap.removeById(id);
    this.avl.delete(id);
  }

  complete(id) {
    const task = this.avl.search(id);
    if (!task) return null;
    const updated = { ...task, estado: 'Completada' };
    this.heap.updateTask(updated);
    this.avl.update(updated);
    return updated;
  }

  extractMax() {
    const task = this.heap.extractMax();
    if (task) this.avl.delete(task.id);
    return task;
  }

  // Verifica que Heap y AVL tienen los mismos IDs
  assertSync() {
    const heapIds = new Set(this.heap.toArray().map(t => t.id));
    const avlIds = new Set(this.avl.inOrder().map(t => t.id));
    if (heapIds.size !== avlIds.size) throw new Error(`Desincronizados: Heap=${heapIds.size}, AVL=${avlIds.size}`);
    for (const id of heapIds) {
      if (!avlIds.has(id)) throw new Error(`ID ${id} en Heap pero no en AVL`);
    }
  }
}

// ---------- Suite 1: Sincronización Heap + AVL ----------
console.log('\n🔗 TaskService — Sincronización Heap + AVL');

test('después de agregar 3 tareas, Heap y AVL tienen los mismos IDs', () => {
  const s = new TestTaskService();
  s.add('T1', 'Alta');
  s.add('T2', 'Media');
  s.add('T3', 'Baja');
  s.assertSync();
  expect(s.heap.size()).toBe(3);
  expect(s.avl.size()).toBe(3);
});

test('después de eliminar, Heap y AVL siguen sincronizados', () => {
  const s = new TestTaskService();
  const t1 = s.add('T1', 'Alta');
  s.add('T2', 'Media');
  s.add('T3', 'Baja');
  s.delete(t1.id);
  s.assertSync();
  expect(s.heap.size()).toBe(2);
  expect(s.avl.size()).toBe(2);
});

test('después de completar tarea, estado actualizado en ambas estructuras', () => {
  const s = new TestTaskService();
  const t = s.add('T1', 'Alta');
  s.complete(t.id);

  const heapTask = s.heap.toArray().find(x => x.id === t.id);
  const avlTask = s.avl.search(t.id);

  expect(heapTask.estado).toBe('Completada');
  expect(avlTask.estado).toBe('Completada');
});

test('extractMax elimina de Heap y AVL', () => {
  const s = new TestTaskService();
  s.add('T1', 'Alta');
  s.add('T2', 'Media');
  s.add('T3', 'Baja');

  const extracted = s.extractMax();
  expect(extracted.prioridad).toBe('Alta');
  s.assertSync();
  expect(s.heap.size()).toBe(2);
  expect(s.avl.size()).toBe(2);
  expect(s.avl.search(extracted.id)).toBeNull();
});

test('múltiples operaciones mantienen sincronización', () => {
  const s = new TestTaskService();
  const t1 = s.add('T1', 'Alta');
  const t2 = s.add('T2', 'Media');
  const t3 = s.add('T3', 'Baja');
  const t4 = s.add('T4', 'Alta');
  const t5 = s.add('T5', 'Media');

  s.delete(t2.id);
  s.complete(t3.id);
  s.extractMax();
  s.add('T6', 'Baja');

  s.assertSync();
});

// ---------- Suite 2: Casos del enunciado (CP01–CP04) ----------
console.log('\n🔗 TaskService — Casos de prueba oficiales');

test('CP01: orden de extracción Alta → Media → Baja', () => {
  const s = new TestTaskService();
  s.add('Estudiar para el examen', 'Alta');
  s.add('Comprar útiles escolares', 'Media');
  s.add('Revisar correos electrónicos', 'Baja');

  expect(s.extractMax().prioridad).toBe('Alta');
  expect(s.extractMax().prioridad).toBe('Media');
  expect(s.extractMax().prioridad).toBe('Baja');
  expect(s.heap.isEmpty()).toBe(true);
});

test('CP02: estructura heap correcta después de extractMax', () => {
  const s = new TestTaskService();
  s.add('T1', 'Alta');
  s.add('T2', 'Media');
  s.add('T3', 'Baja');

  s.extractMax();
  expect(s.heap.peek().prioridad).toBe('Media');
  s.assertSync();
});

test('CP03: búsqueda AVL — existente y no existente', () => {
  const s = new TestTaskService();
  s.add('Estudiar para el examen', 'Alta');   // id=1
  s.add('Comprar útiles escolares', 'Media'); // id=2
  s.add('Revisar correos', 'Baja');           // id=3

  expect(s.avl.search(2).prioridad).toBe('Media');
  expect(s.avl.search(999)).toBeNull();
});

test('CP04: árbol AVL no degenera con inserción 1→7', () => {
  const s = new TestTaskService();
  for (let i = 0; i < 7; i++) s.add(`Tarea ${i + 1}`, 'Media');
  // Los IDs son 1..7 en orden
  expect(s.avl.height()).toBeLessThanOrEqual(3);
});

// ---------- Suite 3: Casos límite ----------
console.log('\n🔗 TaskService — Casos límite');

test('sistema vacío: extractMax retorna null', () => {
  const s = new TestTaskService();
  expect(s.extractMax()).toBeNull();
});

test('eliminar ID inexistente no rompe la sincronización', () => {
  const s = new TestTaskService();
  s.add('T1', 'Alta');
  s.delete(9999); // no existe
  s.assertSync();
  expect(s.heap.size()).toBe(1);
});

test('50 tareas: heap y AVL sincronizados al final', () => {
  const s = new TestTaskService();
  const prios = ['Alta', 'Media', 'Baja'];
  for (let i = 0; i < 50; i++) s.add(`Tarea ${i}`, prios[i % 3]);
  s.assertSync();
  expect(s.heap.size()).toBe(50);
  // Altura AVL debe ser logarítmica
  expect(s.avl.height()).toBeLessThanOrEqual(Math.ceil(1.44 * Math.log2(52)));
});

// ---------- Resumen ----------
console.log(`\n${'─'.repeat(40)}`);
console.log(`Resultado: ${passed} pasaron, ${failed} fallaron`);
console.log('─'.repeat(40));
if (failed > 0) process.exit(1);
