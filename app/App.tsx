import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal,
  Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { randomUUID } from 'expo-crypto';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { removeTask, saveTask, type TodoTask } from './src/tasks';
import { loadTasks, storeTasks } from './src/taskStorage';

export default function App() {
  return <SafeAreaProvider><TaskList /><StatusBar style="dark" /></SafeAreaProvider>;
}

function TaskList() {
  const [tasks, setTasks] = useState<TodoTask[] | null>(null);
  // undefined = closed, null = new task, TodoTask = edit that task.
  const [form, setForm] = useState<TodoTask | null | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const writeInProgress = useRef(false);

  async function load() {
    setLoadError(false);
    try {
      setTasks(await loadTasks());
    } catch {
      setLoadError(true);
    }
  }

  useEffect(() => { void load(); }, []);

  async function commit(nextTasks: TodoTask[]) {
    if (writeInProgress.current) return false;
    writeInProgress.current = true;
    setSaving(true);
    try {
      // Only show a change after storage confirms it was saved.
      await storeTasks(nextTasks);
      setTasks(nextTasks);
      return true;
    } catch {
      Alert.alert('No se pudo guardar', 'Tus cambios no se guardaron. Intenta de nuevo.');
      return false;
    } finally {
      writeInProgress.current = false;
      setSaving(false);
    }
  }

  async function submit(name: string, description: string) {
    if (!tasks || !name.trim()) return;
    const nextTasks = saveTask(tasks, {
      id: form?.id ?? randomUUID(), name, description,
    });
    if (await commit(nextTasks)) setForm(undefined);
  }

  function closeForm() {
    if (!writeInProgress.current) setForm(undefined);
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TODO · EXPO</Text>
          <Text accessibilityRole="header" style={styles.title}>Mis tareas</Text>
          <Text style={styles.secondary}>
            {tasks === null ? 'Tu lista, siempre a la mano.' : `${tasks.length} ${tasks.length === 1 ? 'tarea guardada' : 'tareas guardadas'}`}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Agregar tarea"
          disabled={tasks === null || saving} onPress={() => setForm(null)}
          style={[styles.addButton, (tasks === null || saving) && styles.disabled]}>
          <Text style={styles.plus}>+</Text>
        </Pressable>
      </View>

      {tasks === null ? (
        <View style={styles.center}>
          {loadError ? <>
            <Text style={styles.emptyTitle}>No se pudieron leer tus tareas</Text>
            <Text accessibilityRole="alert" style={styles.emptyText}>
              Reintenta la carga. Tus datos no se han reemplazado.
            </Text>
            <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.primary}>
              <Text style={styles.primaryText}>Reintentar</Text>
            </Pressable>
          </> : <ActivityIndicator size="large" color="#146B5C" accessibilityLabel="Cargando tareas" />}
        </View>
      ) : <FlatList
        data={tasks}
        keyExtractor={task => task.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.center}>
          <Text style={styles.emptySymbol}>≡</Text>
          <Text style={styles.emptyTitle}>Todavía no hay tareas</Text>
          <Text style={styles.emptyText}>Pulsa + para agregar tu primera tarea.</Text>
        </View>}
        renderItem={({ item }) => <View style={styles.card}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Editar tarea: ${item.name}`}
            disabled={saving} onPress={() => setForm(item)} style={styles.taskBody}>
            <Text style={styles.taskName}>{item.name}</Text>
            {!!item.description && <Text style={styles.description} numberOfLines={2}>{item.description}</Text>}
            <Text style={styles.editHint}>Toca para editar</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar tarea: ${item.name}`}
            disabled={saving} onPress={() => void commit(removeTask(tasks, item.id))}
            style={[styles.deleteButton, saving && styles.disabled]}>
            <Text style={styles.deleteText}>Eliminar</Text>
          </Pressable>
        </View>}
      />}

      <Text style={styles.footer}>{saving ? 'Guardando…' : 'Guardado local · Sin conexión'}</Text>

      <Modal visible={form !== undefined} animationType="slide" onRequestClose={closeForm}>
        {form !== undefined && <TaskForm key={form?.id ?? 'new'} task={form}
          saving={saving} onCancel={closeForm} onSave={submit} />}
      </Modal>
    </SafeAreaView>
  );
}

type FormProps = {
  task: TodoTask | null;
  saving: boolean;
  onCancel: () => void;
  onSave: (name: string, description: string) => Promise<void>;
};

function TaskForm({ task, saving, onCancel, onSave }: FormProps) {
  const [name, setName] = useState(task?.name ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const canSave = name.trim().length > 0 && !saving;

  return <SafeAreaView style={styles.page}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.formHeader}>
        <Pressable accessibilityRole="button" disabled={saving} onPress={onCancel} style={styles.textButton}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.formTitle}>{task ? 'Editar tarea' : 'Nueva tarea'}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nombre *</Text>
        <TextInput accessibilityLabel="Nombre de la tarea" value={name} onChangeText={setName}
          editable={!saving} placeholder="Ej. Preparar exposición" placeholderTextColor="#73837D"
          style={styles.input} autoCapitalize="sentences" />
        <Text style={styles.help}>Es obligatorio. Los espacios solos no cuentan.</Text>
        <Text style={styles.label}>Descripción</Text>
        <TextInput accessibilityLabel="Descripción de la tarea" value={description}
          onChangeText={setDescription} editable={!saving} multiline textAlignVertical="top"
          placeholder="Agrega los detalles que necesites" placeholderTextColor="#73837D"
          style={[styles.input, styles.textarea]} />
        <Pressable accessibilityRole="button" accessibilityLabel="Guardar tarea"
          disabled={!canSave} onPress={() => void onSave(name, description)}
          style={[styles.primary, !canSave && styles.disabled]}>
          <Text style={styles.primaryText}>{saving ? 'Guardando…' : 'Guardar tarea'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F5F7F4' },
  flex: { flex: 1 },
  header: { padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2, color: '#146B5C', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '700', color: '#18342B', marginBottom: 6 },
  secondary: { fontSize: 14, color: '#5E7068' },
  addButton: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#146B5C', alignItems: 'center', justifyContent: 'center' },
  plus: { color: '#FFFFFF', fontSize: 34, lineHeight: 39 },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 12, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE5DF', borderRadius: 18 },
  taskBody: { flex: 1, padding: 18 },
  taskName: { fontSize: 18, fontWeight: '600', color: '#18342B' },
  description: { fontSize: 15, lineHeight: 22, color: '#5E7068', marginTop: 6 },
  editHint: { fontSize: 12, color: '#146B5C', marginTop: 12 },
  deleteButton: { minHeight: 48, padding: 12, marginRight: 4, justifyContent: 'center' },
  deleteText: { color: '#A53535', fontSize: 13, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptySymbol: { color: '#146B5C', fontSize: 64 },
  emptyTitle: { color: '#18342B', fontSize: 21, fontWeight: '600', textAlign: 'center' },
  emptyText: { color: '#5E7068', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  footer: { color: '#5E7068', fontSize: 12, textAlign: 'center', padding: 16 },
  formHeader: { padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#DDE5DF' },
  textButton: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 8 },
  cancelText: { color: '#146B5C', fontSize: 16 },
  formTitle: { fontSize: 28, fontWeight: '700', color: '#18342B', paddingHorizontal: 8, marginBottom: 12 },
  form: { padding: 24 },
  label: { color: '#18342B', fontWeight: '600', fontSize: 16, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#B9C9BF', borderRadius: 12, backgroundColor: '#FFFFFF', padding: 15, fontSize: 16, color: '#18342B' },
  help: { color: '#5E7068', fontSize: 12, marginTop: 8, marginBottom: 28 },
  textarea: { minHeight: 140, marginBottom: 28 },
  primary: { minHeight: 52, borderRadius: 12, backgroundColor: '#146B5C', padding: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  disabled: { opacity: 0.4 },
});
