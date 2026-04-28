import { View, Text } from 'react-native';
import TaskCard from './TaskCard';

export default function LinkedTaskGroup({ tasks }: any) {
  return (
    <View style={{ marginLeft: 10, marginTop: 6 }}>
      <Text style={{ fontSize: 12, color: 'gray' }}>
        Related Tasks
      </Text>

      {tasks.map((task: any) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </View>
  );
}