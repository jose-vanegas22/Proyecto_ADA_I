/**
 * MaxHeap.js
 * Implementación de un Max-Heap binario desde cero.
 *
 * Decidimos usar max-heap porque el sistema necesita acceder siempre
 * a la tarea de MAYOR prioridad primero. Un min-heap requeriría invertir
 * los valores de prioridad, lo cual complica la lógica innecesariamente.
 *
 * Complejidad:
 *   - Inserción:  O(log n)  — heapify-up sube a lo sumo h niveles
 *   - Extracción: O(log n)  — heapify-down baja a lo sumo h niveles
 *   - Peek:       O(1)      — la raíz siempre es el máximo
 *   - Espacio:    O(n)      — un array plano de n elementos
 *
 * Wilson David Gómez Gómez — José David Vanegas Martínez
 */

const PRIORITY_VALUE = { Alta: 3, Media: 2, Baja: 1 }; // Declaramos las prioridades  

export class MaxHeap {
  constructor() {
    // Usamos un array plano. El nodo en índice i tiene:
    //   hijo izquierdo en 2i+1, hijo derecho en 2i+2, padre en floor((i-1)/2)
    this.heap = [];
    // Llevamos un log de operaciones para mostrar en el panel de análisis
    this.operationLog = [];
  }

  // --------------- Utilidades de índices ---------------

  _parentIdx(i) { // Devuelve el índice del padre de un nodo en el heap (O(1))
    return Math.floor((i - 1) / 2); // Fórmula para encontrar el índice del padre en un heap representado como array
  }

  _leftIdx(i) { // Devuelve el índice del hijo izquierdo de un nodo en el heap (O(1))
    return 2 * i + 1; // Fórmula para encontrar el índice del hijo izquierdo en un heap representado como array
  }

  _rightIdx(i) { // Devuelve el índice del hijo derecho de un nodo en el heap (O(1))
    return 2 * i + 2; // Fórmula para encontrar el índice del hijo derecho en un heap representado como array
  }

  _priority(task) { // Devuelve el valor numérico de prioridad de una tarea (O(1))
    return PRIORITY_VALUE[task.prioridad] ?? 0; // Si la prioridad no está definida, devuelve 0
  }

  // Compara dos nodos: primero por prioridad, luego por fecha de vencimiento
  // (tarea más urgente = fecha más próxima tiene precedencia entre igual prioridad)
  _compare(a, b) {
    const pa = this._priority(a);
    const pb = this._priority(b);
    if (pa !== pb) return pa - pb; // Compara por prioridad (mayor valor = mayor prioridad)
    // Menor fecha = más urgente
    return new Date(b.fechaVencimiento) - new Date(a.fechaVencimiento);
  }

  // --------------- Operación SWAP ---------------

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; // El swap es un intercambio
  }

  // --------------- HeapifyUp (después de insertar) --------------- O(logn)
  // Sube el elemento recién insertado mientras sea mayor que su padre

  _heapifyUp(idx) { // Acomoda en la posicion correcta el elemento insertado cuesta O(logn)
    let steps = 0;
    while (idx > 0) { // Mientras el indice no sea la raiz (0)
      const parent = this._parentIdx(idx); // Guarda en uns cosntante el indice del padre del nodo insertado con la formula
      if (this._compare(this.heap[idx], this.heap[parent]) > 0) { // Compara el insertado con su padre, si es mayor entra
        this._swap(idx, parent); // Hace el swap o sea el intercambio
        idx = parent; // El padre queda como el nodo actual
        steps++; // Aumenta el contador de pasos
      } else {
        break; // Si se cumple simplemnte sale del bucle
      }
    }
    return steps;
  }

  // --------------- HeapifyDown (después de extraer) --------------- O(logn)
  // Baja la raíz mientras sea menor que alguno de sus hijos

  _heapifyDown(idx) { // Acommoda la raiz en su lugar correcto cuando es menor la prioridad que alguno de sus hijos
    const n = this.heap.length; // Guarda en una constante el tamaño del heap
    let steps = 0;
    while (true) { // Bucle infinito que se rompe cuando el nodo actual es mayor que sus hijos
      let largest = idx; // Inicializa largest como el indice actual
      const left = this._leftIdx(idx); // Guarda en una constante el indice del hijo izquierdo
      const right = this._rightIdx(idx); // Guarda en una constante el indice del hijo derecho

      if (left < n && this._compare(this.heap[left], this.heap[largest]) > 0) { // Compara el hijo izquierdo con el nodo actual, si es mayor entra
        largest = left;
      }
      if (right < n && this._compare(this.heap[right], this.heap[largest]) > 0) { // Compara el hijo derecho con el nodo actual, si es mayor entra
        largest = right;
      }

      if (largest !== idx) { // Si largest es diferente del nodo actual, hace el swap y actualiza el indice actual
        this._swap(idx, largest);
        idx = largest;
        steps++;
      } else {
        break; // Sale del while si el nodo actual es mayor que sus hijos
      }
    }
    return steps;
  }

  // --------------- INSERT --------------- O(logn)

  insert(task) { // O(logn)
    this.heap.push(task); // Inserta el nuevo elemento al final del array O(1)
    const steps = this._heapifyUp(this.heap.length - 1); // Llama a heapifyUp para acomodar el nuevo elemento en su lugar correcto O(logn)
    this.operationLog.push({
      op: 'insert',
      taskId: task.id,
      titulo: task.titulo,
      steps,
      heapSize: this.heap.length,
      timestamp: Date.now(),
    });
    return { steps, heapSize: this.heap.length };
  }

  // --------------- EXTRACT MAX --------------- O(logn)

  extractMax() { // Saca el elemento de mayor prioridad o sea el de la raiz
    if (this.heap.length === 0) return null; // Si el heap está vacío, retorna null
    if (this.heap.length === 1) { // Si solo hay un elemento, lo extrae y retorna
      const task = this.heap.pop();
      this.operationLog.push({ op: 'extractMax', taskId: task.id, steps: 0, heapSize: 0, timestamp: Date.now() }); // Log de operación
      return task;
    }
    const max = this.heap[0]; // Guarda el elemento máximo (raíz) para retornarlo después
    // Movemos el último elemento a la raíz y hacemos heapify-down
    this.heap[0] = this.heap.pop(); // Extrae el último elemento y lo coloca en la raíz, es como cuando cambia la raiz con el ultimo y lo saca del heap
    const steps = this._heapifyDown(0); // Baja el elemento con mas baja prioridad a su lugar correcto, O(logn)
    this.operationLog.push({ // todo esto en un log de operación para mostrar en el panel de análisis
      op: 'extractMax',
      taskId: max.id,
      titulo: max.titulo,
      steps,
      heapSize: this.heap.length,
      timestamp: Date.now(),
    });
    return max;
  }

  // --------------- REMOVE by ID --------------- O(n) en el peor caso, O(log n) promedio
  // El PDF exige que al completar una tarea se elimine del heap.
  // Buscamos el nodo, lo reemplazamos con el último y rebalanceamos.

  removeById(id) { // Mas usado cuando el usuario finaliza una tarea y se necesita remover del heap, O(logn)
    const idx = this.heap.findIndex((t) => t.id === id); // Busca el indice del elemento a eliminar, O(n) en el peor caso
    if (idx === -1) return null; // Si no se encuentra, retorna null

    const removed = this.heap[idx]; // Guarda el elemento a eliminar para retornarlo después
    const last = this.heap.pop(); // Extrae el último elemento del heap

    if (idx < this.heap.length) { // Si el índice del elemento a eliminar es menor que la longitud del heap, significa que no era el último elemento, si fuera elultimo esto no es necesario porque el pop ya lo quito
      this.heap[idx] = last; // Reemplaza el elemento a eliminar con el último elemento del heap debido a que ayuda a no romper el arbol y los algortimos para organizarlo
      // Intentamos subir y bajar; solo uno tendrá efecto
      this._heapifyUp(idx); // Intenta subir el elemento reemplazado a su posición correcta, O(logn)
      this._heapifyDown(idx); // Intenta bajar el elemento reemplazado a su posición correcta, O(logn)
    }

    this.operationLog.push({
      op: 'removeById',
      taskId: id,
      heapSize: this.heap.length,
      timestamp: Date.now(),
    });
    return removed;
  }

  // --------------- UPDATE (cuando cambia prioridad) --------------- O(n) en el peor caso, O(log n) promedio

  updateTask(updatedTask) { // Actualiza la prioridad de una tarea existente en el heap, O(n) en el peor caso
    const idx = this.heap.findIndex((t) => t.id === updatedTask.id); // Busca el índice del elemento a actualizar, O(n) en el peor caso
    if (idx === -1) return false; // Si no se encuentra, retorna false
    this.heap[idx] = updatedTask; // Reemplaza el elemento existente con el actualizado
    // Aplica algoritmos para acomodarlo en su lugar correcto, O(logn) en el peor caso
    this._heapifyUp(idx);
    this._heapifyDown(idx);
    return true;
  }

  // --------------- PEEK ---------------

  peek() { // Devuelve el elemento máximo actual sin modificar nada
    return this.heap[0] ?? null;
  }

  size() { // Nos devuelve la longitud del heap, O(1)
    return this.heap.length;
  }

  isEmpty() { // Nos devuelve true si el heap está vacío, O(1)
    return this.heap.length === 0;
  }

  // Devuelve copia del array (para visualización sin mutar el heap)
  toArray() {
    return [...this.heap];
  }

  // Reconstruye el heap desde un array (para cargar desde LocalStorage)
  buildFromArray(tasks) {
    this.heap = [...tasks]; // Copia el array de tareas al heap
    // Heapify completo: O(n)
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) { // Solo aplica el algortimo de la mitad hacia el 0 debido a que los otros son hijos y no se puede hacer nada
      this._heapifyDown(i);
    }
  }

  clearLog() { // Limpia el log de operaciones
    this.operationLog = [];
  }
}
