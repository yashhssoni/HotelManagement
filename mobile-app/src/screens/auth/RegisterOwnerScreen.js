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

export default function RegisterOwnerScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    hotelName: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const { name, email, phone, password, hotelName, street, city } = form;
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !hotelName.trim() || !city.trim()) {
      Alert.alert('Incomplete Form', 'Please provide your owner profile and hotel details.');
      return;
    }

    setLoading(true);
    try {
      await authApi.sendOtp({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        purpose: 'registration',
      });

      navigation.navigate('OtpVerify', {
        email: email.trim().toLowerCase(),
        purpose: 'registration',
        registrationType: 'owner',
        payload: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          hotelName: hotelName.trim(),
          hotelAddress: {
            street: street.trim(),
            city: city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
          },
        },
      });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to dispatch OTP.';
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
          <Text className="text-indigo-600 font-semibold">← Back to Login</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-slate-900 mb-1">Register Hotel & Owner</Text>
        <Text className="text-sm text-slate-500 mb-6">Setup your property, assign staff, and track live occupancy.</Text>

        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <Text className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2">1. Owner Profile</Text>

          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Owner Name</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800"
              placeholder="Jane Doe"
              placeholderTextColor="#94a3b8"
              value={form.name}
              onChangeText={(val) => setForm({ ...form, name: val })}
            />
          </View>

          <View className="mt-2">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Owner Email</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800"
              placeholder="owner@hotel.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(val) => setForm({ ...form, email: val })}
            />
          </View>

          <View className="mt-2">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Owner Phone</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800"
              placeholder="+91 9876543210"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(val) => setForm({ ...form, phone: val })}
            />
          </View>

          <View className="mt-2">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Password</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800"
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={form.password}
              onChangeText={(val) => setForm({ ...form, password: val })}
            />
          </View>

          <Text className="text-sm font-bold text-indigo-700 uppercase tracking-wider mt-5 mb-2">2. Hotel Details</Text>

          <View>
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">Hotel Property Name</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800"
              placeholder="Grand Palace Resort"
              placeholderTextColor="#94a3b8"
              value={form.hotelName}
              onChangeText={(val) => setForm({ ...form, hotelName: val })}
            />
          </View>

          <View className="mt-2">
            <Text className="text-xs font-semibold uppercase text-slate-500 mb-1">City</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800"
              placeholder="e.g. Mumbai, Goa"
              placeholderTextColor="#94a3b8"
              value={form.city}
              onChangeText={(val) => setForm({ ...form, city: val })}
            />
          </View>

          <TouchableOpacity
            className="w-full bg-indigo-600 py-3.5 rounded-xl items-center justify-center shadow mt-6"
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Verify & Register Hotel</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}