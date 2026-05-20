import { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import EditableField from '@/components/case/EditableField';

import { TaskService } from '@/features/task/task.service';

import { useDateTimePicker } from '@/hooks/useDateTimePicker';

import MultiSelect from 'react-native-sectioned-multi-select';

import { userRepository } from '@/repositories/user.repository';
import { orgRepository } from '@/repositories/org.repository';

export default function TaskCard({
  task,
  updateTaskLocal,
  replaceTempTask,
}: any) {
  const isTemp = task.isTemp;

  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate) : null
  );

  const [assignedUserIds, setAssignedUserIds] =
    useState<string[]>(
      task.assignedUserIds || []
    );

  const { open } = useDateTimePicker();

  const currentOrg = orgRepository.currentOrg();
    console.log("COCOCO:::",currentOrg);
  const orgUsers = 
  // useMemo(() => {
  //   if (!currentOrg?.id) return [];

  //   return 
    userRepository.getOrgUsers(
      currentOrg.id
    );
  // }, [currentOrg?.id]);
  console.log("ORGORGUSERSUSERS:",orgUsers);

  /**
   * 🔥 SAVE TASK
   */
  const saveTask = async (title: string) => {
    if (!title?.trim()) return;

    /**
     * 🔥 CREATE TEMP TASK
     */
    if (isTemp) {
      try {
        const newTask =
          TaskService.createTask(
            task.caseId,
            {
              title,
              status: 'OPEN',

              dueDate: dueDate
                ? dueDate.toISOString()
                : null,

              eventId: task.eventId,

              assignedUserIds,
            }
          );

        if (!newTask) return;

        replaceTempTask(
          task.id,
          newTask
        );
      } catch (e) {
        console.error(
          'Task create failed',
          e
        );
      }

      return;
    }

    /**
     * 🔥 OPTIMISTIC UPDATE
     */
    updateTaskLocal(task.id, {
      title,
    });

    /**
     * 🔥 BACKEND UPDATE
     */
    try {
      await TaskService.updateTask(
        task.id,
        {
          title,
        }
      );
    } catch (e) {
      console.error(
        'Task update failed',
        e
      );
    }
  };

  /**
   * 🔥 DATE PICKER
   */
  const openDatePicker = () => {
    open({
      value: dueDate || new Date(),

      mode: 'date',

      onChange: (date) => {
        if (!date) return;

        setDueDate(date);

        updateTaskLocal(task.id, {
          dueDate:
            date.toISOString(),
        });

        TaskService.updateTask(
          task.id,
          {
            dueDate:
              date.toISOString(),
          }
        );
      },
    });
  };

  /**
   * 🔥 ASSIGN USERS
   */
  const updateAssignments = (
    ids: string[]
  ) => {
    setAssignedUserIds(ids);

    /**
     * 🔥 OPTIMISTIC UPDATE
     */
    updateTaskLocal(task.id, {
      assignedUserIds: ids,
    });

    /**
     * 🔥 BACKEND UPDATE
     */
    TaskService.updateTask(
      task.id,
      {
        assignedUserIds: ids,
      }
    );
  };

  return (
    <View style={{ marginTop: 10 }}>
      {/* 🔹 TITLE */}
      <EditableField
        label="Title"
        value={task.title}
        onSave={saveTask}
      />

      {/* 🔹 DUE DATE */}
      <TouchableOpacity
        onPress={openDatePicker}
      >
        <Text>
          {dueDate
            ? dueDate.toLocaleDateString()
            : 'Set due date'}
        </Text>
      </TouchableOpacity>

      {/* 🔹 ASSIGN USERS */}
      <View style={{ marginTop: 12 }}>
        <MultiSelect
  IconRenderer={MaterialIcons as any}
  items={[
    {
      id: 'users',
      name: 'Users',

      children: orgUsers.map(
        (u: any) => ({
          id: u.id,
          name: u.name,
        })
      ),
    },
  ]}
  uniqueKey="id"
  subKey="children"
  selectText="Assign Users"
  showDropDowns={false}
  readOnlyHeadings
  onSelectedItemsChange={
    updateAssignments
  }
  selectedItems={
    assignedUserIds
  }
/>
      </View>

      {/* 🔹 ASSIGNED USER CHIPS */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: 8,
        }}
      >
        {orgUsers
          .filter((u: any) =>
            assignedUserIds.includes(
              u.id
            )
          )
          .map((u: any) => (
            <View
              key={u.id}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,

                borderRadius: 999,

                backgroundColor:
                  '#ddd',

                marginRight: 6,
                marginBottom: 6,
              }}
            >
              <Text>
                {u.name}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );
}