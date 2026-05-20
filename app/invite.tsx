import { router, useLocalSearchParams } from 'expo-router';
import { useAuth, useOAuth } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';

import { InviteService } from '@/features/invite/invite.service';

WebBrowser.maybeCompleteAuthSession();

export default function InviteAcceptScreen() {
  const { token } = useLocalSearchParams();

  const { isSignedIn, isLoaded } = useAuth();

  const { startOAuthFlow } = useOAuth({
    strategy: 'oauth_google',
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * 🔐 Google SSO Sign-In
   */
  const handleSignIn = async () => {
    try {
      setError(null);

      await startOAuthFlow();
    } catch (err) {
      console.log('OAuth error', err);

      setError('Failed to sign in');
    }
  };

  /**
   * 📥 Accept invite + hydrate org
   */
  const acceptInvite = async () => {
    try {
      setLoading(true);

      setError(null);

      await InviteService.acceptInvite(
        token as string
      );

      // ✅ Redirect into app
      router.replace('/');

    } catch (err) {
      console.log(err);

      setError('Failed to join organization');
    }

    setLoading(false);
  };

  /**
   * 🚀 Auto-accept after auth
   */
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) return;

    if (!token) return;

    acceptInvite();
  }, [isLoaded, isSignedIn, token]);

  /**
   * ⏳ Clerk still loading
   */
  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator />

        <Text style={{ marginTop: 12 }}>
          Loading...
        </Text>
      </View>
    );
  }

  /**
   * ❌ Missing token
   */
  if (!token) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
          }}
        >
          Invalid invite link
        </Text>
      </View>
    );
  }

  /**
   * 🔓 Not signed in
   */
  if (!isSignedIn) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 12,
          }}
        >
          Join Organization
        </Text>

        <Text
          style={{
            color: '#666',
            marginBottom: 24,
            lineHeight: 22,
          }}
        >
          Sign in to accept your organization invite.
        </Text>

        <TouchableOpacity
          onPress={handleSignIn}
          style={{
            backgroundColor: '#000',
            padding: 16,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            Continue with Google
          </Text>
        </TouchableOpacity>

        {error && (
          <Text
            style={{
              marginTop: 16,
              color: 'red',
            }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }

  /**
   * 🔄 Accepting invite
   */
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <ActivityIndicator size="large" />

      <Text
        style={{
          marginTop: 20,
          fontSize: 18,
          fontWeight: '600',
        }}
      >
        Joining organization...
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: '#666',
          textAlign: 'center',
        }}
      >
        Syncing organization data to your device.
      </Text>

      {error && (
        <Text
          style={{
            marginTop: 20,
            color: 'red',
            textAlign: 'center',
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}