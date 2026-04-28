// components/case/TimelineItem.tsx
import { View } from 'react-native';
import EventCard from './EventCard';
import TaskCard from './TaskCard';

export default function TimelineItem({
  item,
  index,
  onUpdate,
  expandedId,
  setExpandedId,
}: any) {
  const id =
    item.type === 'event'
      ? `event_${item.event.id}`
      : `task_${item.task.id}`;

  const isOpen = expandedId === id;

  const toggle = () => {
    setExpandedId(isOpen ? null : id);
  };

  const isLeft = index % 2 === 0;

  return (
    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
      {/* LEFT */}
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {isLeft && (
          <View style={{ width: '90%' }}>
            {item.type === 'event' ? (
              <EventCard
                event={item.event}
                tasks={item.tasks}
                onUpdate={onUpdate}
                isOpen={isOpen}
                onToggle={toggle}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            ) : (
              <TaskCard
                task={item.task}
                onUpdate={onUpdate}
                isOpen={isOpen}
                onToggle={toggle}
              />
            )}
          </View>
        )}
      </View>

      {/* CENTER */}
      <View style={{ width: 40, alignItems: 'center' }}>
        <View style={{ width: 2, flex: 1, backgroundColor: '#ccc' }} />
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor:
              item.type === 'event' ? '#000' : '#007bff',
          }}
        />
        <View style={{ width: 2, flex: 1, backgroundColor: '#ccc' }} />
      </View>

      {/* RIGHT */}
      <View style={{ flex: 1 }}>
        {!isLeft && (
          <View style={{ width: '90%' }}>
            {item.type === 'event' ? (
              <EventCard
                event={item.event}
                tasks={item.tasks}
                onUpdate={onUpdate}
                isOpen={isOpen}
                onToggle={toggle}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            ) : (
              <TaskCard
                task={item.task}
                onUpdate={onUpdate}
                isOpen={isOpen}
                onToggle={toggle}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}