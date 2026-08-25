import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authApi } from '../../api/authApi';

export default function RegisterCustomerScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const { name, email, phone, password } = form;
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Incomplete Form', 'Please fill in all details.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authApi.sendOtp({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        purpose: 'registration',
      });

      // Pass pending registration data to OTP screen
      navigation.navigate('OtpVerify', {
        email: email.trim().toLowerCase(),
        purpose: 'registration',
        registrationType: 'customer',
        payload: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        },
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send OTP. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-blue-600 font-semibold">← Back to Login</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-slate-900 mb-1">Create Customer Account</Text>
        <Text className="text-sm text-slate-500 mb-6">Book rooms, manage reservations, and check in faster.</Text>

        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Full Name</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="John Doe"
              placeholderTextColor="#94a3b8"
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
            />
          </View>

          <View className="mt-3">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Email Address</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="john@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(val) => setForm({ ...form, email: val })}
            />
          </View>

          <View className="mt-3">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Phone Number</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="+91 9876543210"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(val) => setForm({ ...form, phone: val })}
            />
          </View>

          <View className="mt-3 mb-2">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Password</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={form.password}
              onChangeText={(val) => setForm({ ...form, password: val })}
            />
          </View>

          <TouchableOpacity
            className="w-full bg-blue-600 py-3.5 rounded-xl items-center justify-center shadow mt-4"
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Verify Email & Register</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}