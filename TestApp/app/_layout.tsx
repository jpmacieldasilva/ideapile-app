import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="capture" />
        <Stack.Screen name="settings" />
        <Stack.Screen 
          name="idea/[id]" 
          options={{
            headerShown: true,
            headerTitle: 'Detalhes da Ideia',
            headerBackTitle: 'Voltar',
            headerStyle: {
              backgroundColor: Colors.header,
            },
            headerTintColor: Colors.headerForeground,
            headerTitleStyle: {
              color: Colors.headerForeground,
              fontWeight: '600',
            },
          }}
        />
      </Stack>
    </>
  );
}
