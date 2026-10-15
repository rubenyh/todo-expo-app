import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeTasks, type TodoTask } from './tasks';

const STORAGE_KEY = 'todo-expo.tasks.v1';

export async function loadTasks(): Promise<TodoTask[]> {
  return decodeTasks(await AsyncStorage.getItem(STORAGE_KEY));
}

export async function storeTasks(tasks: TodoTask[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
