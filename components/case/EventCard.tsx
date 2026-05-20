import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';

import EditableField from '@/components/case/EditableField';
import { EventService } from '@/features/event/event.service';
import TaskCard from './TaskCard';
import { useDateTimePicker } from '@/hooks/useDateTimePicker';

export default function EventCard({
  event,
  tasks,
  isOpen,
  onToggle,
  isHighlighted,
  onAddTask,
  updateEventLocal,
  replaceTempEvent,
  updateTaskLocal,
  replaceTempTask,
}: any) {
  const [eventDate, setEventDate] = useState<Date | null>(
    event.eventDate ? new Date(event.eventDate) : null
  );

  const { open } = useDateTimePicker();

  /**
   * 🔥 SINGLE SOURCE OF TRUTH
   *
   * Handles:
   * - temp event creation
   * - existing event updates
   * - optimistic local updates
   */
  const persistEvent = async ({
    content,
    date,
  }: {
    content?: string;
    date?: Date | null;
  }) => {
    const finalContent =
      content ?? event.content ?? '';

    const finalDate =
      date ?? eventDate ?? new Date();

    // 🔥 optimistic local update
    updateEventLocal(event.id, {
      content: finalContent,
      eventDate: finalDate.toISOString(),
    });

    /**
     * 🔥 TEMP EVENT CREATION
     */
    if (event.isTemp) {
      // don't create empty temp events
      if (!finalContent.trim()) return;

      try {
        const createdEvent =
          await EventService.createEvent(event.caseId, {
            content: finalContent,
            type: 'GENERAL',
            eventDate: finalDate.toISOString(),
          });

        if (!createdEvent) return;

        replaceTempEvent(event.id, createdEvent);
      } catch (e) {
        console.error('Event create failed', e);
      }

      return;
    }

    /**
     * 🔥 EXISTING EVENT UPDATE
     */
    try {
      await EventService.updateEvent(event.id, {
        content: finalContent,
        eventDate: finalDate.toISOString(),
      });
    } catch (e) {
      console.error('Event update failed', e);
    }
  };

  /**
   * 🔥 CONTENT SAVE
   */
  const saveContent = async (content: string) => {
    await persistEvent({
      content,
    });
  };

  /**
   * 🔥 DATE PICKER
   */
  const openDatePicker = () => {
    open({
      value: eventDate || new Date(),
      mode: 'datetime',

      onChange: async (date) => {
        if (!date) return;

        setEventDate(date);

        await persistEvent({
          date,
        });
      },
    });
  };

  /**
   * 🔥 ADD TEMP TASK
   */
  const handleAddTask = () => {
    if (!onAddTask) return;

    const tempTask = {
  id: `temp_task_${Date.now()}`,
  title: '',
  status: 'OPEN',

  isTemp: true,

  caseId: event.caseId,
  eventId: event.id,

  assignedUserIds: [],

  createdAt: new Date().toISOString(),
};

    onAddTask(tempTask);
  };

  return (
    <View
      style={{
        padding: 12,
        borderRadius: 10,
        backgroundColor: isHighlighted
          ? '#f5f7ff'
          : '#f5f5f5',
        borderLeftWidth: isHighlighted ? 4 : 0,
        borderLeftColor: '#4f46e5',
      }}
    >
      {/* 🔹 HEADER */}
      <TouchableOpacity
        onPress={() => {
          LayoutAnimation.configureNext(
            LayoutAnimation.Presets.easeInEaseOut
          );

          onToggle();
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>
          {event.content || 'New Event'}
        </Text>
      </TouchableOpacity>

      {/* 🔹 BODY */}
      {isOpen && (
        <View style={{ marginTop: 10 }}>
          <EditableField
            label="Content"
            value={event.content}
            onSave={saveContent}
            autoFocus={event.isTemp}
          />

          <TouchableOpacity
            onPress={openDatePicker}
            style={{
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            <Text>
              {eventDate
                ? eventDate.toLocaleString()
                : 'Pick date'}
            </Text>
          </TouchableOpacity>

          {/* 🔹 TASKS */}
          {tasks
            ?.filter(Boolean)
            .map((task: any) => (
              <TaskCard
                key={task.id}
                task={task}
                updateTaskLocal={updateTaskLocal}
                replaceTempTask={replaceTempTask}
              />
            ))}

          {/* 🔹 ADD TASK */}
          <TouchableOpacity
            onPress={handleAddTask}
            style={{
              marginTop: 10,
            }}
          >
            <Text>+ Add Task</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}