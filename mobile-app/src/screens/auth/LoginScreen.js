import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6 py-12">
        <View className="mb-8 items-center">
          <Text className="text-3xl font-extrabold text-blue-600">GrandStay</Text>
          <Text className="text-sm font-medium text-slate-500 mt-1">
            Hotel Operations & Booking Portal
          </Text>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <Text className="text-xl font-bold text-slate-800 mb-6">Welcome Back</Text>

          <View className="mb-4">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Email Address</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="name@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mb-6">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Password</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className="w-full bg-blue-600 py-3.5 rounded-xl items-center justify-center shadow"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-8 space-y-3">
          <TouchableOpacity
            className="items-center"
            onPress={() => navigation.navigate('RegisterCustomer')}
          >
            <Text className="text-sm text-slate-600">
              New Guest? <Text className="text-blue-600 font-semibold">Create Customer Account</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center mt-3"
            onPress={() => navigation.navigate('RegisterOwner')}
          >
            <Text className="text-sm text-slate-600">
              Hotel Partner? <Text className="text-indigo-600 font-semibold">Register Your Hotel</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}