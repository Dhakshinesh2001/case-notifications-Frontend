import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, FlatList } from 'react-native';

import { CaseRepository } from '../../repositories/case.repository';
import { EventRepository } from '../../repositories/event.repository';
import { TaskRepository } from '../../repositories/task.repository';

import { CaseEvent } from '../../repositories/event.repository';
import { Task } from '../../repositories/task.repository';
import { Case } from '../../repositories/case.repository';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scheduleEventNotification } from '../../utils/notifications';

import { TextInput, Button } from 'react-native';

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

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
            setEventDate(selectedDate);
        }
    };
    useEffect(() => {
        if (!id) return;

        const caseItem = CaseRepository.getAllCases().find(c => c.id === id) || null;
        const caseEvents = EventRepository.getEventsByCase(id as string);
        const caseTasks = TaskRepository.getTasksByCase(id as string);

        setCaseData(caseItem);
        setEvents(caseEvents);
        setTasks(caseTasks);
    }, [id]);
    const handleAddEvent = async () => {
        if (!id || !eventTitle) return;

        await EventRepository.createEvent(
            id as string,
            eventTitle,
            eventDate.toISOString()
        );

        await scheduleEventNotification(eventTitle, eventDate);

        const updated = EventRepository.getEventsByCase(id as string);
        setEvents(updated);
        setEventTitle('');
    };

    const handleAddTask = async () => {
        if (!id || !taskTitle) return;

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

    return (
        <View style={{ padding: 20, marginTop: 50, backgroundColor: 'white' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                {caseData?.title}
            </Text>

            <Text style={{ marginTop: 10 }}>Events:</Text>
            <FlatList
                data={events}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => (
                    <Text>- {item.title}</Text>
                )}
            />
            <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Add Event</Text>

            <TextInput
                placeholder="Event title"
                value={eventTitle}
                onChangeText={setEventTitle}
                style={{
                    borderWidth: 1,
                    padding: 8,
                    marginTop: 8,
                    borderRadius: 6,
                }}
            />

            <Button title="Add Event" onPress={handleAddEvent} />
            <Text style={{ marginTop: 10 }}>
                Date: {eventDate.toDateString()}
            </Text>

            <Button title="Pick Date" onPress={() => setShowPicker(true)} />

            {showPicker && (
                <DateTimePicker
                    value={eventDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            <Text style={{ marginTop: 20 }}>Tasks:</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }: any) => (
                    <View
                        style={{
                            marginTop: 10,
                            padding: 10,
                            borderWidth: 1,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>

                        <Text>Status: {item.status}</Text>
                        <Text>Event: {item.eventId || 'None'}</Text>

                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            <Button
                                title="Open"
                                onPress={() => handleUpdateStatus(item.id, 'OPEN')}
                            />
                            <Button
                                title="In Progress"
                                onPress={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}
                            />
                            <Button
                                title="Done"
                                onPress={() => handleUpdateStatus(item.id, 'DONE')}
                            />
                        </View>
                    </View>
                )}
            />
            <Text style={{ marginTop: 10 }}>Link to Event (optional):</Text>

<FlatList
  data={events}
  keyExtractor={(item: any) => item.id}
  renderItem={({ item }: any) => (
    <Text
      onPress={() => setSelectedEventId(item.id)}
      style={{
        padding: 6,
        backgroundColor:
          selectedEventId === item.id ? '#ddd' : 'transparent',
      }}
    >
      {item.title}
    </Text>
  )}
/>
            <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Add Task</Text>

            <TextInput
                placeholder="Task title"
                value={taskTitle}
                onChangeText={setTaskTitle}
                style={{
                    borderWidth: 1,
                    padding: 8,
                    marginTop: 8,
                    borderRadius: 6,
                }}
            />

            <Button title="Add Task" onPress={handleAddTask} />
        </View>
    );
}