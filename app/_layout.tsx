import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { Colors } from '../src/constants/colors';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';

function StackNavigator() {
  const { colors, theme, isLoading } = useTheme();
  
  if (isLoading) {
    return null; // ou uma tela de loading simples
  }
  
  return (
    <>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="capture" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="calendarview" />
        <Stack.Screen 
          name="idea/[id]" 
          options={{
            headerShown: false, // Removido o header automático para usar o customizado
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StackNavigator />
    </ThemeProvider>
  );
}
