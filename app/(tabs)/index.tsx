import { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput } from 'react-native';
import { runMigrations } from '../../db/migrations';
import { CaseRepository, Case } from '../../repositories/case.repository';
import { EventRepository } from '../../repositories/event.repository';
import { TaskRepository } from '../../repositories/task.repository';
import { useRouter } from 'expo-router';
//import * as Notifications from 'expo-notifications';




export default function HomeScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const router = useRouter();
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const loadCases = () => {
    const data = CaseRepository.getAllCases();
    setCases(data);
  };

  useEffect(() => {
    runMigrations();
    loadCases();
    // Notifications.requestPermissionsAsync();
  }, []);

  const handleAddCase = async () => {
    await CaseRepository.createCase('New Case ' + Date.now());
    loadCases();
  };

  const handleAddEvent = async () => {
    if (cases.length === 0) return;

    const caseId = cases[0].id;
    await EventRepository.createEvent(
      caseId,
      'Hearing',
      new Date().toISOString()
    );

    alert('Event added');
  };

  const handleAddTask = async () => {
    if (cases.length === 0) return;

    const caseId = cases[0].id;
    await TaskRepository.createTask(caseId, 'Prepare documents');

    alert('Task added');
  };

  return (
    <View style={{ padding: 20, marginTop: 50, backgroundColor: 'white' }}>
      <Button title="Add Case" onPress={handleAddCase} />
      <Button title="Add Event to First Case" onPress={handleAddEvent} />
      <Button title="Add Task to First Case" onPress={handleAddTask} />

      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
  <View style={{ marginTop: 10 }}>
    {editingCaseId === item.id ? (
      <>
        <TextInput
          value={editTitle}
          onChangeText={setEditTitle}
          style={{ borderWidth: 1, padding: 6 }}
        />

        <Button
          title="Save"
          onPress={() => {
            CaseRepository.updateCase(item.id, editTitle);
            setEditingCaseId(null);
            loadCases();
          }}
        />
      </>
    ) : (
      <>
        <Text
          style={{ fontSize: 16 }}
          onPress={() => router.push(`/case/${item.id}`)}
        >
          {item.title}
        </Text>

        <Button
          title="Edit"
          onPress={() => {
            setEditingCaseId(item.id);
            setEditTitle(item.title);
          }}
        />

        <Button
          title="Delete"
          onPress={() => {
            CaseRepository.deleteCase(item.id);
            loadCases();
          }}
        />
      </>
    )}
  </View>
)}
      />
    </View>
  );
}