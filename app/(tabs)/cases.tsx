import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { CaseService } from '../../features/case/case.service';
import { EventService } from '../../features/event/event.service';
import { TaskService } from '../../features/task/task.service';
import { router } from 'expo-router';
import { SyncService } from '@/features/sync/sync.service';

type Case = any;
type CaseEvent = any;
type Task = any;

export default function CasesScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  

  const onRefresh = async () => {
  setRefreshing(true);

  await SyncService.syncAll();
  loadCases();

  setRefreshing(false);
};

  const loadCases = async () => {
    // console.log("load cases called");
    const data = CaseService.getCases();
    // console.log(data);
    setCases(data);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCurrentEvent = (events: CaseEvent[]) => {
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

  const getLastTask = (tasks: Task[]) => {
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

  const renderCase = ({ item }: { item: Case }) => {
    const isOpen = expanded[item.id];

    const events = EventService.getEvents(item.id);
    const tasks = TaskService.getTasks(item.id);

    const currentEvent = getCurrentEvent(events);
    const lastTask = getLastTask(tasks);

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item.id)}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginBottom: 10,
          backgroundColor: '#fff',
        }}
      >
        {/* 🔹 COLLAPSED VIEW */}
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

        {/* 🔹 EXPANDED VIEW */}
        {isOpen && (
          <View style={{ marginTop: 10 }}>
            <Text>--- Details ---</Text>

            <Text>Description: {item.description || '-'}</Text>
            <Text>Court: {item.court || '-'}</Text>

            {/* Recent Events */}
            <Text style={{ marginTop: 8, fontWeight: 'bold' }}>
              Events
            </Text>

            {events.slice(0, 3).map((e) => (
              <Text key={e.id}>
                • {e.content} ({new Date(e.eventDate).toDateString()})
              </Text>
            ))}

            {/* Recent Tasks */}
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

            {/* Actions */}
            <View style={{ marginTop: 10 }}>
              <Text style={{ color: 'blue' }}
              onPress={()=>router.push(`/case/${item.id}`)}>
                Open Details →
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  useEffect(() => {
  loadInitial();
}, []);

const loadInitial = async () => {
  setLoading(true);

  loadCases(); // local first

  await SyncService.syncAll(); // fetch

  loadCases(); // refresh

  setLoading(false);
};

if (loading) {
  return (
    <View style={{ padding: 20 }}>
      <Text>Loading cases...</Text>
    </View>
  );
}

if (!cases.length) {
  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        No cases yet
      </Text>

      <Text>Create your first case to get started</Text>
    </View>
  );
}

  return (
    <FlatList
      data={cases}
      keyExtractor={(item) => item.id}
      renderItem={renderCase}
      contentContainerStyle={{ padding: 12 }}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}