import { View, Text, TouchableOpacity } from 'react-native';
import { useOrg } from '@/providers/OrgProvider';
import { orgRepository } from '@/repositories/org.repository';

export const DrawerContent = ({ navigation }: any) => {
  const { orgId, switchOrg } = useOrg();

  // 🔥 Load orgs from DB (not hardcoded)
  const orgs = orgRepository.getOrgs();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
        Organization
      </Text>

      {orgs.map((org) => {
        const isActive = org.id === orgId;

        return (
          <TouchableOpacity
            key={org.id}
            onPress={() => switchOrg(org.id)} // 🔥 clean
          >
            <Text
              style={{
                padding: 10,
                borderRadius: 6,
                backgroundColor: isActive ? '#ddd' : 'transparent',
              }}
            >
              {org.name} {isActive ? '✓' : ''}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Navigation */}
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