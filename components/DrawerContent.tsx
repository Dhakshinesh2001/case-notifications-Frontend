import { View, Text, TouchableOpacity } from 'react-native';
import { useOrg } from '../hooks/useOrg';
import { SyncService } from '../features/sync/sync.service';

export const DrawerContent = ({ navigation }: any) => {
  const { orgId, setOrgId } = useOrg();

  const orgs = [
    { id: 'org1', name: 'My Firm' },
    { id: 'org2', name: 'Second Org' },
  ];

  const switchOrg = async (id: string) => {
    await setOrgId(id);
    await SyncService.syncAll();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold' }}>Organization</Text>

      {orgs.map((org) => (
        <TouchableOpacity
          key={org.id}
          onPress={() => switchOrg(org.id)}
        >
          <Text style={{
            padding: 8,
            backgroundColor: org.id === orgId ? '#ddd' : 'transparent'
          }}>
            {org.name}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={{ marginTop: 20 }}>
        <TouchableOpacity onPress={() => navigation.navigate('cases')}>
          <Text>📁 Cases</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('home')}>
          <Text>🏠 Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('account')}>
          <Text>👤 Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};