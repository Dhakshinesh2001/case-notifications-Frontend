import { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { CaseService } from '@/features/case/case.service';
import { TaskService } from '@/features/task/task.service';
import { EventService } from '@/features/event/event.service';
import { SyncService } from '@/features/sync/sync.service';

import CaseHeader from '@/components/case/CaseHeader';
import TimelineItem from '@/components/case/TimelineItem';
import AddButton from '@/components/case/AddButton';

export default function CaseDetailScreen() {
    const { id } = useLocalSearchParams();

    const [caseData, setCaseData] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    const [filter, setFilter] = useState<'ALL' | 'EVENT' | 'TASK'>('ALL');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadData = () => {
        setCaseData(CaseService.getCaseById(id as string));
        setTasks(TaskService.getTasks(id as string));
        setEvents(EventService.getEvents(id as string));
    };

    useEffect(() => {
        loadData();
        SyncService.syncAll().then(loadData);
    }, []);

    // 🧠 timeline builder
    const buildTimeline = () => {
        const items: any[] = [];
        const tasksByEvent: Record<string, any[]> = {};

        tasks.forEach((t) => {
            if (t.eventId) {
                if (!tasksByEvent[t.eventId]) {
                    tasksByEvent[t.eventId] = [];
                }
                tasksByEvent[t.eventId].push(t);
            }
        });

        events.forEach((event) => {
            items.push({
                type: 'event',
                date: new Date(event.eventDate),
                event,
                tasks: tasksByEvent[event.id] || [],
            });
        });

        tasks
            .filter((t) => !t.eventId)
            .forEach((task) => {
                items.push({
                    type: 'task',
                    date: new Date(task.dueDate || task.createdAt),
                    task,
                });
            });

        items.sort((a, b) => b.date.getTime() - a.date.getTime());
        return items;
    };

    const timeline = buildTimeline();

    const filteredTimeline = timeline.filter((item) => {
        if (filter === 'EVENT') return item.type === 'event';
        if (filter === 'TASK') return item.type === 'task';
        return true;
    });

    const handleFilterChange = (f: 'ALL' | 'EVENT' | 'TASK') => {
        setFilter(f);
        setExpandedId(null); // 🔥 reset all cards
    };

    const handleAddTask = () => {
        TaskService.createTask(id as string, {
            title: 'New Task',
            status: 'OPEN',
        });
        loadData();
    };

    const handleAddEvent = () => {
  const newId = EventService.createEvent(id as string, {
    content: 'New Event',
    type: 'GENERAL',
    eventDate: new Date().toISOString(),
  });

  setExpandedId(`event_${newId}`); // 🔥 THIS is the real fix
  loadData();
};

    if (!caseData) return <Text>Loading...</Text>;

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={filteredTimeline}
                keyExtractor={(_, i) => i.toString()}
                ListHeaderComponent={<>
                    <CaseHeader caseData={caseData} onUpdate={loadData} />
                    <View
                        style={{
                            flexDirection: 'row',
                            marginBottom: 10,
                            gap: 10,
                        }}
                    >
                        {['ALL', 'EVENT', 'TASK'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => handleFilterChange(f as any)}
                                style={{
                                    paddingVertical: 6,
                                    paddingHorizontal: 12,
                                    borderRadius: 20,
                                    backgroundColor: filter === f ? '#000' : '#eee',
                                }}
                            >
                                <Text style={{ color: filter === f ? '#fff' : '#000' }}>
                                    {f === 'ALL' ? 'All' : f === 'EVENT' ? 'Events' : 'Tasks'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View></>

                }
                renderItem={({ item, index }) => (
                    <TimelineItem
                        item={item}
                        index={index}
                        onUpdate={loadData}
                        expandedId={expandedId}
                        setExpandedId={setExpandedId}
                    />
                )}
                contentContainerStyle={{ padding: 16 }}
            />

            <AddButton
                onAddTask={handleAddTask}
                onAddEvent={handleAddEvent}
            />
        </View>
    );
}