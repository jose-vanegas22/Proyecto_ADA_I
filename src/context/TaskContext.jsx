/**
 * TaskContext.jsx
 * Contexto global de React que envuelve el TaskService.
 * Los componentes consumen este contexto en vez de llamar al servicio directamente.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/TaskService.js';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    // Nos suscribimos al servicio para re-renderizar cuando cambia algo
    const unsub = taskService.subscribe(() => forceRender((n) => n + 1));
    return unsub;
  }, []);

  const addTask = useCallback((data) => taskService.addTask(data), []);
  const deleteTask = useCallback((id) => taskService.deleteTask(id), []);
  const completeTask = useCallback((id) => taskService.completeTask(id), []);
  const searchById = useCallback((id) => taskService.searchById(id), []);
  const extractHighestPriority = useCallback(() => taskService.extractHighestPriority(), []);
  const runTests = useCallback(() => taskService.runTestSuite(), []);
  const clearAll = useCallback(() => taskService.clear(), []);

  const value = {
    // acciones
    addTask,
    deleteTask,
    completeTask,
    searchById,
    extractHighestPriority,
    runTests,
    clearAll,
    // datos derivados (recalculados en cada render)
    get tasks() { return taskService.getAllTasks(); },
    get pending() { return taskService.getPendingTasks(); },
    get completed() { return taskService.getCompletedTasks(); },
    get stats() { return taskService.getStats(); },
    get heapSnapshot() { return taskService.getHeapSnapshot(); },
    get avlLevelOrder() { return taskService.getAVLLevelOrder(); },
    get topTask() { return taskService.peekHighestPriority(); },
    get logs() { return taskService.getOperationLogs(); },
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks debe usarse dentro de TaskProvider');
  return ctx;
}
