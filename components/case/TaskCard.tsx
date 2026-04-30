import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import EditableField from '@/components/case/EditableField';
import { TaskService } from '@/features/task/task.service';

const CURRENT_USER_ID = 'me';

export default function TaskCard({ task, onUpdate,isOpen,
  onToggle }: any) {
  const isNew = task.title === 'New Task';
  const isTemp = task.isTemp;
//   const [open, setOpen] = useState(isNew);

  const isMine = task.assignedTo === CURRENT_USER_ID;

  const update = (field: string, value: string) => {
  if (isTemp) {
    // 🔥 FIRST EDIT → CREATE REAL TASK
    if (!value?.trim()) return;

    const newId = TaskService.createTask(task.caseId, {
      title: value,
      status: 'OPEN',
    });

    onUpdate?.();
    return;
  }

  TaskService.updateTask(task.id, { [field]: value });
  onUpdate?.();
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
      }}
    >
      {/* HEADER (toggle only here) */}
      <TouchableOpacity onPress={onToggle}>
        <Text style={{ fontWeight: '500' }}>{task.title}</Text>
        <Text style={{ fontSize: 12, color: '#666' }}>
          {task.status}
        </Text>
      </TouchableOpacity>

      {(isOpen || isNew) && (
        <View style={{ marginTop: 10 }}>
          <EditableField
            label="Title"
            value={task.title}
            onSave={(v: string) => update('title', v)}
            autoFocus={isNew}
          />

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
                <TouchableOpacity
                  onPress={() => updateStatus('IN_PROGRESS')}
                >
                  <Text style={{ color: 'blue', marginRight: 12 }}>
                    Accept
                  </Text>
                </TouchableOpacity>
              )}

              {task.status !== 'DONE' && (
                <TouchableOpacity
                  onPress={() => updateStatus('DONE')}
                >
                  <Text style={{ color: 'green' }}>
                    Done
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}