import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import EditableField from '@/components/case/EditableField';
import { EventService } from '@/features/event/event.service';
import TaskCard from './TaskCard';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EventCard({
  event,
  tasks,
  onUpdate,
  isOpen,
  onToggle,
  expandedId,
  setExpandedId,
}: any) {
  const isTemp = event.isTemp;
  const [eventDate, setEventDate] = useState(new Date(event.eventDate || Date.now()));
  const [showPicker, setShowPicker] = useState(false);

  const update = (field: string, value: any) => {
    if (isTemp) {
      if (field === 'content' && !value?.trim()) return;

      EventService.createEvent(event.caseId, {
        content: field === 'content' ? value : 'New Event',
        type: field === 'type' ? value : 'GENERAL',
        eventDate: field === 'eventDate' ? value : eventDate.toISOString(),
      });

      onUpdate?.();
      return;
    }

    const payload = field === 'eventDate' ? value : value;
    EventService.updateEvent(event.id, { [field]: payload });
    onUpdate?.();
  };

  const onDateChange = (e: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEventDate(selectedDate);
      update('eventDate', selectedDate.toISOString());
    }
  };

  return (
    <View
      style={{
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
      }}
    >
      <TouchableOpacity onPress={onToggle}>
        <Text style={{ fontWeight: 'bold' }}>
          {event.content || 'New Event'}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          📅 {eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={{ marginTop: 10 }}>
          <EditableField
            label="Content"
            value={event.content}
            onSave={(v: string) => update('content', v)}
            autoFocus={isTemp}
          />

          <TouchableOpacity 
            onPress={() => setShowPicker(true)}
            style={{ marginBottom: 15 }}
          >
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Event Date</Text>
            <View style={{ padding: 8, backgroundColor: '#fff', borderRadius: 4, borderWidth: 1, borderColor: '#ddd' }}>
              <Text>{eventDate.toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={eventDate}
              mode="datetime"
              display="default"
              onChange={onDateChange}
            />
          )}

          <EditableField
            label="Type"
            value={event.type}
            onSave={(v: string) => update('type', v)}
          />

          <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Tasks</Text>

          {tasks?.length ? (
            tasks.map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdate}
                isOpen={expandedId === `task_${task.id}`}
                onToggle={() =>
                  setExpandedId(
                    expandedId === `task_${task.id}` ? null : `task_${task.id}`
                  )
                }
              />
            ))
          ) : (
            <Text style={{ color: '#888', marginTop: 4 }}>No tasks</Text>
          )}
        </View>
      )}
    </View>
  );
}