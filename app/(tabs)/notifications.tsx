import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { NotificationRepository } from '@/repositories/notification.repository';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = () => {
    const data = NotificationRepository.getAll();
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = (id: string) => {
    NotificationRepository.markAsRead(id);
    loadNotifications();
  };

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        onPress={() => markRead(item.id)}
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: '#eee',
          backgroundColor: item.read ? '#fff' : '#eef6ff',
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
        <Text>{item.message}</Text>

        <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>

        {!item.read && (
          <Text style={{ color: 'blue', marginTop: 4 }}>Unread</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!notifications.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No notifications yet</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}