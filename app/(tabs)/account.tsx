import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert
} from 'react-native';

import { OrgService } from '../../features/org/org.service';
import { AuthService } from '../../features/auth/auth.service';
import { orgRepository } from '@/repositories/org.repository';

export default function AccountScreen() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);

  /**
   * 📥 Load organizations
   */
  const loadOrgs = async () => {
    try {
      setLoading(true);
      const data = await OrgService.getOrgs();
      setOrgs(data || []);
    } catch (err) {
      console.log('Failed to load orgs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const data = orgRepository.getOrgs();
    setOrgs(data);
    loadOrgs();
  }, []);

  /**
   * 🔄 Switch org
   */
  const handleSwitchOrg = async (orgId: string) => {
     console.log("Switching to1:", orgId);

    setActiveOrgId(orgId);
     console.log("Switching to2:", orgId);

    try {
      await OrgService.switchOrg(orgId);
    } catch (err) {
      console.log('Switch org failed', err);
    }
  };

  /**
   * ➕ Create org
   */
  const handleCreateOrg = async () => {
    // Alert.alert("Create Org", "Button pressed");
  console.log("Create org pressed");
  
  // console.log("🔍 HTTPS TEST START");

  // try {
  //   const res = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
  //     method: 'GET',
  //   });

  //   console.log("⬅️ STATUS:", res.status);

  //   const text = await res.text();
  //   console.log("⬅️ RAW:", text);

  //   let data;
  //   try {
  //     data = JSON.parse(text);
  //   } catch {
  //     data = text;
  //   }

  //   console.log("✅ PARSED:", data);

  // } catch (err: any) {
  //   console.log("🚨 ERROR:", err.message);
  // }


  if (!newOrgName.trim()) return;

  try {
    const res = await OrgService.createOrg({ name: newOrgName });
    console.log("Create org response:", res);

    setNewOrgName('');
    loadOrgs();
  } catch (err) {
    console.log('Create org failed', err);
  }
};

  /**
   * 🚪 Sign out
   */
  const handleSignOut = async () => {
    await AuthService.signOut();
  };

  /**
   * 🎨 Render org item
   */
  const renderOrg = ({ item }: any) => {
    const isActive = activeOrgId === item.id;

    return (
      <View
        style={{
          padding: 12,
          marginBottom: 10,
          borderWidth: 1,
          borderRadius: 8,
          borderColor: isActive ? 'green' : '#ccc',
        }}
      >
        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>

        <Text style={{ color: '#666', marginBottom: 6 }}>
          Role: {item.role}
        </Text>

        <TouchableOpacity onPress={() => handleSwitchOrg(item.id)}>
          <Text style={{ color: 'blue' }}>
            {isActive ? 'Current' : 'Switch'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  useEffect(() => {
  if (orgs.length && !activeOrgId) {
    console.log("orgs:", orgs);
    handleSwitchOrg(orgs[0].id);
    console.log("orgs:", orgs);
  }
}, [orgs]);

  return (
    <View style={{ flex: 1, padding: 16 }}>

      {/* 🔹 HEADER */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Account
      </Text>

      {/* 🔹 ORG LIST */}
      {loading ? (
        <Text>Loading organizations...</Text>
      ) : (
        <FlatList
          data={orgs}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderOrg}
        />
      )}

      {/* 🔹 CREATE ORG */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>
          Create Organization
        </Text>

        <TextInput
          placeholder="Org name"
          value={newOrgName}
          onChangeText={setNewOrgName}
          style={{
            borderWidth: 1,
            borderRadius: 6,
            padding: 10,
            marginBottom: 10,
          }}
        />

        <TouchableOpacity onPress={handleCreateOrg}>
          <Text style={{ color: 'green' }}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 SIGN OUT */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{ marginTop: 30 }}
      >
        <Text style={{ color: 'red' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}