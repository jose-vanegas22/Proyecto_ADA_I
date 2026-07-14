import { useState } from 'react';
import { TaskProvider } from './context/TaskContext.jsx';
import { taskService } from './services/TaskService.js';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { TasksPage } from './pages/TasksPage.jsx';
import { StructuresPage } from './pages/StructuresPage.jsx';
import { TestsPage } from './pages/TestsPage.jsx';
import { ToastContainer } from './components/ui/Toast.jsx';
import { useToast } from './hooks/useToast.js';
import './styles/global.css';

// Exponemos el servicio a window para que StructuresPage acceda al root del AVL
// (workaround sencillo para no complicar el contexto con el nodo root)
window.__taskService__ = taskService;

function AppInner() {
  const [page, setPage] = useState('tasks');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, addToast } = useToast();

  // StructuresPage necesita el root del AVL actualizado
  // Lo resolvemos inyectándolo en window antes de cada render
  window.__avlRoot__ = taskService.avl.root;

  const pageTitle = {
    tasks: 'Tareas',
    structures: 'Estructuras de Datos',
    tests: 'Casos de Prueba',
  };

  function renderPage() {
    switch (page) {
      case 'tasks':       return <TasksPage onToast={addToast} />;
      case 'structures':  return <StructuresPage />;
      case 'tests':       return <TestsPage onToast={addToast} />;
      default:            return <TasksPage onToast={addToast} />;
    }
  }

  return (
    <div className="app-shell">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} />
      )}

      <Sidebar currentPage={page} onNavigate={(p) => { setPage(p); setSidebarOpen(false); }} mobileOpen={sidebarOpen} />

      <div className="main-area">
        {/* Top bar */}
        <div className="topbar">
          <button className="btn btn-ghost btn-icon"
            style={{ display: 'none' }}  /* visible en mobile via CSS */
            onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{pageTitle[page]}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
              Heap + AVL · ADA I
            </span>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              WJ
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          {renderPage()}
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <AppInner />
    </TaskProvider>
  );
}
