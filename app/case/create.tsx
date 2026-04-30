import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';

import { CaseService } from '@/features/case/case.service';

export default function CreateCaseScreen() {
  const [title, setTitle] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [court, setCourt] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    console.log("create case clicked");
    CaseService.createCase({
      title,
      caseNumber,
      court,
      description,
      status: 'OPEN',
    });

    router.back(); // go back to cases list
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, padding: 16 }}
      behavior="padding"
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        Create Case
      </Text>

      {/* TITLE */}
      <Text style={{ marginTop: 16 }}>Title *</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Case title"
        style={{
          borderBottomWidth: 1,
          paddingVertical: 6,
        }}
      />

      {/* CASE NUMBER */}
      <Text style={{ marginTop: 16 }}>Case Number</Text>
      <TextInput
        value={caseNumber}
        onChangeText={setCaseNumber}
        placeholder="123/2026"
        style={{
          borderBottomWidth: 1,
          paddingVertical: 6,
        }}
      />

      {/* COURT */}
      <Text style={{ marginTop: 16 }}>Court</Text>
      <TextInput
        value={court}
        onChangeText={setCourt}
        placeholder="Supreme Court"
        style={{
          borderBottomWidth: 1,
          paddingVertical: 6,
        }}
      />

      {/* DESCRIPTION */}
      <Text style={{ marginTop: 16 }}>Description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Optional"
        multiline
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 8,
          marginTop: 6,
          minHeight: 80,
        }}
      />

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={handleCreate}
        style={{
          marginTop: 30,
          backgroundColor: '#000',
          padding: 14,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          Create Case
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}