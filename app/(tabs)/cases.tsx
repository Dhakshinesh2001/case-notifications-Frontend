import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';

import { CaseService } from '@/features/case/case.service';
import { SyncService } from '@/features/sync/sync.service';

import CaseCard from '../../components/CaseCard';

import { subscribeOrg } from '../../api/org';

import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type Case = any;

export default function CasesScreen() {
  const [cases, setCases] = useState<Case[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);

    await SyncService.syncAll();
    loadCases();

    setRefreshing(false);
  };

  // 📥 Load from local DB
  const loadCases = () => {
    const data = CaseService.getCases();
    setCases(data);
  };

  // 🔽 Toggle expand
  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 🚀 Initial load (local-first + sync)
  useEffect(() => {
    loadInitial();




  const unsubscribe = subscribeOrg(() => {
    console.log("Org changed → reload cases");

    loadCases(); // 🔥 reload UI
  });

  return unsubscribe;

  }, []);

  useFocusEffect(
  useCallback(() => {
    loadCases();
  }, [])
);

  const loadInitial = async () => {
    setLoading(true);

    loadCases(); // ✅ instant local

    await SyncService.syncAll(); // 🔄 backend sync

    loadCases(); // 🔁 refresh UI

    setLoading(false);
  };

  // 🧱 Render each case
  const renderCase = ({ item }: { item: Case }) => {
    return (
      <CaseCard
        item={item}
        isOpen={expanded[item.id]}
        onToggle={() => toggleExpand(item.id)}
      />
    );
  };

  // ⏳ Loading state
  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading cases...</Text>
      </View>
    );
  }

  // 📭 Empty state
  if (!cases.length) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          No cases yet
        </Text>

        <Text>Create your first case to get started</Text>
        <TouchableOpacity
    onPress={() => router.push('/case/create')}
    style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#000',
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    }}
  >
    <Text style={{ color: '#fff', fontSize: 28 }}>+</Text>
  </TouchableOpacity>
      </View>
    );
  }

  // 📋 List
  return (

   <View style={{ flex: 1 }}>
  <FlatList
    data={cases}
    keyExtractor={(item) => item.id}
    renderItem={renderCase}
    contentContainerStyle={{ padding: 12 }}
    refreshing={refreshing}
    onRefresh={onRefresh}
  />

  {/* ➕ FLOATING BUTTON */}
  <TouchableOpacity
    onPress={() => router.push('/case/create')}
    style={{
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#000',
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
    }}
  >
    <Text style={{ color: '#fff', fontSize: 28 }}>+</Text>
  </TouchableOpacity>
</View>
  );
}