export type TodoTask = { id: string; name: string; description: string };

export function saveTask(tasks: TodoTask[], draft: TodoTask): TodoTask[] {
  const task = { ...draft, name: draft.name.trim(), description: draft.description.trim() };
  if (!task.id || !task.name) throw new Error('La tarea necesita identificador y nombre.');
  return tasks.some(item => item.id === task.id)
    ? tasks.map(item => item.id === task.id ? task : item)
    : [...tasks, task];
}

export function removeTask(tasks: TodoTask[], id: string): TodoTask[] {
  return tasks.filter(task => task.id !== id);
}

export function decodeTasks(json: string | null): TodoTask[] {
  if (json === null) return [];
  const data: unknown = JSON.parse(json);
  if (!Array.isArray(data)) throw new Error('La lista guardada no es válida.');
  const ids = new Set<string>();
  return data.map((item: unknown) => {
    if (typeof item !== 'object' || item === null ||
      !('id' in item) || typeof item.id !== 'string' || !item.id ||
      !('name' in item) || typeof item.name !== 'string' || !item.name.trim() ||
      !('description' in item) || typeof item.description !== 'string' || ids.has(item.id)) {
      throw new Error('Hay una tarea guardada con formato incorrecto.');
    }
    ids.add(item.id);
    return { id: item.id, name: item.name, description: item.description };
  });
}
