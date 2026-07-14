export function Sidebar({ currentPage, onNavigate, mobileOpen }) {
  const navItems = [
    { id: 'tasks', icon: '☰', label: 'Tareas' },
    { id: 'structures', icon: '⬡', label: 'Estructuras de Datos' },
    { id: 'tests', icon: '✓', label: 'Casos de Prueba' },
  ];

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">⚡</div>
        <div className="logo-text">
          TaskPriority Pro
          <span>Heap + AVL · ADA I</span>
        </div>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Navegación</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        Wilson D. Gómez<br />
        José D. Vanegas<br />
        ADA I · 2026
      </div>
    </aside>
  );
}
