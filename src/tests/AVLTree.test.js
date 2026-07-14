/**
 * AVLTree.test.js
 * Pruebas unitarias para la implementación del Árbol AVL.
 * Ejecutar con: node src/tests/AVLTree.test.js
 *
 * Wilson David Gómez Gómez — José David Vanegas Martínez
 */

import { AVLTree } from '../algorithms/avl/AVLTree.js';

// ---------- Mini framework ----------
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
    toBeNull() {
      if (valor !== null) throw new Error(`Se esperaba null, se obtuvo ${JSON.stringify(valor)}`);
    },
    toBeTruthy() {
      if (!valor) throw new Error(`Valor falsy: ${valor}`);
    },
    toBeLessThanOrEqual(n) {
      if (valor > n) throw new Error(`Se esperaba ≤ ${n}, se obtuvo ${valor}`);
    },
    toBeGreaterThanOrEqual(n) {
      if (valor < n) throw new Error(`Se esperaba ≥ ${n}, se obtuvo ${valor}`);
    },
    toEqual(arr) {
      const a = JSON.stringify(valor);
      const b = JSON.stringify(arr);
      if (a !== b) throw new Error(`Se esperaba ${b}, se obtuvo ${a}`);
    },
  };
}

function makeTask(id, prioridad = 'Media') {
  return {
    id,
    titulo: `Tarea ${id}`,
    descripcion: '',
    prioridad,
    fechaCreacion: new Date().toISOString(),
    fechaVencimiento: '2025-12-31',
    estado: 'Pendiente',
  };
}

// Verifica que el árbol sea un AVL válido (BF en [-1,0,1] en todos los nodos)
function isValidAVL(node, avl) {
  if (!node) return true;
  const bf = avl.balanceFactor(node);
  if (Math.abs(bf) > 1) return false;
  return isValidAVL(node.left, avl) && isValidAVL(node.right, avl);
}

// ---------- Suite 1: Básicos ----------
console.log('\n🌳 AVLTree — Operaciones básicas');

test('árbol vacío al inicializar', () => {
  const avl = new AVLTree();
  expect(avl.root).toBeNull();
  expect(avl.size()).toBe(0);
  expect(avl.height()).toBe(0);
});

test('insert una tarea', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(10));
  expect(avl.size()).toBe(1);
  expect(avl.root.key).toBe(10);
});

test('search encuentra tarea existente', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(5));
  avl.insert(makeTask(10));
  avl.insert(makeTask(3));
  const found = avl.search(10);
  expect(found.id).toBe(10);
});

test('search retorna null para ID inexistente', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(5));
  expect(avl.search(999)).toBeNull();
});

// ---------- Suite 2: Balanceo — rotaciones ----------
console.log('\n🌳 AVLTree — Rotaciones y balanceo');

test('CP04: inserción ascendente 1→7 no degenera (altura ≤ 3)', () => {
  const avl = new AVLTree();
  for (let i = 1; i <= 7; i++) avl.insert(makeTask(i));
  // Un BST sin balance tendría altura 7
  expect(avl.height()).toBeLessThanOrEqual(3);
});

test('inserción 7→1 (descendente) mantiene árbol balanceado', () => {
  const avl = new AVLTree();
  for (let i = 7; i >= 1; i--) avl.insert(makeTask(i));
  expect(avl.height()).toBeLessThanOrEqual(3);
  expect(isValidAVL(avl.root, avl)).toBe(true);
});

test('caso LL: inserción izquierda-izquierda activa rotación derecha', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(30));
  avl.insert(makeTask(20));
  avl.insert(makeTask(10)); // desbalance LL → rotación derecha
  expect(avl.root.key).toBe(20); // 20 debe ser la nueva raíz
  expect(isValidAVL(avl.root, avl)).toBe(true);
});

test('caso RR: inserción derecha-derecha activa rotación izquierda', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(10));
  avl.insert(makeTask(20));
  avl.insert(makeTask(30)); // desbalance RR → rotación izquierda
  expect(avl.root.key).toBe(20);
  expect(isValidAVL(avl.root, avl)).toBe(true);
});

test('caso LR: rotación doble izquierda-derecha', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(30));
  avl.insert(makeTask(10));
  avl.insert(makeTask(20)); // desbalance LR
  expect(avl.root.key).toBe(20);
  expect(isValidAVL(avl.root, avl)).toBe(true);
});

test('caso RL: rotación doble derecha-izquierda', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(10));
  avl.insert(makeTask(30));
  avl.insert(makeTask(20)); // desbalance RL
  expect(avl.root.key).toBe(20);
  expect(isValidAVL(avl.root, avl)).toBe(true);
});

test('árbol siempre válido con 20 inserciones aleatorias', () => {
  const avl = new AVLTree();
  const ids = [15, 3, 22, 8, 17, 30, 1, 12, 20, 25, 5, 10, 18, 28, 7, 13, 21, 27, 2, 9];
  ids.forEach((id) => avl.insert(makeTask(id)));
  expect(isValidAVL(avl.root, avl)).toBe(true);
  expect(avl.size()).toBe(20);
});

// ---------- Suite 3: CP03 — Búsqueda ----------
console.log('\n🌳 AVLTree — CP03: Búsqueda (indexación)');

test('buscar ID=102 en árbol con 3 tareas', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(101, 'Alta'));
  avl.insert(makeTask(102, 'Media'));
  avl.insert(makeTask(103, 'Baja'));
  const result = avl.search(102);
  expect(result.id).toBe(102);
  expect(result.prioridad).toBe('Media');
});

test('buscar ID inexistente retorna null', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(101, 'Alta'));
  avl.insert(makeTask(102, 'Media'));
  expect(avl.search(999)).toBeNull();
});

test('search registra número de comparaciones en el log', () => {
  const avl = new AVLTree();
  for (let i = 1; i <= 15; i++) avl.insert(makeTask(i));
  avl.search(15);
  const log = avl.operationLog.filter(l => l.op === 'search');
  expect(log.length).toBeGreaterThanOrEqual(1);
  // En un AVL de 15 nodos, la búsqueda no debe necesitar más de ~5 comparaciones
  const lastSearch = log[log.length - 1];
  expect(lastSearch.comparisons).toBeLessThanOrEqual(6);
});

// ---------- Suite 4: Eliminación ----------
console.log('\n🌳 AVLTree — Eliminación');

test('delete elimina un nodo hoja', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(10));
  avl.insert(makeTask(5));
  avl.insert(makeTask(15));
  avl.delete(5);
  expect(avl.search(5)).toBeNull();
  expect(avl.size()).toBe(2);
});

test('delete nodo con dos hijos (sucesor in-order)', () => {
  const avl = new AVLTree();
  [10, 5, 15, 3, 7, 12, 20].forEach((id) => avl.insert(makeTask(id)));
  avl.delete(10); // nodo con dos hijos
  expect(avl.search(10)).toBeNull();
  expect(isValidAVL(avl.root, avl)).toBe(true);
});

test('árbol sigue balanceado después de eliminar varios nodos', () => {
  const avl = new AVLTree();
  for (let i = 1; i <= 15; i++) avl.insert(makeTask(i));
  [3, 7, 11, 15].forEach((id) => avl.delete(id));
  expect(isValidAVL(avl.root, avl)).toBe(true);
  expect(avl.size()).toBe(11);
});

test('delete de ID inexistente no rompe el árbol', () => {
  const avl = new AVLTree();
  avl.insert(makeTask(5));
  avl.delete(999);
  expect(avl.size()).toBe(1);
  expect(isValidAVL(avl.root, avl)).toBe(true);
});

// ---------- Suite 5: In-order y ordenamiento ----------
console.log('\n🌳 AVLTree — In-order (ordenamiento por ID)');

test('in-order retorna tareas ordenadas por ID', () => {
  const avl = new AVLTree();
  [5, 2, 8, 1, 4, 7, 9].forEach((id) => avl.insert(makeTask(id)));
  const ids = avl.inOrder().map((t) => t.id);
  expect(ids).toEqual([1, 2, 4, 5, 7, 8, 9]);
});

test('in-order con inserción aleatoria sigue dando orden correcto', () => {
  const avl = new AVLTree();
  [15, 3, 22, 8, 1].forEach((id) => avl.insert(makeTask(id)));
  const ids = avl.inOrder().map((t) => t.id);
  expect(ids).toEqual([1, 3, 8, 15, 22]);
});

// ---------- Suite 6: buildFromArray ----------
console.log('\n🌳 AVLTree — buildFromArray (LocalStorage)');

test('buildFromArray reconstruye árbol válido', () => {
  const tasks = [1, 5, 3, 7, 2].map((id) => makeTask(id));
  const avl = new AVLTree();
  avl.buildFromArray(tasks);
  expect(avl.size()).toBe(5);
  expect(isValidAVL(avl.root, avl)).toBe(true);
  // Todos los IDs deben ser buscables
  tasks.forEach((t) => expect(avl.search(t.id).id).toBe(t.id));
});

// ---------- Resumen ----------
console.log(`\n${'─'.repeat(40)}`);
console.log(`Resultado: ${passed} pasaron, ${failed} fallaron`);
console.log('─'.repeat(40));
if (failed > 0) process.exit(1);
