import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { tokenCache } from '@clerk/clerk-expo/token-cache';


import { OrgService } from '../../features/org/org.service';
import { AuthService } from '../../features/auth/auth.service';
import { orgRepository } from '@/repositories/org.repository';

import { useAuth, useOAuth, useUser } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import {
  // TextInput,
  Alert,
} from 'react-native';

import { InviteService } from '@/features/invite/invite.service';
import { Share } from 'react-native';
import { userRepository } from '@/repositories/user.repository';
import { UserAPI } from '@/api/user.api';
import { OrgAPI } from '@/api/org.api';
import { getDB } from '@/db/provider';

WebBrowser.maybeCompleteAuthSession();

export default function Account() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const [org, setOrg] = useState<any | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [newOrgName, setNewOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] =
    useState('');
  const handleCreateInvite = async () => {
    try {
      setInviteLoading(true);

      const res = await InviteService.createInvite(
        inviteEmail,
        inviteRole
      );

      // const inviteLink = `case-manager-app://invite?token=${res.token}`;
      const inviteLink = res.token;
      Alert.alert(
        'Invite Created',
        'Share this invite link with the member.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Share',
            onPress: async () => {
              try {
                await Share.share({
                  message:
                    `Join our organization on Case Manager:\n\n${inviteLink}`,
                });
              } catch (err) {
                console.log(err);
              }
            },
          },
        ]
      );

      setInviteEmail('');

    } catch (err) {
      console.log(err);

      Alert.alert(
        'Error',
        'Failed to send invite.'
      );
    }

    setInviteLoading(false);
  };

  const [inviteRole, setInviteRole] =
    useState('JUNIOR');

  const [inviteLoading, setInviteLoading] =
    useState(false);

  const redirectUrl = Linking.createURL('/oauth-callback');

  const { startOAuthFlow } = useOAuth({
    strategy: 'oauth_google',
  });

  /**
   * 🔐 SIGN IN
   */
  const handleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
      }
      // console.log('1');

      const userData = await UserAPI.getUserData();
      // console.log('2','userDATA:', userData);

      userRepository.setUser({ id: userData.id, email: userData.email, role: userData.role, orgId: userData.orgId, name: userData.name || '' });
      // console.log('3');
      // if(userData.orgId){
      //   console.log('4');
      // const orgData = await OrgAPI.getOrgById(userData.orgId);
      // await OrgService.insertOrgFromBackend(orgData);
      // console.log('5:', orgData);
      // setOrg(orgData);
       
    // }
    // console.log('6:',userData.orgId);
    //   // setOrg(userData.orgId);
    //   console.log({
    //   isLoaded,
    //   isSignedIn,
    //   org,
    // },"12");
    // console.log('7');

    } catch (err) {
      console.log('OAuth error', err);
    }
  };

  /**
   * 🚪 SIGN OUT
   */
  const handleSignOut = async () => {
    await AuthService.signOut();
    await signOut();
    orgRepository.clearOrg(); // 🔥 important
    setOrg(null);
  };

  /**
   * 📥 LOAD LOCAL ORG
   */
  useEffect(() => {
    const check = async () => {
      const token = await tokenCache?.getToken('clerk');

      console.log('TOKEN CACHE:', token);
    };

    check();
  }, []);
  useEffect(() => {
    const localOrg = orgRepository.getOrg();
    setOrg(localOrg);
    console.log({
      isLoaded,
      isSignedIn,
      org
    });
  }, []);
  useEffect(() => {
  const loadUserData = async () => {
    if (!isSignedIn) return;

    try {
      const userData =
        await UserAPI.getUserData();

      console.log(
        'USER DATA:',
        userData
      );

      userRepository.setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        orgId: userData.orgId,
        name: userData.name || '',
      });

      if (userData.orgId) {
        const orgData =
          await OrgAPI.getOrgById(
            userData.orgId
          );

        console.log(
          'ORG DATA:',
          orgData
        );

        await OrgService.switchOrg(
          orgData
        );

        setOrg(orgData);
      }
    } catch (err) {
      console.log(
        'LOAD USER DATA ERROR',
        err
      );
    }
  };

  loadUserData();
}, [isSignedIn]);

  /**
   * 🔄 JOIN ORG
   */
  const handleJoinOrg = async () => {
    if (!inviteCode.trim()) return;

    console.log("inside join ORGORGORGORG");

    try {
      setLoading(true);

      const res = await OrgService.joinOrg(inviteCode);

      // Expecting:
      // { org: {...}, role: "ADMIN" }

      const data = res;

      const saved = {
        id: data.id,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      // orgRepository.saveOrg(saved);
      console.log("ORGaijhdijabij:",saved);
      // await OrgService.switchOrg(data.id);
      setOrg(saved);
      console.log("10--------------------01::::::::::::::", org);
      // await OrgService.switchOrg(data.id);
      setInviteCode('');
      
    } catch (err) {
      console.log('Join org failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;

    try {
      setLoading(true);

      const res = await OrgService.createOrg(newOrgName);

      // Expecting:
      // { org: {...}, role: "ADMIN" }

      const data = res;

      const saved = {
        id: data.id,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      // orgRepository.saveOrg(saved);

      setOrg(saved);
      OrgService.switchOrg(saved);
      // setInviteCode('');
    } catch (err) {
      console.log('create org failed', err);
    } finally {
      setLoading(false);
    }
  };
  // const [seconds, setSeconds] = useState(0);
  // useEffect(() => {
  //   // 1. Set up the interval to run every 5000ms (5 seconds)
  //   const intervalId = setInterval(() => {
  //     console.log('This runs every 5 seconds');
  //     const db = getDB();
  //     console.log("ALL ORGS:::", db.getAllSync("SELECT * FROM orgs"));
  //     console.log("ALL ORGS:::", db.runSync("DELETE  FROM orgs"));
  //     // Example action: updating state
  //     setSeconds((prevSeconds) => prevSeconds + 5);
  //   }, 5000);

  //   // 2. Return a cleanup function to clear the interval
  //   return () => {
  //     clearInterval(intervalId);
  //     console.log('Interval cleared!');
  //   };
  // }, []);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }


  /**
   * 🔓 STATE 1: NOT SIGNED IN
   */
  if (!isSignedIn) {
    return (
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Offline Mode
        </Text>

        <Text style={{ marginBottom: 20 }}>
          Sign in to enable sync, backup, and multi-device access.
        </Text>

        <TouchableOpacity
          onPress={handleSignIn}
          style={{
            backgroundColor: '#000',
            padding: 14,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * 🟡 STATE 2: SIGNED IN, NO ORG
   */
  if (isSignedIn && !org) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>
          Account
        </Text>

        <Text style={{ marginBottom: 20, color: '#555' }}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Join Organization
        </Text>

        <TextInput
          placeholder="Enter invite code"
          value={inviteCode}
          onChangeText={setInviteCode}
          style={{
            borderWidth: 1,
            borderRadius: 6,
            padding: 10,
            marginBottom: 10,
          }}
        />

        <TouchableOpacity onPress={handleJoinOrg}>
          <Text style={{ color: 'blue' }}>
            {loading ? 'Joining...' : 'Join'}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Create Organization
        </Text>

        <TextInput
          placeholder="Enter Org Name"
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
          <Text style={{ color: 'blue' }}>
            {loading ? 'Creating' : 'Create'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          style={{ marginTop: 30 }}
        >
          <Text style={{ color: 'red' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * 🔵 STATE 3: SIGNED IN + ORG
   */
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 6 }}>
        Account
      </Text>

      <Text style={{ marginBottom: 12, color: '#555' }}>
        {user?.primaryEmailAddress?.emailAddress}
      </Text>

      <View
        style={{
          padding: 16,
          borderWidth: 1,
          borderRadius: 10,
          borderColor: '#ccc',
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
          {org.name}
        </Text>

        <Text style={{ color: '#666', marginTop: 4 }}>
          Role: {org.role}
        </Text>
      </View>

      <TouchableOpacity onPress={handleSignOut}>
        <Text style={{ color: 'red' }}>Sign Out</Text>
      </TouchableOpacity>

      <View
        style={{
          marginTop: 32,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 16,
          }}
        >
          Invite Member
        </Text>

        <TextInput
          value={inviteEmail}
          onChangeText={setInviteEmail}
          placeholder="Email address"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
          }}
        />

        <TouchableOpacity
          onPress={handleCreateInvite}
          disabled={inviteLoading}
          style={{
            backgroundColor: '#000',
            padding: 16,
            borderRadius: 12,
            opacity: inviteLoading ? 0.5 : 1,
          }}
        >
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {inviteLoading
              ? 'Sending Invite...'
              : 'Send Invite'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}