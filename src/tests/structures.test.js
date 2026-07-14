/**
 * tests/structures.test.js
 * Suite completa de pruebas unitarias para MaxHeap y AVLTree.
 *
 * Cubre los 4 casos obligatorios del PDF (CP01–CP04) más casos límite.
 * Se ejecutan en el navegador a través de la página "Casos de Prueba"
 * y también pueden correrse con Vitest si se configura.
 *
 * Wilson David Gómez Gómez — José David Vanegas Martínez
 */

import { MaxHeap } from '../algorithms/heap/MaxHeap.js';
import { AVLTree } from '../algorithms/avl/AVLTree.js';

// --------------- Helpers ---------------

function makeTask(id, prioridad, dias = 7) {
  return {
    id,
    titulo: `Tarea ${id}`,
    descripcion: '',
    prioridad,
    fechaCreacion: new Date().toISOString(),
    fechaVencimiento: new Date(Date.now() + dias * 86400000).toISOString().split('T')[0],
    estado: 'Pendiente',
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  return true;
}

// --------------- TESTS DEL HEAP ---------------

export function testHeap() {
  const results = [];

  // ── CP01: Inserción y orden de extracción ──────────────────────────────
  try {
    const h = new MaxHeap();
    h.insert(makeTask(101, 'Alta'));
    h.insert(makeTask(102, 'Media'));
    h.insert(makeTask(103, 'Baja'));

    const e1 = h.extractMax();
    const e2 = h.extractMax();
    const e3 = h.extractMax();

    assert(e1.prioridad === 'Alta',  'Primera extracción debe ser Alta');
    assert(e2.prioridad === 'Media', 'Segunda extracción debe ser Media');
    assert(e3.prioridad === 'Baja',  'Tercera extracción debe ser Baja');
    assert(h.isEmpty(),              'Heap debe estar vacío tras 3 extracciones');

    results.push({ name: 'CP01 — Orden de extracción por prioridad', pass: true });
  } catch (e) {
    results.push({ name: 'CP01 — Orden de extracción por prioridad', pass: false, error: e.message });
  }

  // ── CP02: Estructura tras eliminación ─────────────────────────────────
  try {
    const h = new MaxHeap();
    [makeTask(1,'Alta'), makeTask(2,'Media'), makeTask(3,'Baja')].forEach(t => h.insert(t));

    h.extractMax(); // extrae Alta
    const root = h.peek();
    assert(root.prioridad === 'Media', 'Tras extraer Alta, raíz debe ser Media');
    assert(h.size() === 2, 'Heap debe tener 2 elementos');

    // Verificar propiedad del heap: raíz ≥ hijos
    const arr = h.toArray();
    for (let i = 0; i < arr.length; i++) {
      const l = 2*i+1, r = 2*i+2;
      const pv = { Alta: 3, Media: 2, Baja: 1 };
      if (l < arr.length) assert(pv[arr[i].prioridad] >= pv[arr[l].prioridad], `Propiedad heap violada en idx ${i}`);
      if (r < arr.length) assert(pv[arr[i].prioridad] >= pv[arr[r].prioridad], `Propiedad heap violada en idx ${i}`);
    }

    results.push({ name: 'CP02 — Estructura heap tras eliminación', pass: true });
  } catch (e) {
    results.push({ name: 'CP02 — Estructura heap tras eliminación', pass: false, error: e.message });
  }

  // ── Heap vacío ─────────────────────────────────────────────────────────
  try {
    const h = new MaxHeap();
    assert(h.extractMax() === null, 'extractMax en heap vacío debe retornar null');
    assert(h.peek() === null,        'peek en heap vacío debe retornar null');
    assert(h.size() === 0,           'size en heap vacío debe ser 0');
    results.push({ name: 'Caso límite — Heap vacío', pass: true });
  } catch (e) {
    results.push({ name: 'Caso límite — Heap vacío', pass: false, error: e.message });
  }

  // ── Un solo elemento ──────────────────────────────────────────────────
  try {
    const h = new MaxHeap();
    h.insert(makeTask(1, 'Alta'));
    assert(h.size() === 1, 'Tamaño debe ser 1');
    const t = h.extractMax();
    assert(t.id === 1, 'Debe extraer el único elemento');
    assert(h.isEmpty(), 'Heap vacío tras extraer el único elemento');
    results.push({ name: 'Caso límite — Un solo elemento', pass: true });
  } catch (e) {
    results.push({ name: 'Caso límite — Un solo elemento', pass: false, error: e.message });
  }

  // ── Muchos elementos del mismo nivel ──────────────────────────────────
  try {
    const h = new MaxHeap();
    for (let i = 1; i <= 20; i++) h.insert(makeTask(i, 'Media'));
    // Todos Media → el orden de extracción debe ser consistente
    let prev = h.extractMax();
    while (!h.isEmpty()) {
      const curr = h.extractMax();
      // No hay una regla estricta de orden entre iguales, pero no debe fallar
      prev = curr;
    }
    assert(h.isEmpty(), 'Heap debe vaciarse completamente');
    results.push({ name: 'Caso límite — 20 elementos igual prioridad', pass: true });
  } catch (e) {
    results.push({ name: 'Caso límite — 20 elementos igual prioridad', pass: false, error: e.message });
  }

  // ── removeById ─────────────────────────────────────────────────────────
  try {
    const h = new MaxHeap();
    [makeTask(10,'Alta'), makeTask(20,'Media'), makeTask(30,'Baja')].forEach(t => h.insert(t));
    const removed = h.removeById(20);
    assert(removed?.id === 20, 'Debe remover la tarea con ID 20');
    assert(h.size() === 2, 'Tamaño debe ser 2 tras removeById');
    // Verificar que sigue siendo un heap válido
    const arr = h.toArray();
    const pv = { Alta: 3, Media: 2, Baja: 1 };
    for (let i = 0; i < arr.length; i++) {
      const l = 2*i+1, r = 2*i+2;
      if (l < arr.length) assert(pv[arr[i].prioridad] >= pv[arr[l].prioridad], 'Propiedad heap violada');
      if (r < arr.length) assert(pv[arr[i].prioridad] >= pv[arr[r].prioridad], 'Propiedad heap violada');
    }
    results.push({ name: 'Operación — removeById mantiene invariante', pass: true });
  } catch (e) {
    results.push({ name: 'Operación — removeById mantiene invariante', pass: false, error: e.message });
  }

  // ── buildFromArray ─────────────────────────────────────────────────────
  try {
    const tasks = [makeTask(1,'Baja'), makeTask(2,'Alta'), makeTask(3,'Media')];
    const h = new MaxHeap();
    h.buildFromArray(tasks);
    assert(h.peek().prioridad === 'Alta', 'buildFromArray debe colocar Alta en la raíz');
    results.push({ name: 'Operación — buildFromArray (heapify O(n))', pass: true });
  } catch (e) {
    results.push({ name: 'Operación — buildFromArray (heapify O(n))', pass: false, error: e.message });
  }

  return results;
}

// --------------- TESTS DEL AVL ---------------

export function testAVL() {
  const results = [];

  // ── CP03: Indexación — buscar existente e inexistente ──────────────────
  try {
    const avl = new AVLTree();
    avl.insert(makeTask(101, 'Alta'));
    avl.insert(makeTask(102, 'Media'));
    avl.insert(makeTask(103, 'Baja'));

    const found = avl.search(102);
    const notFound = avl.search(999);

    assert(found?.id === 102, 'Debe encontrar tarea con ID 102');
    assert(notFound === null,  'Debe retornar null para ID inexistente');
    results.push({ name: 'CP03 — Búsqueda por ID (existente e inexistente)', pass: true });
  } catch (e) {
    results.push({ name: 'CP03 — Búsqueda por ID', pass: false, error: e.message });
  }

  // ── CP04: Equilibrio con secuencia desbalanceada ───────────────────────
  try {
    const avl = new AVLTree();
    for (let i = 1; i <= 7; i++) avl.insert(makeTask(i, 'Media'));

    const h = avl.height();
    // Árbol balanceado de 7 nodos tiene altura 3 (log2(7) ≈ 2.8)
    // Un BST sin balance tendría altura 7
    assert(h <= 3, `Altura debe ser ≤ 3, fue ${h}`);

    // Verificar que el factor de balance de cada nodo está en [-1,0,1]
    function checkBalance(node) {
      if (!node) return true;
      const bf = avl.balanceFactor(node);
      assert(Math.abs(bf) <= 1, `Factor de balance ${bf} fuera de rango en nodo ${node.key}`);
      return checkBalance(node.left) && checkBalance(node.right);
    }
    checkBalance(avl.root);

    results.push({ name: 'CP04 — Equilibrio AVL secuencia ascendente (1→7)', pass: true });
  } catch (e) {
    results.push({ name: 'CP04 — Equilibrio AVL secuencia ascendente', pass: false, error: e.message });
  }

  // ── Inserción y in-order ───────────────────────────────────────────────
  try {
    const avl = new AVLTree();
    [5, 3, 7, 1, 4, 6, 8].forEach(id => avl.insert(makeTask(id, 'Media')));
    const inorder = avl.inOrder().map(t => t.id);
    const sorted = [...inorder].sort((a, b) => a - b);
    assert(JSON.stringify(inorder) === JSON.stringify(sorted), 'In-order debe devolver IDs en orden ascendente');
    results.push({ name: 'Propiedad BST — In-order da IDs ordenados', pass: true });
  } catch (e) {
    results.push({ name: 'Propiedad BST — In-order', pass: false, error: e.message });
  }

  // ── Eliminación y rebalanceo ───────────────────────────────────────────
  try {
    const avl = new AVLTree();
    for (let i = 1; i <= 10; i++) avl.insert(makeTask(i, 'Media'));

    avl.delete(5);
    assert(avl.search(5) === null, 'Tarea 5 eliminada no debe encontrarse');
    assert(avl.size() === 9, 'Tamaño debe ser 9 tras eliminar');

    // Verificar balance de todo el árbol post-eliminación
    function checkAll(node) {
      if (!node) return;
      const bf = avl.balanceFactor(node);
      assert(Math.abs(bf) <= 1, `BF ${bf} fuera de rango en nodo ${node.key} tras eliminar`);
      checkAll(node.left);
      checkAll(node.right);
    }
    checkAll(avl.root);
    results.push({ name: 'Eliminación — rebalanceo correcto', pass: true });
  } catch (e) {
    results.push({ name: 'Eliminación — rebalanceo correcto', pass: false, error: e.message });
  }

  // ── Rotación LL (inserción lado izquierdo-izquierdo) ──────────────────
  try {
    const avl = new AVLTree();
    avl.insert(makeTask(30, 'Media'));
    avl.insert(makeTask(20, 'Media'));
    avl.insert(makeTask(10, 'Media')); // ← dispara rotación LL
    // Raíz debe ser 20 (no 30 como estaría en BST)
    assert(avl.root.key === 20, `Raíz debe ser 20 tras rotación LL, fue ${avl.root.key}`);
    assert(avl.height() === 2, 'Altura debe ser 2 tras rotación LL');
    results.push({ name: 'Rotación LL — balanceo correcto', pass: true });
  } catch (e) {
    results.push({ name: 'Rotación LL — balanceo correcto', pass: false, error: e.message });
  }

  // ── Rotación RR (inserción lado derecho-derecho) ──────────────────────
  try {
    const avl = new AVLTree();
    avl.insert(makeTask(10, 'Media'));
    avl.insert(makeTask(20, 'Media'));
    avl.insert(makeTask(30, 'Media')); // ← dispara rotación RR
    assert(avl.root.key === 20, `Raíz debe ser 20 tras rotación RR, fue ${avl.root.key}`);
    results.push({ name: 'Rotación RR — balanceo correcto', pass: true });
  } catch (e) {
    results.push({ name: 'Rotación RR — balanceo correcto', pass: false, error: e.message });
  }

  // ── Rotación LR ───────────────────────────────────────────────────────
  try {
    const avl = new AVLTree();
    avl.insert(makeTask(30, 'Media'));
    avl.insert(makeTask(10, 'Media'));
    avl.insert(makeTask(20, 'Media')); // ← dispara rotación LR
    assert(avl.root.key === 20, `Raíz debe ser 20 tras rotación LR, fue ${avl.root.key}`);
    results.push({ name: 'Rotación LR — balanceo correcto', pass: true });
  } catch (e) {
    results.push({ name: 'Rotación LR — balanceo correcto', pass: false, error: e.message });
  }

  // ── Rotación RL ───────────────────────────────────────────────────────
  try {
    const avl = new AVLTree();
    avl.insert(makeTask(10, 'Media'));
    avl.insert(makeTask(30, 'Media'));
    avl.insert(makeTask(20, 'Media')); // ← dispara rotación RL
    assert(avl.root.key === 20, `Raíz debe ser 20 tras rotación RL, fue ${avl.root.key}`);
    results.push({ name: 'Rotación RL — balanceo correcto', pass: true });
  } catch (e) {
    results.push({ name: 'Rotación RL — balanceo correcto', pass: false, error: e.message });
  }

  // ── AVL vacío ──────────────────────────────────────────────────────────
  try {
    const avl = new AVLTree();
    assert(avl.search(1) === null, 'search en AVL vacío debe retornar null');
    assert(avl.size() === 0, 'size en AVL vacío debe ser 0');
    assert(avl.height() === 0, 'height en AVL vacío debe ser 0');
    results.push({ name: 'Caso límite — AVL vacío', pass: true });
  } catch (e) {
    results.push({ name: 'Caso límite — AVL vacío', pass: false, error: e.message });
  }

  // ── Inserción duplicada (actualización) ───────────────────────────────
  try {
    const avl = new AVLTree();
    avl.insert(makeTask(1, 'Baja'));
    avl.insert({ ...makeTask(1, 'Alta'), titulo: 'Actualizada' }); // mismo ID
    const t = avl.search(1);
    assert(t.prioridad === 'Alta', 'Inserción duplicada debe actualizar el dato');
    assert(avl.size() === 1, 'No debe haber duplicados en el AVL');
    results.push({ name: 'Caso borde — Inserción ID duplicado', pass: true });
  } catch (e) {
    results.push({ name: 'Caso borde — Inserción ID duplicado', pass: false, error: e.message });
  }

  // ── Eliminar nodo con dos hijos ────────────────────────────────────────
  try {
    const avl = new AVLTree();
    [4,2,6,1,3,5,7].forEach(id => avl.insert(makeTask(id, 'Media')));
    avl.delete(4); // nodo raíz con dos hijos
    assert(avl.search(4) === null, 'Nodo 4 eliminado no debe encontrarse');
    assert(avl.size() === 6, 'Tamaño debe ser 6');
    assert(avl.height() <= 3, 'Árbol debe mantenerse balanceado');
    results.push({ name: 'Eliminación — nodo raíz con dos hijos', pass: true });
  } catch (e) {
    results.push({ name: 'Eliminación — nodo raíz con dos hijos', pass: false, error: e.message });
  }

  return results;
}

// --------------- Runner combinado ---------------

export function runAllTests() {
  const heapResults = testHeap();
  const avlResults = testAVL();
  const all = [...heapResults, ...avlResults];
  const passed = all.filter(r => r.pass).length;
  return {
    results: all,
    passed,
    total: all.length,
    allPassed: passed === all.length,
  };
}
