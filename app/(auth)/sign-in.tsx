import { View, Button } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';

export default function SignInScreen() {
  const { startOAuthFlow } = useOAuth({
    strategy: 'oauth_google',
  });

  const signIn = async () => {
    try {
      const result = await startOAuthFlow();

      console.log(result);
    } catch (err) {
      console.log('OAuth error', err);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Button
        title="Continue with Google"
        onPress={signIn}
      />
    </View>
  );
}