import test from 'node:test';
import assert from 'node:assert/strict';
import { saveTask, removeTask, decodeTasks } from '../src/tasks.ts';

test('crear y editar recorta espacios, mantiene el orden y no modifica la lista anterior', () => {
  const first = { id: '1', name: 'Leer', description: '' };
  const original = [first];
  const added = saveTask(original, { id: '2', name: '  Exposición  ', description: ' Expo \n' });
  assert.deepEqual(original, [first]);
  assert.deepEqual(added[1], { id: '2', name: 'Exposición', description: 'Expo' });
  const edited = saveTask(added, { id: '1', name: '  Leer apuntes ', description: ' Tema 1 ' });
  assert.deepEqual(edited.map(task => task.id), ['1', '2']);
  assert.equal(edited[0].name, 'Leer apuntes');
  assert.equal(added[0].name, 'Leer');
});

test('rechaza nombres vacíos o compuestos solamente por espacios', () => {
  for (const name of ['', '  ', '\n\t']) {
    assert.throws(() => saveTask([], { id: '1', name, description: '' }));
  }
});

test('eliminar afecta solo a la tarea seleccionada y permite vaciar la lista', () => {
  const tasks = [{ id: '1', name: 'Uno', description: '' }, { id: '2', name: 'Dos', description: '' }];
  assert.deepEqual(removeTask(tasks, '1'), [tasks[1]]);
  assert.deepEqual(removeTask(removeTask(tasks, '1'), '2'), []);
  assert.equal(tasks.length, 2);
});

test('el formato JSON conserva identificadores, acentos y saltos de línea', () => {
  const tasks = [{ id: 'único', name: 'Exposición', description: 'Android\niOS' }];
  assert.deepEqual(decodeTasks(JSON.stringify(tasks)), tasks);
  assert.deepEqual(decodeTasks(null), []);
});

test('datos dañados o identificadores duplicados producen error para evitar reemplazarlos', () => {
  for (const json of ['{', '{}', '[null]', '[{"id":"1","name":"  ","description":""}]',
    '[{"id":"1","name":"A","description":""},{"id":"1","name":"B","description":""}]']) {
    assert.throws(() => decodeTasks(json));
  }
});
