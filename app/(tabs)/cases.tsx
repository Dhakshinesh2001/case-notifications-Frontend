import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

import { CaseService } from '@/features/case/case.service';
import CaseCard from '../../components/CaseCard';

import { router, useFocusEffect } from 'expo-router';
import { useOrg } from '@/providers/OrgProvider';

type Case = any;

export default function CasesScreen() {
  const { orgId } = useOrg(); // 🔥 NEW

  const [cases, setCases] = useState<Case[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📥 Load from local DB
  const loadCases = () => {
    const data = CaseService.getCases();
    setCases(data);
  };

  // 🔄 Pull to refresh (optional sync)
  const onRefresh = async () => {
    setRefreshing(true);

    // Optional: keep if you want manual refresh
    // await SyncService.syncAll();

    loadCases();

    setRefreshing(false);
  };

  // 🔽 Toggle expand
  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 🚀 Initial load + org change
  useEffect(() => {
    if (!orgId) return;

    console.log("Cases reload → org changed:", orgId);

    setLoading(true);

    loadCases();

    setLoading(false);
  }, [orgId]); // 🔥 KEY CHANGE

  // 🔁 Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadCases();
    }, [orgId])
  );

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

      {/* ➕ Floating Button */}
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