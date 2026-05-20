import { View, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';

export default function AddButton({ onAddTask, onAddEvent }: any) {
  // const [open, setOpen] = useState(false);

  return (
    <View style={{ position: 'absolute', bottom: 20, right: 20 }}>
        <View style={{ marginBottom: 10 }}>
          <TouchableOpacity onPress={onAddEvent}>
            <Text  style={{
          backgroundColor: '#000',
          paddingLeft:20,
          paddingTop: 15,
          width: 90,
          height: 50,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff'
        }}>
              + Event
            </Text>
          </TouchableOpacity>
        </View>
      {/* )} */}

      {/* <TouchableOpacity
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
      </TouchableOpacity> */}
    </View>
  );
}