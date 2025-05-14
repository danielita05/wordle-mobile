import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppLoading from 'expo-app-loading';

// Import screens
import Login from './src/screens/Login';
import GameScreen from './src/screens/GameScreen';
import StatsScreen from './src/screens/StatsScreen';
import LeaderboardScreen from './src/screens/LeaderBoardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
 
  const [fontsLoaded] = useFonts({
    'Moon-Light': require('./assets/fonts/Moon-Light.ttf'), 
    'Moon-Bold': require('./assets/fonts/Moon-Bold.ttf'),   
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}