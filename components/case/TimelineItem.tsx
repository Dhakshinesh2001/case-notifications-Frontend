import { View } from 'react-native';
import EventCard from './EventCard';

export default function TimelineItem({
  item,
  index,
  expandedId,
  setExpandedId,
  onAddTask,
  updateTaskLocal,
  replaceTempTask,
  updateEventLocal,
  replaceTempEvent,
}: any) {
  const id = `event_${item.event.id}`;
  const isOpen = expandedId === id;
  const isActive = index === 0;

  return (
    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
      <View style={{ width: 24, alignItems: 'center' }}>
        <View style={{ width: 2, flex: 1, backgroundColor: '#ccc' }} />
        <View
          style={{
            width: isActive ? 14 : 10,
            height: isActive ? 14 : 10,
            borderRadius: 7,
            backgroundColor: isActive ? '#000' : '#aaa',
          }}
        />
        <View style={{ width: 2, flex: 1, backgroundColor: '#ccc', opacity: 0.4 }} />
      </View>

      <View style={{ flex: 1 }}>
        <EventCard
          event={item.event}
          tasks={item.tasks}
          isOpen={isOpen}
          onToggle={() =>
            setExpandedId(isOpen ? null : id)
          }
          isHighlighted={isActive}

          // 🔥 FIXED PROP FLOW
          onAddTask={onAddTask}
          updateTaskLocal={updateTaskLocal}
          replaceTempTask={replaceTempTask}
          updateEventLocal={updateEventLocal}
          replaceTempEvent={replaceTempEvent}
        />
      </View>
    </View>
  );
}