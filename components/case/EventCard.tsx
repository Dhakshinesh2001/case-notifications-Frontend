import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import EditableField from '@/components/case/EditableField';
import { EventService } from '@/features/event/event.service';
import TaskCard from './TaskCard';

export default function EventCard({
  event,
  tasks,
  onUpdate,
  isOpen,
  onToggle,
  expandedId,
  setExpandedId,
}: any) {
  console.log("Ebent:",event);
  const isNew = event.content === 'New Event';
//   const [open, setOpen] = useState(isNew);

  const isTemp = event.isTemp;

const update = (field: string, value: string) => {
  if (isTemp) {
    if (!value?.trim()) return;

    

    const newId = EventService.createEvent(event.caseId, {
      content: value,
      type: 'GENERAL',
      eventDate: new Date().toISOString(),
    });

    onUpdate?.();
    return;
  }

  EventService.updateEvent(event.id, { [field]: value });
  onUpdate?.();
};

  return (
    <View
      style={{
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
      }}
    >
      {/* HEADER */}
      <TouchableOpacity onPress={onToggle}>
        <Text style={{ fontWeight: 'bold' }}>
          {event.content}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          {new Date(event.eventDate).toDateString()}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={{ marginTop: 10 }}>
          <EditableField
            label="Content"
            value={event.content}
            onSave={(v: string) => update('content', v)}
            autoFocus={isNew}
          />

          <EditableField
            label="Type"
            value={event.type}
            onSave={(v: string) => update('type', v)}
          />

          <Text style={{ marginTop: 10, fontWeight: 'bold' }}>
            Tasks
          </Text>

          {tasks?.length ? (
            tasks.map((task: any) => (
              <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              isOpen={expandedId === `task_${task.id}`}
              onToggle={() =>
                setExpandedId(
                  expandedId === `task_${task.id}`
                    ? null
                    : `task_${task.id}`
                )
              }
            />
            ))
          ) : (
            <Text style={{ color: '#888', marginTop: 4 }}>
              No tasks
            </Text>
          )}
        </View>
      )}
    </View>
  );
}