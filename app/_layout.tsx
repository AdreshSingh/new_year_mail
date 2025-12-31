import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import ConvexClientProvider from './ConvexClientProvider';

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, title: "New Year Mail" }} />
        <Stack.Screen name="mail/[id]" options={{ presentation: 'modal', title: 'Read Mail' }} />
        <Stack.Screen name="compose" options={{ presentation: 'modal', title: 'Compose Mail' }} />
      </Stack>
      <StatusBar style="light" />
    </ConvexClientProvider>
  );
}
