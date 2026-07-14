/**
 * TaskService.js
 * Servicio central que mantiene sincronizados el Heap y el AVL.
 *
 * TODAS las mutaciones de tareas pasan por aquí.
 * React nunca toca directamente el Heap ni el AVL.
 * Esto garantiza que las dos estructuras nunca se desincronicen.
 *
 * Wilson David Gómez Gómez — José David Vanegas Martínez
 */

import { MaxHeap } from '../algorithms/heap/MaxHeap.js';
import { AVLTree } from '../algorithms/avl/AVLTree.js';

const STORAGE_KEY = 'taskpriority_pro_v1';

class TaskService {
  constructor() {
    this.heap = new MaxHeap(); // Crea una instancia de MaxHeap para manejar las tareas por prioridad
    this.avl = new AVLTree(); // Crea una instancia de AVLTree para manejar las tareas por ID
    this._nextId = 1; // ID único para cada tarea, se incrementa automáticamente
    this._listeners = new Set(); // Conjunto de funciones de suscripción para notificar cambios a React
    this._load(); // Carga tareas desde LocalStorage al iniciar
  }

  // El ID es único e irrepetible. Aunque una tarea se elimine,
  // su ID nunca se vuelve a asignar a otra tarea.
  _getNextId() {
    return this._nextId++;
  }

  // --------------- Persistencia (LocalStorage) ---------------

  _save() { // Guarda el estado actual del heap y el AVL en LocalStorage
    try {
      const data = {
        tasks: this.heap.toArray(),
        nextId: this._nextId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('No se pudo guardar en LocalStorage:', e.message);
    }
  }

  _load() { // Carga el estado del heap y el AVL desde LocalStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.tasks && Array.isArray(data.tasks)) {
        this.heap.buildFromArray(data.tasks);
        this.avl.buildFromArray(data.tasks);
        this._nextId = data.nextId ?? data.tasks.length + 1;
      }
    } catch (e) {
      console.warn('Error al cargar desde LocalStorage:', e.message);
    }
  }

  // --------------- Suscripción (para que React se re-renderice) ---------------

  subscribe(fn) { // Permite que React se suscriba a cambios en el servicio
    this._listeners.add(fn); // Agrega la función de suscripción al conjunto
    return () => this._listeners.delete(fn); // Devuelve una función para desuscribirse
  }

  _notify() { // Notifica a todos los suscriptores que hubo un cambio en el servicio
    this._listeners.forEach((fn) => fn()); // Llama a cada función de suscripción para que React se re-renderice
  }

  // --------------- AGREGAR TAREA ---------------
  // Inserta en el Heap (por prioridad) y en el AVL (por ID)

  addTask({ titulo, descripcion, prioridad, fechaVencimiento }) {
    const task = {
      id: this._getNextId(),
      titulo: titulo.trim(),
      descripcion: descripcion?.trim() ?? '',
      prioridad,
      fechaCreacion: new Date().toISOString(),
      fechaVencimiento,
      estado: 'Pendiente',
    };

    const heapResult = this.heap.insert(task);
    this.avl.insert(task);

    this._save();
    this._notify();

    return { task, heapResult };
  }

  // --------------- BUSCAR TAREA POR ID ---------------
  // El AVL garantiza O(log n), el heap no srive para buscar por ID, solo por prioridad

  searchById(id) { 
    return this.avl.search(Number(id));
  }

  // --------------- COMPLETAR TAREA ---------------
  // Cambia estado y actualiza en ambas estructuras

  completeTask(id) { // Cambia el estado de la tarea a "Completada" y actualiza en el Heap y el AVL
    const task = this.avl.search(Number(id));
    if (!task) return null;

    const updated = { ...task, estado: 'Completada' };
    this.heap.updateTask(updated);
    this.avl.update(updated);

    this._save();
    this._notify();
    return updated;
  }

  // --------------- ELIMINAR TAREA ---------------
  // Elimina del Heap y del AVL

  deleteTask(id) {
    const numId = Number(id);
    const removed = this.heap.removeById(numId);
    this.avl.delete(numId);

    this._save();
    this._notify();
    return removed;
  }

  // --------------- EXTRAER TAREA DE MAYOR PRIORIDAD ---------------
  // Extrae del heap y sincroniza el AVL
  // Elimina el elemento de mayor prioridad en el heap y lo elimina del AVL. Retorna la tarea extraída o null si el heap está vacío.

  extractHighestPriority() {
    const task = this.heap.extractMax();
    if (!task) return null;

    this.avl.delete(task.id);

    this._save();
    this._notify();
    return task;
  }

  // --------------- GETTERS ---------------

  getAllTasks() {
    // In-order del AVL → tareas ordenadas por ID
    return this.avl.inOrder(); // Retorna un array de tareas ordenadas por ID
  }

  getPendingTasks() { // Retorna un array de tareas pendientes
    return this.getAllTasks().filter((t) => t.estado === 'Pendiente');
  }

  getCompletedTasks() { // Retorna un array de tareas completadas
    return this.getAllTasks().filter((t) => t.estado === 'Completada');
  }

  peekHighestPriority() { // Retorna la tarea de mayor prioridad sin extraerla del heap
    return this.heap.peek();
  }

  getHeapSnapshot() { // Retorna un array con el estado actual del heap (para visualización)
    return this.heap.toArray();
  }

  getAVLRoot() { // Retorna la raíz del árbol AVL (para visualización)
    return this.avl.root;
  }

  getAVLLevelOrder() { // Retorna un array con el recorrido por niveles del árbol AVL (para visualización)
    return this.avl.toLevelOrder();
  }

  getStats() { // Retorna estadísticas de tareas y estructuras
    const all = this.getAllTasks();
    return {
      total: all.length,
      pendientes: all.filter((t) => t.estado === 'Pendiente').length,
      completadas: all.filter((t) => t.estado === 'Completada').length,
      alta: all.filter((t) => t.prioridad === 'Alta').length,
      media: all.filter((t) => t.prioridad === 'Media').length,
      baja: all.filter((t) => t.prioridad === 'Baja').length,
      heapSize: this.heap.size(),
      avlHeight: this.avl.height(),
    };
  }

  getOperationLogs() { // Retorna los últimos 20 logs de operaciones del heap y del AVL (para visualización)
    return {
      heap: [...this.heap.operationLog].reverse().slice(0, 20),
      avl: [...this.avl.operationLog].reverse().slice(0, 20),
    };
  }

  // --------------- CASOS DE PRUEBA (PDF requisito CP01-CP04) ---------------

  runTestSuite() {
    const results = [];

    // CP01 — Prueba de inserción y orden de extracción
    const testHeap = new MaxHeap(); // Creamos un nuevo heap para pruebas, no usamos el heap real de la app
    const testTasks = [ // Creamos tareas de prueba con diferentes prioridades y fechas de vencimiento
      { id: 901, titulo: 'Estudiar para el examen', prioridad: 'Alta', fechaVencimiento: '2025-12-20', estado: 'Pendiente', fechaCreacion: new Date().toISOString(), descripcion: '' },
      { id: 902, titulo: 'Comprar útiles escolares', prioridad: 'Media', fechaVencimiento: '2025-12-25', estado: 'Pendiente', fechaCreacion: new Date().toISOString(), descripcion: '' },
      { id: 903, titulo: 'Revisar correos electrónicos', prioridad: 'Baja', fechaVencimiento: '2025-12-30', estado: 'Pendiente', fechaCreacion: new Date().toISOString(), descripcion: '' },
    ];
    testTasks.forEach((t) => testHeap.insert(t)); // Insertamos las tareas de prueba en el heap
    const extracted = []; 
    while (!testHeap.isEmpty()) extracted.push(testHeap.extractMax());
    const cp01Pass = extracted[0].prioridad === 'Alta' && extracted[1].prioridad === 'Media' && extracted[2].prioridad === 'Baja';
    results.push({
      id: 'CP01',
      nombre: 'Prueba de inserción y orden de extracción',
      descripcion: 'Insertar 3 tareas (Alta, Media, Baja) y verificar que se extraen en orden correcto.',
      pass: cp01Pass,
      detalle: extracted.map((t) => `${t.titulo} (${t.prioridad})`),
    });

    // CP02 — Prueba de eliminación y estructura del heap
    const testHeap2 = new MaxHeap();
    testTasks.forEach((t) => testHeap2.insert(t));
    testHeap2.extractMax(); // extrae Alta
    const root = testHeap2.peek();
    const cp02Pass = root?.prioridad === 'Media';
    results.push({
      id: 'CP02',
      nombre: 'Prueba de eliminación y estructura heap',
      descripcion: 'Tras extraer la tarea de mayor prioridad, la nueva raíz debe ser la siguiente en prioridad.',
      pass: cp02Pass,
      detalle: [`Nueva raíz: ${root?.titulo} (${root?.prioridad})`],
    });

    // CP03 — Prueba de indexación AVL
    const testAVL = new AVLTree();
    testTasks.forEach((t) => testAVL.insert(t));
    const found = testAVL.search(902);
    const notFound = testAVL.search(999);
    const cp03Pass = found?.id === 902 && notFound === null;
    results.push({
      id: 'CP03',
      nombre: 'Prueba de indexación AVL',
      descripcion: 'Buscar ID=902 (debe encontrar) y ID=999 (no debe existir).',
      pass: cp03Pass,
      detalle: [
        `Buscar 902: ${found ? found.titulo : 'NO ENCONTRADO'}`,
        `Buscar 999: ${notFound === null ? 'No existe ✓' : 'ERROR'}`,
      ],
    });

    // CP04 — Prueba de equilibrio AVL con secuencia desbalanceada
    const testAVL2 = new AVLTree();
    // Insertar en orden ascendente → sin AVL quedaría una lista ligada
    [1, 2, 3, 4, 5, 6, 7].forEach((n) =>
      testAVL2.insert({ id: n, titulo: `Tarea ${n}`, prioridad: 'Media', fechaVencimiento: '2025-12-31', estado: 'Pendiente', fechaCreacion: new Date().toISOString(), descripcion: '' })
    );
    const h = testAVL2.height();
    // Un BST sin balance tendría altura 7; un AVL debe tener altura ≤ 3
    const cp04Pass = h <= 3;
    results.push({
      id: 'CP04',
      nombre: 'Prueba de equilibrio AVL',
      descripcion: 'Insertar IDs 1→7 en orden ascendente. Sin AVL la altura sería 7; con AVL debe ser ≤ 3.',
      pass: cp04Pass,
      detalle: [`Altura del árbol: ${h} (máximo esperado: 3)`],
    });

    return results;
  }

  // Limpia todos los datos (útil para tests)
  clear() { 
    this.heap = new MaxHeap();
    this.avl = new AVLTree();
    this._nextId = 1;
    localStorage.removeItem(STORAGE_KEY);
    this._notify();
  }
}

// Singleton — una sola instancia para toda la app
export const taskService = new TaskService();
