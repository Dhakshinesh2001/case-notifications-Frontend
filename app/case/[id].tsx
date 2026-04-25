import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, FlatList, TextInput, Button } from 'react-native';

import { CaseRepository, Case } from '../../repositories/case.repository';
import { EventRepository, CaseEvent } from '../../repositories/event.repository';
import { TaskRepository, Task } from '../../repositories/task.repository';

import DateTimePicker from '@react-native-community/datetimepicker';
import { CaseAPI } from '../../api/case.api';
import { isOnline } from '../../utils/network';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [eventTitle, setEventTitle] = useState('');
  const [taskTitle, setTaskTitle] = useState('');

  const [eventDate, setEventDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  useEffect(() => {
  if (!id) return;

  const loadData = async () => {
    // 🔄 Always load local first
    const localCase =
      CaseRepository.getAllCases().find(c => c.id === id) || null;

    setCaseData(localCase);

    const caseEvents = EventRepository.getEventsByCase(id as string);
    const caseTasks = TaskRepository.getTasksByCase(id as string);

    setEvents(caseEvents);
    setTasks(caseTasks);

    // 🌐 Try sync (if online)
    const online = await isOnline();

    if (online) {
      try {
        const remote = await CaseAPI.getCaseById(id as string);

        // 🔄 Update local DB with latest backend data
        CaseRepository.updateCase(
          remote.id,
          remote.title
        );

        setCaseData(remote);
      } catch (err) {
        console.log('Sync failed', err);
      }
    }
  };

  loadData();
}, [id]);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setEventDate(selectedDate);
  };

  const handleAddEvent = async () => {
    if (!id || !eventTitle.trim()) return;

    await EventRepository.createEvent(
      id as string,
      eventTitle,
      eventDate.toISOString()
    );

    const updated = EventRepository.getEventsByCase(id as string);
    setEvents(updated);
    setEventTitle('');
  };

  const handleAddTask = async () => {
    if (!id || !taskTitle.trim()) return;

    await TaskRepository.createTask(
      id as string,
      taskTitle,
      selectedEventId
    );

    const updated = TaskRepository.getTasksByCase(id as string);
    setTasks(updated);
    setTaskTitle('');
  };

  const handleUpdateStatus = (taskId: string, status: string) => {
    TaskRepository.updateTaskStatus(taskId, status);

    const updated = TaskRepository.getTasksByCase(id as string);
    setTasks(updated);
  };

  const renderHeader = () => (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        {caseData?.title}
      </Text>

      {/* EVENTS */}
      <Text style={{ marginTop: 15 }}>Events:</Text>

      {events.map((item) => (
        <View key={item.id} style={{ marginTop: 5 }}>
          <Text>- {item.title}</Text>

          <Button
            title="Delete"
            onPress={() => {
              EventRepository.deleteEvent(item.id);
              setEvents(
                EventRepository.getEventsByCase(id as string)
              );
            }}
          />
        </View>
      ))}

      {/* ADD EVENT */}
      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Add Event</Text>

      <TextInput
        placeholder="Event title"
        value={eventTitle}
        onChangeText={setEventTitle}
        style={{ borderWidth: 1, padding: 8, marginTop: 8 }}
      />

      <Text style={{ marginTop: 8 }}>
        Date: {eventDate.toDateString()}
      </Text>

      <Button title="Pick Date" onPress={() => setShowPicker(true)} />

      {showPicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          onChange={handleDateChange}
        />
      )}

      <Button title="Add Event" onPress={handleAddEvent} />

      {/* EVENT LINKING */}
      <Text style={{ marginTop: 20 }}>Link to Event:</Text>

      {events.map((item) => (
        <Text
          key={item.id}
          onPress={() => setSelectedEventId(item.id)}
          style={{
            padding: 6,
            backgroundColor:
              selectedEventId === item.id ? '#ddd' : 'transparent',
          }}
        >
          {item.title}
        </Text>
      ))}

      {/* ADD TASK */}
      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Add Task</Text>

      <TextInput
        placeholder="Task title"
        value={taskTitle}
        onChangeText={setTaskTitle}
        style={{ borderWidth: 1, padding: 8, marginTop: 8 }}
      />

      <Button title="Add Task" onPress={handleAddTask} />

      <Text style={{ marginTop: 20 }}>Tasks:</Text>
    </View>
  );

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
      style={{
            marginTop: 10,
            padding: 10,
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: 'white',
          }}
      renderItem={({ item }) => (
        <View
          style={{
            marginTop: 10,
            padding: 10,
            borderWidth: 1,
            borderRadius: 8,
            backgroundColor: 'white',
          }}
        >
          {editingTaskId === item.id ? (
            <>
              <TextInput
                value={editTaskTitle}
                onChangeText={setEditTaskTitle}
                style={{ borderWidth: 1, padding: 6 }}
              />

              <Button
                title="Save"
                onPress={() => {
                  TaskRepository.updateTask(item.id, editTaskTitle);
                  setEditingTaskId(null);
                  setTasks(
                    TaskRepository.getTasksByCase(id as string)
                  );
                }}
              />
            </>
          ) : (
            <>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>

              <Text>Status: {item.status}</Text>

              <Button
                title="Edit"
                onPress={() => {
                  setEditingTaskId(item.id);
                  setEditTaskTitle(item.title);
                }}
              />

              <Button
                title="Delete"
                onPress={() => {
                  TaskRepository.deleteTask(item.id);
                  setTasks(
                    TaskRepository.getTasksByCase(id as string)
                  );
                }}
              />

              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <Button
                  title="Open"
                  onPress={() => handleUpdateStatus(item.id, 'OPEN')}
                />
                <Button
                  title="In Progress"
                  onPress={() =>
                    handleUpdateStatus(item.id, 'IN_PROGRESS')
                  }
                />
                <Button
                  title="Done"
                  onPress={() => handleUpdateStatus(item.id, 'DONE')}
                />
              </View>
            </>
          )}
        </View>
      )}
    />
  );
}