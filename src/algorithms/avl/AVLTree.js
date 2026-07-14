/**
 * AVLTree.js
 * Implementación completa de un Árbol AVL desde cero.
 *
 * El AVL nos permite indexar tareas por ID y garantizar búsquedas en O(log n)
 * sin importar el orden de inserción. A diferencia de un BST normal, el AVL
 * se auto-balancea aplicando rotaciones cuando el factor de balance sale del
 * rango [-1, 0, 1].
 *
 * Complejidades:
 *   - Inserción:  O(log n)
 *   - Búsqueda:   O(log n)
 *   - Eliminación: O(log n)
 *   - Espacio:    O(n)
 *
 * Wilson David Gómez Gómez — José David Vanegas Martínez
 */

// --------------- Nodo AVL ---------------

class AVLNode { // Cada nodo almacena una tarea y su ID como clave de comparación (Toda la informacion que debe tener un nodo de un arbol AVL)
  constructor(task) {
    this.task = task;       // dato almacenado
    this.key = task.id;     // clave de comparación (ID numérico)
    this.left = null;
    this.right = null;
    this.height = 1;        // altura inicial = 1 (hoja)
  }
}

// --------------- Árbol AVL ---------------

export class AVLTree { // Constructor del árbol AVL, inicializa la raíz y el log de operaciones
  constructor() {
    this.root = null;
    this.operationLog = [];
    this._opCount = 0; // contador de comparaciones para análisis (Simplemente para la UI)
    this._rotationCount = 0; // contador de rotaciones para análisis (Simplemente para la UI)
    this._found = false; // usado por delete() para saber si el ID existía
  }

  // --------------- Altura y Factor de Balance ---------------

  _height(node) { // Devuelve la altura de un nodo (0 si es nulo)
    return node ? node.height : 0; // altura de un nodo nulo = 0
  }

  _updateHeight(node) { // Actualiza la altura de un nodo basado en las alturas de sus hijos
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right)); // altura = 1 + altura del hijo más alto
  }

  // Factor de balance: izquierda - derecha
  // Si bf > 1 → pesado a la izquierda → rotar derecha
  // Si bf < -1 → pesado a la derecha → rotar izquierda
  balanceFactor(node) { // Devuelve el factor de balance de un nodo (altura izquierda - altura derecha)
    return node ? this._height(node.left) - this._height(node.right) : 0; // factor de balance de un nodo nulo = 0
  }

  // --------------- Rotaciones ---------------

  // Rotación Simple Derecha (caso LL)
  //      y                x
  //     / \             / \
  //    x   T3   →     T1   y
  //   / \                 / \
  //  T1  T2             T2  T3
  _rotateRight(y) {
    const x = y.left; // Guardamos el hijo izquierdo de y (x) para hacer la rotación
    const T2 = x.right; // Guardamos el hijo derecho de x (T2) para reubicarlo

    x.right = y; // Hacemos que y sea el hijo derecho de x
    y.left = T2; // Hacemos que T2 sea el hijo izquierdo de y

    this._updateHeight(y); // Actualizamos la altura de y (ahora hijo derecho)
    this._updateHeight(x); // Actualizamos la altura de x (ahora raíz de este subárbol)

    this._rotationCount++; // Incrementamos el contador de rotaciones para análisis
    this.operationLog.push({ type: 'rotateRight', nodeKey: y.key, timestamp: Date.now() });
    return x;
  }

  // Rotación Simple Izquierda (caso RR)
  //    x                  y
  //   / \               / \
  //  T1   y     →      x   T3
  //      / \          / \
  //     T2  T3       T1  T2
  _rotateLeft(x) {
    const y = x.right; // Guardamos el hijo derecho de x (y) para hacer la rotación
    const T2 = y.left; // Guardamos el hijo izquierdo de y (T2) para reubicarlo

    y.left = x; // Hacemos que x sea el hijo izquierdo de y
    x.right = T2; // Hacemos que T2 sea el hijo derecho de x

    this._updateHeight(x); // Actualizamos la altura de x
    this._updateHeight(y); // Actualizamos la altura de y

    this._rotationCount++;
    this.operationLog.push({ type: 'rotateLeft', nodeKey: x.key, timestamp: Date.now() });
    return y;
  }

  // Rotación Doble Izquierda-Derecha (caso LR)
  // Primero rotamos el hijo izquierdo a la izquierda, luego la raíz a la derecha, se usa una combinacion de ambos algoritmos
  _rotateLeftRight(node) {
    node.left = this._rotateLeft(node.left); // Rotación simple izquierda en el hijo izquierdo
    this.operationLog.push({ type: 'rotateLeftRight', nodeKey: node.key, timestamp: Date.now() });
    return this._rotateRight(node); // Rotación simple derecha en la raíz
  }

  // Rotación Doble Derecha-Izquierda (caso RL)
  // Primero rotamos el hijo derecho a la derecha, luego la raíz a la izquierda, se usa una combinacion de ambos algoritmos
  _rotateRightLeft(node) {
    node.right = this._rotateRight(node.right); // Rotación simple derecha en el hijo derecho
    this.operationLog.push({ type: 'rotateRightLeft', nodeKey: node.key, timestamp: Date.now() });
    return this._rotateLeft(node); // Rotación simple izquierda en la raíz
  }

  // --------------- Rebalanceo --------------- O(log n)

  _rebalance(node) { // Estas es la funciona que decide cual de las 4 rotaciones aplicar, si es que se necesita alguna, y devuelve el nodo raíz del subárbol balanceado
    this._updateHeight(node); // Actualiza la altura del nodo actual antes de calcular el factor de balance
    const bf = this.balanceFactor(node); // Calcula el factor de balance del nodo actual

    // Caso LL: desbalance izquierdo, hijo izquierdo también pesa a la izquierda
    if (bf > 1 && this.balanceFactor(node.left) >= 0) {
      return this._rotateRight(node);
    }

    // Caso LR: desbalance izquierdo, pero hijo izquierdo pesa a la derecha
    if (bf > 1 && this.balanceFactor(node.left) < 0) {
      return this._rotateLeftRight(node);
    }

    // Caso RR: desbalance derecho, hijo derecho también pesa a la derecha
    if (bf < -1 && this.balanceFactor(node.right) <= 0) {
      return this._rotateLeft(node);
    }

    // Caso RL: desbalance derecho, pero hijo derecho pesa a la izquierda
    if (bf < -1 && this.balanceFactor(node.right) > 0) {
      return this._rotateRightLeft(node);
    }

    return node; // ya balanceado
  }

  // --------------- INSERCIÓN --------------- O(logn)

  _insertNode(node, task) {
    if (!node) return new AVLNode(task); // Si el nodo es nulo, creamos un nuevo nodo AVL con la tarea

    this._opCount++; // Incrementamos el contador de comparaciones para análisis
    if (task.id < node.key) { // Si el ID de la tarea es menor que la clave del nodo actual, insertamos en el subárbol izquierdo
      node.left = this._insertNode(node.left, task); 
    } else if (task.id > node.key) { // Si el ID de la tarea es mayor que la clave del nodo actual, insertamos en el subárbol derecho
      node.right = this._insertNode(node.right, task);
    } else {
      // ID duplicado: actualizamos el dato
      node.task = task;
      return node;
    }

    return this._rebalance(node); // Rebalanceamos el nodo actual después de la inserción y devolvemos la nueva raíz del subárbol
  }

  // Este metodo resetea los contadores
  insert(task) { // Inserta una tarea en el árbol AVL, O(log n)
    this._opCount = 0; // Reiniciamos el contador de comparaciones para análisis
    this._rotationCount = 0; // Reiniciamos el contador de rotaciones para análisis 
    this.root = this._insertNode(this.root, task);
    this.operationLog.push({ // Para mopstrar informacion en el panel de análisis, guardamos la operación en el log
      op: 'insert',
      taskId: task.id,
      comparisons: this._opCount,
      rotations: this._rotationCount,
      treeHeight: this._height(this.root),
      timestamp: Date.now(),
    });
  }

  // --------------- BÚSQUEDA --------------- O(logn)

  _searchNode(node, id) { // Compara id's hasta encontrar como esta balanceado nunca va a costar mas de O(logn)
    if (!node) return null; // Si el nodo es nulo, la búsqueda falla
    this._opCount++; // Incrementamos el contador de comparaciones para análisis

    if (id === node.key) return node.task; // Si encontramos el nodo, devolvemos la tarea
    if (id < node.key) return this._searchNode(node.left, id); // Si el ID buscado es menor que la clave del nodo actual, buscamos en el subárbol izquierdo
    return this._searchNode(node.right, id); // Si el ID buscado es mayor que la clave del nodo actual, buscamos en el subárbol derecho
  }

  // Es la version publica, convierte el id en numero, llama a searchNode, resetea los contadores y guarda el log de la operación
  search(id) {
    this._opCount = 0;
    const numId = Number(id);
    const result = this._searchNode(this.root, numId);
    this.operationLog.push({
      op: 'search',
      taskId: numId,
      found: !!result,
      comparisons: this._opCount,
      timestamp: Date.now(),
    });
    return result;
  }

  // --------------- ELIMINACIÓN --------------- O(logn)

  // Encontrar el nodo con el valor mínimo (sucesor in-order) el mas pequeño del subarbol derecho
  _minNode(node) { // Devuelve el nodo con la clave mínima en el subárbol dado (el más a la izquierda), para encontrar el sucesor in-order en la eliminación
    let current = node; // Comenzamos desde el nodo dado
    while (current.left) current = current.left; // Mientras haya un hijo izquierdo, seguimos bajando a la izquierda
    return current;
  }

  // Primero navega hasta econtrar el id y existen 3 casos, (que no tenga hijos), (que tenga un solo hijo), (que tenga dos hijos )
  _deleteNode(node, id) {
    if (!node) return null;

    this._opCount++;
    if (id < node.key) { // Si el ID a eliminar es menor que la clave del nodo actual, buscamos en el subárbol izquierdo
      node.left = this._deleteNode(node.left, id);
    } else if (id > node.key) { // Si el ID a eliminar es mayor que la clave del nodo actual, buscamos en el subárbol derecho
      node.right = this._deleteNode(node.right, id);
    } else { // Nodo encontrado, procedemos a eliminarlo
      // Encontrado — tres casos:
      this._found = true; // Marcamos que el nodo fue encontrado para el log de la operación
      if (!node.left || !node.right) { // Caso 1 y 2: nodo hoja o con un solo hijo
        // Caso 1 y 2: hoja o un solo hijo
        node = node.left || node.right; // Si tiene un hijo, lo reemplazamos; si es hoja, será null
      } else {
        // Caso 3: dos hijos → reemplazar con sucesor in-order
        const successor = this._minNode(node.right); // Encontramos el sucesor in-order (el nodo más pequeño del subárbol derecho)
        node.task = successor.task; // Copiamos la tarea del sucesor al nodo actual
        node.key = successor.key; // Actualizamos la clave del nodo actual con la clave del sucesor
        node.right = this._deleteNode(node.right, successor.key); // Eliminamos el sucesor del subárbol derecho
      }
    }

    if (!node) return null; // Si el nodo es null después de la eliminación, retornamos null
    return this._rebalance(node); // Rebalanceamos el nodo actual después de la eliminación y devolvemos la nueva raíz del subárbol
  }

  // Es el metodo o version publica de delete, resetea los contadores, llama a deleteNode y guarda el log de la operación
  delete(id) {
    this._opCount = 0;
    this._rotationCount = 0;
    this._found = false;
    const numId = Number(id);
    this.root = this._deleteNode(this.root, numId);
    const existed = this._found;
    this.operationLog.push({
      op: 'delete',
      taskId: numId,
      existed,
      comparisons: this._opCount,
      rotations: this._rotationCount,
      treeHeight: this._height(this.root),
      timestamp: Date.now(),
    });
    return existed;
  }

  // --------------- ACTUALIZACIÓN ---------------

  // Cuando se actualiza el id no puede cambiar entonces lo mas facil es eliminarlo y volverlo a insertar ya con la nueva informacion
  update(updatedTask) { // Actualiza una tarea existente en el árbol AVL (el ID no puede cambiar)
    this.delete(updatedTask.id); // Eliminamos la tarea existente con el mismo ID (si existe)
    this.insert(updatedTask); // Insertamos la tarea actualizada (si no existía, simplemente la insertamos)
  }

  // --------------- UTILIDADES ---------------

  // Recorre el árbol en in-order (devuelve tareas ordenadas por ID) de Izq a Der, se usa para mostrar la lista de tareas en orden y para reconstruir el árbol desde un array
  inOrder(node = this.root, result = []) { // Devuelve un array de tareas ordenadas por ID (in-order traversal)
    if (!node) return result; // Si el nodo es nulo, retornamos el resultado acumulado
    this.inOrder(node.left, result); // Recorremos el subárbol izquierdo
    result.push(node.task); // Agregamos la tarea del nodo actual al resultado
    this.inOrder(node.right, result); // Recorremos el subárbol derecho
    return result; // Retornamos el resultado acumulado (array de tareas ordenadas por ID)
  }

  // BFS (nivel por nivel) — lo usamos para construir la visualización SVG
  // Este nos ayudo a construirlo la IA porque no sabiamos como hacerlo bien para visualizar el arbol
  toLevelOrder() {
    if (!this.root) return [];
    const result = [];
    const queue = [{ node: this.root, level: 0, x: 0, parentX: null, side: null }];

    while (queue.length) {
      const { node, level, x, parentX, side } = queue.shift();
      result.push({
        key: node.key,
        task: node.task,
        height: node.height,
        bf: this.balanceFactor(node),
        level,
        x,
        parentX,
        side,
      });
      if (node.left) queue.push({ node: node.left, level: level + 1, x: x - 1, parentX: x, side: 'left' });
      if (node.right) queue.push({ node: node.right, level: level + 1, x: x + 1, parentX: x, side: 'right' });
    }
    return result;
  }

  size() { // Devuelve el número de nodos en el árbol AVL (O(n) porque recorre todo el árbol)
    return this.inOrder().length; // O(n) porque recorre todo el árbol
  }

  height() { // Devuelve la altura del árbol AVL (O(log n) porque solo sigue un camino desde la raíz hasta una hoja)
    return this._height(this.root); // O(log n) porque solo sigue un camino desde la raíz hasta una hoja
  }

  // Reconstruye el árbol desde un array (para LocalStorage)
  buildFromArray(tasks) {
    this.root = null;
    tasks.forEach((t) => this.insert(t));
  }

  clearLog() { // Solo limpia el registro de operaciones, no toca el árbol
    this.operationLog = [];
  }
}
