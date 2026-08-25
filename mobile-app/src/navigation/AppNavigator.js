import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { AuthContext } from '../context/AuthContext';

// Auth Stack Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterCustomerScreen from '../screens/auth/RegisterCustomerScreen';
import RegisterOwnerScreen from '../screens/auth/RegisterOwnerScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';

// Role Navigators
import CustomerNavigator from './CustomerNavigator';
import ReceptionistNavigator from './ReceptionistNavigator';
import OwnerNavigator from './OwnerNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, role, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 1. Unauthenticated Auth Flow
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
            <Stack.Screen name="RegisterOwner" component={RegisterOwnerScreen} />
            <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
          </Stack.Group>
        ) : (
          // 2. Role-Based Navigation Routing
          <Stack.Group>
            {role === 'customer' && (
              <Stack.Screen name="CustomerHome" component={CustomerNavigator} />
            )}
            {role === 'receptionist' && (
              <Stack.Screen name="ReceptionistHome" component={ReceptionistNavigator} />
            )}
            {role === 'owner' && (
              <Stack.Screen name="OwnerHome" component={OwnerNavigator} />
            )}
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}