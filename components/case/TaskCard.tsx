import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import EditableField from '@/components/case/EditableField';
import { TaskService } from '@/features/task/task.service';
import DateTimePicker from '@react-native-community/datetimepicker';

const CURRENT_USER_ID = 'me';

export default function TaskCard({ task, onUpdate, isOpen, onToggle }: any) {
  const isTemp = task.isTemp;
  const isMine = task.assignedTo === CURRENT_USER_ID;
  
  const [dueDate, setDueDate] = useState<Date | null>(task.dueDate ? new Date(task.dueDate) : null);
  const [showPicker, setShowPicker] = useState(false);

  const update = (field: string, value: any) => {
    if (isTemp) {
      if (field === 'title' && !value?.trim()) return;

      TaskService.createTask(task.caseId, {
        title: field === 'title' ? value : 'New Task',
        status: 'OPEN',
        dueDate: field === 'dueDate' ? value : (dueDate ? dueDate.toISOString() : null),
      });

      onUpdate?.();
      return;
    }

    TaskService.updateTask(task.id, { [field]: value });
    onUpdate?.();
  };

  const onDateChange = (e: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
      update('dueDate', selectedDate.toISOString());
    }
  };

  const clearDate = () => {
    setDueDate(null);
    update('dueDate', null);
  };

  const updateStatus = (status: string) => {
    TaskService.updateTaskStatus(task.id, status);
    onUpdate?.();
  };

  return (
    <View
      style={{
        marginTop: 8,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee'
      }}
    >
      <TouchableOpacity onPress={onToggle}>
        <Text style={{ fontWeight: '500' }}>{task.title || 'New Task'}</Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          {dueDate ? `🕒 Due: ${dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : 'No due date'} • {task.status}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={{ marginTop: 10 }}>
          <EditableField
            label="Title"
            value={task.title}
            onSave={(v: string) => update('title', v)}
            autoFocus={isTemp}
          />

          <TouchableOpacity 
            onPress={() => setShowPicker(true)}
            style={{ marginBottom: 10 }}
          >
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Due Date</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, padding: 8, backgroundColor: '#f9f9f9', borderRadius: 4, borderWidth: 1, borderColor: '#ddd' }}>
                    <Text>{dueDate ? dueDate.toLocaleString() : 'Set due date...'}</Text>
                </View>
                {dueDate && (
                    <TouchableOpacity onPress={clearDate} style={{ padding: 8 }}>
                        <Text style={{ color: 'red', fontSize: 12 }}>Clear</Text>
                    </TouchableOpacity>
                )}
            </View>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <EditableField
            label="Description"
            value={task.description}
            onSave={(v: string) => update('description', v)}
            multiline
          />

          <EditableField
            label="Priority"
            value={task.priority}
            onSave={(v: string) => update('priority', v)}
          />

          {isMine && (
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              {task.status === 'OPEN' && (
                <TouchableOpacity onPress={() => updateStatus('IN_PROGRESS')}>
                  <Text style={{ color: 'blue', marginRight: 12 }}>Accept</Text>
                </TouchableOpacity>
              )}
              {task.status !== 'DONE' && (
                <TouchableOpacity onPress={() => updateStatus('DONE')}>
                  <Text style={{ color: 'green' }}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}