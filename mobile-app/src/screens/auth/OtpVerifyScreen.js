import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';

export default function OtpVerifyScreen({ route, navigation }) {
  const { email, purpose, registrationType, payload } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { setUser } = useContext(AuthContext);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP with Brevo record in backend
      await authApi.verifyOtp({ email, otp, purpose });

      // 2. Complete actual registration based on role type
      let response;
      if (registrationType === 'customer') {
        response = await authApi.registerCustomer(payload);
      } else if (registrationType === 'owner') {
        response = await authApi.registerOwner(payload);
      }

      const { token, user } = response.data;
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));

      // Updates global auth state; Root Router immediately mounts role tabs
      setUser(user);
    } catch (error) {
      const msg = error.response?.data?.message || 'Verification failed. Please check the code.';
      Alert.alert('Verification Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await authApi.sendOtp({ email, purpose });
      Alert.alert('OTP Sent', 'A fresh 6-digit code has been dispatched to your email.');
    } catch (error) {
      Alert.alert('Error', 'Unable to resend OTP at this moment.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 justify-center px-6">
      <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <Text className="text-2xl font-bold text-slate-800 text-center mb-2">Check Your Email</Text>
        <Text className="text-sm text-slate-500 text-center mb-6">
          We sent a 6-digit verification code to {'\n'}
          <Text className="font-bold text-slate-800">{email}</Text>
        </Text>

        <TextInput
          className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-3.5 text-center text-2xl font-bold tracking-widest text-slate-900 mb-6"
          placeholder="000000"
          placeholderTextColor="#94a3b8"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity
          className="w-full bg-blue-600 py-3.5 rounded-xl items-center justify-center shadow"
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-base">Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-5 items-center"
          onPress={handleResendOtp}
          disabled={resending}
        >
          <Text className="text-sm text-blue-600 font-semibold">
            {resending ? 'Sending...' : "Didn't receive the code? Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}