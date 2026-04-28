import { View, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';

export default function AddButton({ onAddTask, onAddEvent }: any) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
      {open && (
        <View style={{ marginBottom: 10 }}>
          <TouchableOpacity onPress={onAddTask}>
            <Text style={{ backgroundColor: '#eee', padding: 8 }}>
              + Task
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onAddEvent}>
            <Text style={{ backgroundColor: '#eee', padding: 8 }}>
              + Event
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{
          backgroundColor: '#000',
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
}