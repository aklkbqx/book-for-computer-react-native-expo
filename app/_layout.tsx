import FontLoader from '@/components/FontLoader';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <FontLoader>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ animationDuration: 400 }}>
          <Stack.Screen name="index" options={{ headerShown: false, animation: "fade" }} />
          <Stack.Screen name="(home)" options={{ headerShown: false, animation: "fade" }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "slide_from_bottom", presentation: "modal" }} />
          <Stack.Screen name="admin" options={{ headerShown: false, animation: "fade" }} />
          <Stack.Screen name="no-internet" options={{ headerShown: false, animation: "fade" }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </FontLoader>
  );
}