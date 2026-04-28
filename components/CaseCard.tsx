// components/case/CaseCard.tsx
import { useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { EventService } from '@/features/event/event.service';
import { TaskService } from '@/features/task/task.service';

type Props = {
  item: any;
  isOpen: boolean;
  onToggle: () => void;
};

export default function CaseCard({ item, isOpen, onToggle }: Props) {
  const lastTap = useRef<number | null>(null);

  // 👇 DOUBLE TAP HANDLER
  const handlePress = () => {
    const now = Date.now();

    if (lastTap.current && now - lastTap.current < 300) {
      // ✅ DOUBLE TAP → NAVIGATE
      router.push(`/case/${item.id}`);
      lastTap.current = null;
    } else {
      // ⏳ WAIT to see if second tap happens
      lastTap.current = now;

      setTimeout(() => {
        if (lastTap.current && Date.now() - lastTap.current >= 300) {
          // ✅ SINGLE TAP → EXPAND
          onToggle();
          lastTap.current = null;
        }
      }, 300);
    }
  };

  const events = EventService.getEvents(item.id);
  const tasks = TaskService.getTasks(item.id);

  const getCurrentEvent = (events: any[]) => {
    if (!events.length) return null;

    const now = new Date();

    const upcoming = events
      .filter((e) => new Date(e.eventDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() -
          new Date(b.eventDate).getTime()
      );

    if (upcoming.length) return upcoming[0];

    return events.sort(
      (a, b) =>
        new Date(b.eventDate).getTime() -
        new Date(a.eventDate).getTime()
    )[0];
  };

  const getLastTask = (tasks: any[]) => {
    if (!tasks.length) return null;

    return tasks.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )[0];
  };

  const getTaskColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return '#d4edda';
      case 'IN_PROGRESS':
        return '#fff3cd';
      default:
        return '#f8d7da';
    }
  };

  const currentEvent = getCurrentEvent(events);
  const lastTask = getLastTask(tasks);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#fff',
      }}
    >
      {/* 🔹 COLLAPSED */}
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
        {item.title}
      </Text>

      <Text>Case #: {item.caseNumber || '-'}</Text>
      <Text>Status: {item.status || 'Pending'}</Text>

      {currentEvent && (
        <Text style={{ marginTop: 5 }}>
          📅 {currentEvent.content} (
          {new Date(currentEvent.eventDate).toDateString()})
        </Text>
      )}

      {lastTask && (
        <View
          style={{
            marginTop: 5,
            padding: 6,
            borderRadius: 6,
            backgroundColor: getTaskColor(lastTask.status),
          }}
        >
          <Text>📝 {lastTask.title}</Text>
        </View>
      )}

      {/* 🔹 EXPANDED */}
      {isOpen && (
        <View style={{ marginTop: 10 }}>
          <Text>--- Details ---</Text>

          <Text>Description: {item.description || '-'}</Text>
          <Text>Court: {item.court || '-'}</Text>

          <Text style={{ marginTop: 8, fontWeight: 'bold' }}>
            Events
          </Text>

          {events.slice(0, 3).map((e) => (
            <Text key={e.id}>
              • {e.content} ({new Date(e.eventDate).toDateString()})
            </Text>
          ))}

          <Text style={{ marginTop: 8, fontWeight: 'bold' }}>
            Tasks
          </Text>

          {tasks.slice(0, 3).map((t) => (
            <View
              key={t.id}
              style={{
                marginTop: 4,
                padding: 6,
                borderRadius: 6,
                backgroundColor: getTaskColor(t.status),
              }}
            >
              <Text>{t.title}</Text>
              <Text>Status: {t.status}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}