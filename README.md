# ⚡ TaskPriority Pro

**Sistema Inteligente de Gestión de Tareas mediante Colas de Prioridad y Árboles AVL**

> Proyecto de Análisis de Algoritmos I — Wilson David Gómez Gómez · José David Vanegas Martínez

---

## 📋 Descripción

TaskPriority Pro es una aplicación web que gestiona tareas usando **dos estructuras de datos avanzadas implementadas desde cero**:

- **Max-Heap Binario** — cola de prioridad para acceder siempre a la tarea más urgente en O(1) y extraerla en O(log n).
- **Árbol AVL** — árbol binario de búsqueda auto-balanceado que indexa las tareas por ID y garantiza búsquedas en O(log n) sin importar el orden de inserción.

Ambas estructuras se mantienen **sincronizadas en todo momento** a través de un servicio central. React nunca manipula el Heap ni el AVL directamente.

---

## 🛠 Tecnologías

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + JavaScript (ES2022) |
| Build tool | Vite 5 |
| Estilos | CSS3 puro con variables (sin librerías) |
| Persistencia | LocalStorage (sin backend) |
| Estructuras | Implementación propia desde cero |
| Visualizaciones | SVG nativo (sin librerías de grafos) |

> **No se usaron librerías externas para el Heap ni el AVL.** Todo el código algorítmico es original.

---

## 🚀 Instalación y ejecución

### Requisitos previos
- Node.js ≥ 18
- npm ≥ 9

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/<usuario>/taskpriority-pro.git
cd taskpriority-pro

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo
npm run dev
```

Abrir el navegador en `http://localhost:5173`

### Build de producción

```bash
npm run build
npm run preview   # previsualizar el build
```

---

## 📁 Estructura del proyecto

```
taskpriority-pro/
├── src/
│   ├── algorithms/
│   │   ├── heap/
│   │   │   └── MaxHeap.js          ← Heap implementado desde cero
│   │   └── avl/
│   │       └── AVLTree.js          ← AVL implementado desde cero
│   ├── components/
│   │   ├── layout/
│   │   │   └── Sidebar.jsx
│   │   ├── ui/
│   │   │   ├── AddTaskModal.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── Toast.jsx
│   │   └── visualizations/
│   │       ├── HeapVisualizer.jsx  ← SVG del árbol Heap
│   │       └── AVLVisualizer.jsx   ← SVG del árbol AVL con BF
│   ├── context/
│   │   └── TaskContext.jsx         ← Estado global React
│   ├── hooks/
│   │   └── useToast.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── TasksPage.jsx
│   │   ├── StructuresPage.jsx      ← Visualizaciones en tiempo real
│   │   ├── AnalysisPage.jsx        ← Tablas de complejidad Big O
│   │   └── TestsPage.jsx           ← CP01–CP04 del enunciado
│   ├── services/
│   │   └── TaskService.js          ← Sincronización Heap + AVL
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ✅ Funcionalidades

### Operaciones principales
| Operación | Estructura usada | Complejidad |
|-----------|-----------------|-------------|
| Agregar tarea | Heap + AVL | O(log n) |
| Buscar por ID | AVL | O(log n) |
| Eliminar tarea | Heap + AVL | O(log n) |
| Completar tarea | Heap + AVL | O(log n) |
| Extraer más prioritaria | Heap | O(log n) |
| Ver más prioritaria | Heap | O(1) |

### Páginas
- **Dashboard** — estadísticas, tarea más prioritaria, acciones rápidas
- **Tareas** — lista completa con búsqueda por ID y filtros
- **Estructuras de Datos** — visualización SVG del Heap y AVL en tiempo real
- **Análisis Big O** — tablas de complejidad temporal y espacial
- **Casos de Prueba** — CP01 a CP04 ejecutables con resultados visuales

### Modelo de datos
```javascript
{
  id: Number,             // identificador único (auto-incremental)
  titulo: String,
  descripcion: String,
  prioridad: 'Alta' | 'Media' | 'Baja',
  fechaCreacion: ISO String,
  fechaVencimiento: ISO String,
  estado: 'Pendiente' | 'Completada'
}
```

---

## 🧪 Casos de prueba (PDF requisito)

| ID | Nombre | Qué valida |
|----|--------|-----------|
| CP01 | Inserción y extracción | Heap extrae en orden correcto Alta → Media → Baja |
| CP02 | Eliminación y estructura | Raíz correcta después de extractMax |
| CP03 | Indexación AVL | Búsqueda de ID existente e inexistente |
| CP04 | Equilibrio AVL | Inserción 1→7 mantiene altura ≤ 3 (no degenera) |

Para ejecutarlos: ir a la sección **Casos de Prueba** → botón **Ejecutar pruebas**.

---

## 🏗 Decisiones de diseño

**¿Por qué Max-Heap y no Min-Heap?**
Porque el sistema necesita acceder a la tarea de mayor prioridad. Con un Max-Heap la raíz siempre es el máximo sin necesidad de invertir valores.

**¿Por qué AVL y no BST simple?**
Si se insertan IDs en orden creciente (1, 2, 3...), un BST degenera en lista enlazada con altura O(n). El AVL detecta el desbalance y aplica rotaciones, garantizando siempre O(log n).

**¿Por qué un TaskService singleton?**
Para garantizar que el Heap y el AVL nunca se desincronicen. Toda mutación pasa por un único punto de control.

---

## 👥 Autores

| Nombre | Rol |
|--------|-----|
| Wilson David Gómez Gómez | Desarrollo |
| José David Vanegas Martínez | Desarrollo |

**Materia:** Análisis de Algoritmos I  
**Año:** 2025

---

## 📜 Licencia

Proyecto académico — uso educativo.
