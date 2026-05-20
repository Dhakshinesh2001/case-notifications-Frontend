import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { CaseService } from '@/features/case/case.service';
import CaseCard from '../../components/CaseCard';

import { router, useFocusEffect } from 'expo-router';
// import { useOrg } from '@/providers/OrgProvider';
import { OrgService } from '@/features/org/org.service';
import { orgRepository } from '@/repositories/org.repository';

type Case = any;

type Section = {
  title: string;
  data: Case[];
  dateKey?: number | null;
};

export default function CasesScreen() {
  const currentOrg =
 orgRepository.currentOrg();

const orgId =
  currentOrg?.id || null;
  console.log('ORG ID:', orgId);

  const [cases, setCases] = useState<Case[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const listRef = useRef<SectionList>(null);

  // 📥 Load enriched cases
  const loadCases = () => {
    try {
    const data =
      CaseService.getCasesWithNextEvent();

    console.log(
      'CASES DATA:',
      data
    );

    setCases(data || []);
  } catch (err) {
    console.log(
      'LOAD CASES ERROR:',
      err
    );

    setCases([]);
  }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadCases();
    setRefreshing(false);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 🚀 Initial load
  useEffect(() => {
    if (!orgId) return;

    setLoading(true);
    console.log("before loadcases");
    loadCases();
    console.log("after loadcases");
    setLoading(false);
  }, [orgId]);

  useFocusEffect(
    useCallback(() => {
      loadCases();
    }, [orgId])
  );

  // 🔍 Search filter
  const filteredCases = useMemo(() => {
    if (!search.trim()) return cases;

    const q = search.toLowerCase();

    return cases.filter((c) => {
      return (
        c.title?.toLowerCase().includes(q) ||
        c.caseNumber?.toLowerCase().includes(q)
        // TODO: add client name later
      );
    });
  }, [cases, search]);

  // 📅 Build sections (core logic)
  const sections: Section[] = useMemo(() => {
    const map: Record<string, Section> = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const getLabel = (date: Date | null) => {
      if (!date) return 'No dates';

      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      if (d.getTime() === today.getTime()) return 'Today';
      if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';

      const diff =
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

      if (diff === 1) return 'Yesterday';

      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    };

    filteredCases.forEach((c) => {
      const date = c.nextEventDate
        ? new Date(c.nextEventDate)
        : null;

      const label = getLabel(date);
      const key = date
        ? new Date(date.setHours(0, 0, 0, 0)).getTime()
        : null;

      if (!map[label]) {
        map[label] = {
          title: label,
          data: [],
          dateKey: key,
        };
      }

      map[label].data.push(c);
    });

    let result = Object.values(map);

    // 🔽 Sort sections
    result.sort((a, b) => {
      if (a.dateKey === null) return 1;
      if (b.dateKey === null) return -1;
      return a.dateKey! - b.dateKey!;
    });

    // 🔽 Sort inside section
    result.forEach((section) => {
      section.data.sort((a, b) => {
        if (!a.nextEventDate) return 1;
        if (!b.nextEventDate) return -1;
        return (
          new Date(a.nextEventDate).getTime() -
          new Date(b.nextEventDate).getTime()
        );
      });
    });

    return result;
  }, [filteredCases]);

  // 📍 Auto scroll to Today
  useEffect(() => {
    const index = sections.findIndex((s) => s.title === 'Today');

    if (index !== -1 && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollToLocation({
          sectionIndex: index,
          itemIndex: 0,
          animated: true,
        });
      }, 300);
    }
  }, [sections]);

  const renderCase = ({ item }: { item: Case }) => {
    return (
      <CaseCard
        item={item}
        isOpen={expanded[item.id]}
        onToggle={() => toggleExpand(item.id)}
      />
    );
  };

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Loading cases...</Text>
      </View>
    );
  }

  if (!sections.length) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text>No matching cases</Text>
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
        <Text style={{ color: '#07461a', fontSize: 28 }}>+</Text>
      </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 🔍 Search */}
      <TextInput
        placeholder="Search by CNR, title..."
        value={search}
        onChangeText={setSearch}
        style={{
          margin: 12,
          padding: 10,
          borderRadius: 8,
          backgroundColor: '#eee',
        }}
      />

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderCase}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View
            style={{
              backgroundColor: '#f5f5f5',
              paddingVertical: 6,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>
              {section.title}
            </Text>
          </View>
        )}
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
        <Text style={{ color: '#07461a', fontSize: 28 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
  // return (<view><Text>FFFF</Text></view>)
}