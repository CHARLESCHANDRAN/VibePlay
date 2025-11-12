import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding from './src/screens/Onboarding';
import CaptureMood from './src/screens/CaptureMood';
import Intent from './src/screens/Intent';
import Recommendations from './src/screens/Recommendations';
import Saved from './src/screens/Saved';

const Stack = createNativeStackNavigator();

export default function App() {
  console.log('App component rendering...');
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="CaptureMood" component={CaptureMood} />
        <Stack.Screen name="Intent" component={Intent} />
        <Stack.Screen name="Recommendations" component={Recommendations} />
        <Stack.Screen name="Saved" component={Saved} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
