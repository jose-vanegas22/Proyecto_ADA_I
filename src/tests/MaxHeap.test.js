/**
 * MaxHeap.test.js
 * Pruebas unitarias para la implementación del Max-Heap.
 * Ejecutar con: node src/tests/MaxHeap.test.js
 *
 * No usamos Jest para no agregar dependencias innecesarias.
 * Wilson David Gómez Gómez — José David Vanegas Martínez
 */

import { MaxHeap } from '../algorithms/heap/MaxHeap.js';

// ---------- Mini framework de testing ----------
let passed = 0;
let failed = 0;

function test(nombre, fn) {
  try {
    fn();
    console.log(`  ✓ ${nombre}`);
    passed++;
  } catch (e) {
    console.log(`  ✕ ${nombre}`);
    console.log(`    → ${e.message}`);
    failed++;
  }
}

function expect(valor) {
  return {
    toBe(esperado) {
      if (valor !== esperado)
        throw new Error(`Se esperaba ${JSON.stringify(esperado)}, se obtuvo ${JSON.stringify(valor)}`);
    },
    toBeTruthy() {
      if (!valor) throw new Error(`Se esperaba un valor truthy, se obtuvo ${valor}`);
    },
    toBeFalsy() {
      if (valor) throw new Error(`Se esperaba un valor falsy, se obtuvo ${valor}`);
    },
    toBeNull() {
      if (valor !== null) throw new Error(`Se esperaba null, se obtuvo ${valor}`);
    },
    toBeLessThanOrEqual(n) {
      if (valor > n) throw new Error(`Se esperaba ≤ ${n}, se obtuvo ${valor}`);
    },
    toBeGreaterThan(n) {
      if (valor <= n) throw new Error(`Se esperaba > ${n}, se obtuvo ${valor}`);
    },
  };
}

// ---------- Helpers ----------
function makeTask(id, prioridad, fechaVencimiento = '2025-12-31') {
  return {
    id,
    titulo: `Tarea ${id}`,
    descripcion: '',
    prioridad,
    fechaCreacion: new Date().toISOString(),
    fechaVencimiento,
    estado: 'Pendiente',
  };
}

// ---------- Suite 1: Operaciones básicas ----------
console.log('\n📦 MaxHeap — Operaciones básicas');

test('heap vacío al inicializar', () => {
  const h = new MaxHeap();
  expect(h.isEmpty()).toBe(true);
  expect(h.size()).toBe(0);
  expect(h.peek()).toBeNull();
});

test('insert agrega elementos correctamente', () => {
  const h = new MaxHeap();
  h.insert(makeTask(1, 'Baja'));
  h.insert(makeTask(2, 'Alta'));
  h.insert(makeTask(3, 'Media'));
  expect(h.size()).toBe(3);
  expect(h.isEmpty()).toBe(false);
});

test('peek retorna el elemento de mayor prioridad sin extraerlo', () => {
  const h = new MaxHeap();
  h.insert(makeTask(1, 'Baja'));
  h.insert(makeTask(2, 'Alta'));
  const top = h.peek();
  expect(top.prioridad).toBe('Alta');
  expect(h.size()).toBe(2); // no debe haber extraído nada
});

test('extractMax retorna el elemento de mayor prioridad', () => {
  const h = new MaxHeap();
  h.insert(makeTask(1, 'Media'));
  h.insert(makeTask(2, 'Alta'));
  h.insert(makeTask(3, 'Baja'));
  const max = h.extractMax();
  expect(max.prioridad).toBe('Alta');
  expect(h.size()).toBe(2);
});

// ---------- Suite 2: CP01 — Orden de extracción ----------
console.log('\n📦 MaxHeap — CP01: Orden de extracción');

test('extrae en orden Alta → Media → Baja', () => {
  const h = new MaxHeap();
  h.insert(makeTask(101, 'Alta'));
  h.insert(makeTask(102, 'Media'));
  h.insert(makeTask(103, 'Baja'));

  expect(h.extractMax().prioridad).toBe('Alta');
  expect(h.extractMax().prioridad).toBe('Media');
  expect(h.extractMax().prioridad).toBe('Baja');
  expect(h.isEmpty()).toBe(true);
});

test('orden correcto con múltiples inserciones desordenadas', () => {
  const h = new MaxHeap();
  // Insertar en orden "desfavorable"
  h.insert(makeTask(1, 'Baja'));
  h.insert(makeTask(2, 'Baja'));
  h.insert(makeTask(3, 'Media'));
  h.insert(makeTask(4, 'Alta'));
  h.insert(makeTask(5, 'Baja'));
  h.insert(makeTask(6, 'Media'));

  const order = [];
  while (!h.isEmpty()) order.push(h.extractMax().prioridad);

  // Alta primero, luego Medias, luego Bajas
  expect(order[0]).toBe('Alta');
  expect(order[1]).toBe('Media');
  expect(order[2]).toBe('Media');
  expect(order[3]).toBe('Baja');
});

// ---------- Suite 3: CP02 — Estructura post-eliminación ----------
console.log('\n📦 MaxHeap — CP02: Estructura post-eliminación');

test('estructura se mantiene tras extractMax', () => {
  const h = new MaxHeap();
  h.insert(makeTask(1, 'Alta'));
  h.insert(makeTask(2, 'Media'));
  h.insert(makeTask(3, 'Baja'));

  h.extractMax(); // extrae Alta
  const newRoot = h.peek();
  expect(newRoot.prioridad).toBe('Media');
});

test('heap con un solo elemento: extractMax deja heap vacío', () => {
  const h = new MaxHeap();
  h.insert(makeTask(1, 'Alta'));
  h.extractMax();
  expect(h.isEmpty()).toBe(true);
  expect(h.extractMax()).toBeNull();
});

test('propiedad heap se mantiene con 10 inserciones', () => {
  const h = new MaxHeap();
  const prioridades = ['Baja', 'Alta', 'Media', 'Alta', 'Baja', 'Media', 'Alta', 'Baja', 'Media', 'Alta'];
  prioridades.forEach((p, i) => h.insert(makeTask(i + 1, p)));

  // Verificamos que siempre el padre tiene prioridad >= hijos
  const heap = h.toArray();
  const PVAL = { Alta: 3, Media: 2, Baja: 1 };
  for (let i = 0; i < heap.length; i++) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    if (left < heap.length)
      expect(PVAL[heap[i].prioridad] >= PVAL[heap[left].prioridad]).toBe(true);
    if (right < heap.length)
      expect(PVAL[heap[i].prioridad] >= PVAL[heap[right].prioridad]).toBe(true);
  }
});

// ---------- Suite 4: removeById ----------
console.log('\n📦 MaxHeap — removeById');

test('removeById elimina el elemento correcto', () => {
  const h = new MaxHeap();
  h.insert(makeTask(1, 'Alta'));
  h.insert(makeTask(2, 'Media'));
  h.insert(makeTask(3, 'Baja'));

  const removed = h.removeById(2);
  expect(removed.id).toBe(2);
  expect(h.size()).toBe(2);

  // ID 2 ya no debe estar
  const arr = h.toArray();
  expect(arr.some((t) => t.id === 2)).toBe(false);
});

test('removeById con ID inexistente retorna null', () => {
  const h = new MaxHeap();
  h.insert(makeTask(1, 'Alta'));
  const result = h.removeById(999);
  expect(result).toBeNull();
  expect(h.size()).toBe(1);
});

// ---------- Suite 5: buildFromArray ----------
console.log('\n📦 MaxHeap — buildFromArray');

test('buildFromArray construye heap válido', () => {
  const tasks = [
    makeTask(1, 'Baja'),
    makeTask(2, 'Alta'),
    makeTask(3, 'Media'),
    makeTask(4, 'Baja'),
    makeTask(5, 'Alta'),
  ];
  const h = new MaxHeap();
  h.buildFromArray(tasks);
  expect(h.size()).toBe(5);
  expect(h.peek().prioridad).toBe('Alta');
});

// ---------- Suite 6: Casos límite ----------
console.log('\n📦 MaxHeap — Casos límite');

test('extractMax en heap vacío retorna null', () => {
  const h = new MaxHeap();
  expect(h.extractMax()).toBeNull();
});

test('inserción de 100 elementos mantiene la propiedad heap', () => {
  const h = new MaxHeap();
  const prios = ['Alta', 'Media', 'Baja'];
  for (let i = 1; i <= 100; i++) {
    h.insert(makeTask(i, prios[i % 3]));
  }
  expect(h.size()).toBe(100);
  // La raíz siempre debe ser Alta
  expect(h.peek().prioridad).toBe('Alta');
});

test('operationLog registra operaciones', () => {
  const h = new MaxHeap();
  h.insert(makeTask(1, 'Alta'));
  h.insert(makeTask(2, 'Media'));
  h.extractMax();
  expect(h.operationLog.length).toBeGreaterThan(0);
});

// ---------- Resumen ----------
console.log(`\n${'─'.repeat(40)}`);
console.log(`Resultado: ${passed} pasaron, ${failed} fallaron`);
console.log('─'.repeat(40));
if (failed > 0) process.exit(1);
