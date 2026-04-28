// components/common/EditableField.tsx
import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

export default function EditableField({
  label,
  value,
  onSave,
  multiline = false,
  style,
}: any) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value || '');

  const handleSave = () => {
    setEditing(false);
    if (text !== value) {
      onSave(text);
    }
  };

  return (
    <View style={{ marginTop: 12 }}>
      {/* 🔹 LABEL */}
      <Text
        style={{
          fontSize: 12,
          color: '#888',
          marginBottom: 2,
        }}
      >
        {label}
      </Text>

      {/* 🔹 VALUE / INPUT */}
      {editing ? (
        <TextInput
          value={text}
          onChangeText={setText}
          autoFocus
          multiline={multiline}
          onBlur={handleSave}
          style={[
            style,
            {
              padding: 0,
              margin: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#000', // 👈 only when focused
            },
          ]}
        />
      ) : (
        <Text
          onPress={() => setEditing(true)}
          style={[
            style,
            {
              paddingVertical: 2,
            },
          ]}
        >
          {value || '—'}
        </Text>
      )}
    </View>
  );
}