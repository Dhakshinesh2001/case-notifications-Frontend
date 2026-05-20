import { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { CaseService } from '@/features/case/case.service';
import { TaskService } from '@/features/task/task.service';
import { EventService } from '@/features/event/event.service';

import CaseHeader from '@/components/case/CaseHeader';
import TimelineItem from '@/components/case/TimelineItem';
import AddButton from '@/components/case/AddButton';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams();

  const [caseData, setCaseData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadData = () => {
        setCaseData(CaseService.getCaseById(id as string));
        setTasks(TaskService.getTasks(id as string));
        setEvents(EventService.getEvents(id as string));
    };

  useEffect(() => {
    if (!id) return;

    loadData();
  }, [id]);

  // 🧠 SAFE STATE HELPERS

  const addTempTask = (task: any) => {
    if (!task) return;
    setTasks((prev) => [task, ...prev]);
  };

  const updateTaskLocal = (id: string, updates: any) => {
    setTasks((prev) =>
      prev.map((t) => (t?.id === id ? { ...t, ...updates } : t))
    );
  };

  const replaceTempTask = (tempId: string, newTask: any) => {
    if (!newTask) return;

    setTasks((prev) =>
      prev.map((t) => (t?.id === tempId ? newTask : t))
    );
  };

  const updateEventLocal = (id: string, updates: any) => {
    setEvents((prev) =>
      prev.map((e) => (e?.id === id ? { ...e, ...updates } : e))
    );
  };

  const replaceTempEvent = (tempId: string, newEvent: any) => {
    if (!newEvent) return;

    setEvents((prev) =>
      prev.map((e) => (e?.id === tempId ? newEvent : e))
    );
  };

  const handleAddEvent = () => {
    const tempEvent = {
      id: `temp_event_${Date.now()}`,
      content: '',
      type: 'GENERAL',
      eventDate: null,
      isTemp: true,
      caseId: id,
    };

    setEvents((prev) => [tempEvent, ...prev]);
    setExpandedId(`event_${tempEvent.id}`);
  };

  const buildTimeline = () => {
    const tasksByEvent: Record<string, any[]> = {};

    tasks
      .filter(Boolean) // 🔥 FIX
      .forEach((t) => {
        if (t?.eventId) {
          if (!tasksByEvent[t.eventId]) {
            tasksByEvent[t.eventId] = [];
          }
          tasksByEvent[t.eventId].push(t);
        }
      });

    return events
      .filter(Boolean) // 🔥 FIX
      .map((event) => ({
        event,
        tasks: tasksByEvent[event.id] || [],
        date: new Date(event.eventDate || Date.now()),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const timeline = buildTimeline();

  useEffect(() => {
    if (timeline.length > 0) {
      setExpandedId(`event_${timeline[0].event.id}`);
    }
  }, [events]);

  if (!caseData) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={timeline}
        keyExtractor={(item) => item.event.id}
        ListHeaderComponent={<CaseHeader caseData={caseData}   onUpdate={loadData}/>}
        renderItem={({ item, index }) => (
          <TimelineItem
            item={item}
            index={index}
            onUpdate={loadData}
            expandedId={expandedId}
            setExpandedId={setExpandedId}

            // 🔥 FULL PIPELINE
            onAddTask={addTempTask}
            updateTaskLocal={updateTaskLocal}
            replaceTempTask={replaceTempTask}
            updateEventLocal={updateEventLocal}
            replaceTempEvent={replaceTempEvent}
          />
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      <AddButton onAddEvent={handleAddEvent} />
    </View>
  );
}