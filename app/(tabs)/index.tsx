import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { CaseAPI } from '../../api/case.api';
import { runMigrations } from '../../db/migrations';
import { Case, CaseRepository } from '../../repositories/case.repository';
import { EventRepository } from '../../repositories/event.repository';
import { TaskRepository } from '../../repositories/task.repository';
import { isOnline } from '../../utils/network';
//import * as Notifications from 'expo-notifications';




export default function HomeScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const router = useRouter();
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // const loadCases = () => {
  //   const data = CaseRepository.getAllCases();
  //   setCases(data);
  // };
  const loadCases = async () => {
  const local = await CaseRepository.getCases((updated) => {
    setCases(updated);
  });

  setCases(local);

  // 🔥 trigger push sync
  const online = await isOnline();
  if (online) {
    CaseRepository.pushCases();
  }
};

  useEffect(() => {
    console.log(process.env.EXPO_PUBLIC_API_URL);
    runMigrations();
    loadCases();
    // Notifications.requestPermissionsAsync();
  }, []);

  // const handleAddCase = async () => {
  //   await CaseRepository.createCase('New Case ' + Date.now());
  //   loadCases();
  // };

  const handleAddCase = async () => {
    // console.log('case added');
    // console.log("dhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakddddddddddhakdhakdhakdddddddddcases", cases);
    try {
      await CaseAPI.createCase({
        title: 'New Case ' + Date.now(),
      });

      loadCases();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async () => {
    if (cases.length === 0) return;

    const caseId = cases[0].id; // TODO set the correct id
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
  console.log(cases);

  return (
    <View style={{ padding: 20, marginTop: 50, backgroundColor: 'white' }}>
      <Button title="Add Case" onPress={handleAddCase} />
      <Button title="Add Event to First Case" onPress={handleAddEvent} />
      <Button title="Add Task to First Case" onPress={handleAddTask} />

      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginTop: 10, backgroundColor: "white" }}>
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
                  style={{ fontSize: 16, backgroundColor: "white" }}
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
      <Text
        style={{ fontSize: 16, backgroundColor: "red" }}

      >
      </Text>
    </View>
  );
}