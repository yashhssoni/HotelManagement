import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ownerApi } from '../../api/ownerApi';

export default function OwnerStaffScreen() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleCreateStaff = async () => {
    const { name, email, password, phone } = form;

    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await ownerApi.createReceptionist({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
      });

      Alert.alert(
        'Staff Account Created',
        `Receptionist ${name} is registered. They can now log in using this email and password.`
      );

      setForm({ name: '', email: '', password: '', phone: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create staff account.';
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
      <ScrollView className="flex-1 px-5 py-6">
        <Text className="text-2xl font-black text-slate-900 mb-1">Staff Management</Text>
        <Text className="text-xs text-slate-500 mb-6">
          Create Receptionist credentials with operational access
        </Text>

        <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Staff Full Name</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor="#94a3b8"
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
            />
          </View>

          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Work Email</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-800"
              placeholder="rahul.desk@hotel.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(val) => setForm({ ...form, email: val })}
            />
          </View>

          <View>
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

          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Temporary Password</Text>
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
            className="w-full bg-purple-600 py-3.5 rounded-xl items-center justify-center shadow mt-4"
            onPress={handleCreateStaff}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Create Receptionist Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}