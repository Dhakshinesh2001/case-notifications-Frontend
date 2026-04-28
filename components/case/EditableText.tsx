// components/common/EditableText.tsx
import { useState } from 'react';
import { Text, TextInput } from 'react-native';

export default function EditableText({
  value,
  onSave,
  style,
  multiline = false,
}: any) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  const handleSave = () => {
    setEditing(false);
    if (text !== value) {
      onSave(text);
    }
  };

  if (editing) {
    return (
      <TextInput
        value={text}
        onChangeText={setText}
        autoFocus
        multiline={multiline}
        onBlur={handleSave}
        style={[
          style,
          {
            padding: 0, // 👈 critical: removes jump
            margin: 0,
          },
        ]}
      />
    );
  }

  return (
    <Text onPress={() => setEditing(true)} style={style}>
      {value || '—'}
    </Text>
  );
}