import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, Text } from 'react-native';

import EmployeeIDScreen from './src/screens/EmployeeIDScreen';
import GearScanScreen from './src/screens/GearScanScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createNativeStackNavigator();
const FIRE_RED = '#B22222';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="EmployeeID"
        screenOptions={{
          headerStyle: { backgroundColor: FIRE_RED },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="EmployeeID"
          component={EmployeeIDScreen}
          options={({ navigation }) => ({
            title: '🔥 Gear Scanner',
            headerRight: () => (
              <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
                <Text style={{ color: '#fff', fontSize: 13, marginRight: 4 }}>Admin</Text>
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="GearScan"
          component={GearScanScreen}
          options={{ title: 'Scan Gear Label' }}
        />
        <Stack.Screen
          name="Review"
          component={ReviewScreen}
          options={{ title: 'Review & Save' }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ title: 'Admin — Export Data' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
