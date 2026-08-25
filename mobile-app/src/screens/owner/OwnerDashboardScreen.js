import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ownerApi } from '../../api/ownerApi';
import { AuthContext } from '../../context/AuthContext';

export default function OwnerDashboardScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout, user } = useContext(AuthContext);

  const fetchAnalytics = async () => {
    try {
      const response = await ownerApi.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Fetch Analytics Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-50 px-5 pt-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6 pb-3 border-b border-slate-200">
        <View>
          <Text className="text-2xl font-black text-slate-900">Executive Portal</Text>
          <Text className="text-xs text-slate-500 mt-0.5">Welcome, {user?.name || 'Owner'}</Text>
        </View>
        <TouchableOpacity
          onPress={logout}
          className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-xs font-bold text-red-600">Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="items-center justify-center py-20">
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <View className="space-y-4 pb-12">
          {/* Revenue Hero Card */}
          <View className="bg-purple-900 p-6 rounded-3xl shadow-md">
            <Text className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Total Realized Revenue
            </Text>
            <Text className="text-4xl font-extrabold text-white mt-2">
              ₹{analytics?.totalRevenue?.toLocaleString('en-IN') || 0}
            </Text>
            <Text className="text-xs text-purple-300 mt-2">
              Aggregated across all completed guest reservations
            </Text>
          </View>

          {/* Grid Stats */}
          <View className="flex-row gap-4">
            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <Text className="text-xs font-bold uppercase text-slate-400">Occupancy</Text>
              <Text className="text-2xl font-black text-slate-900 mt-1">
                {analytics?.occupancyRate || '0%'}
              </Text>
              <Text className="text-[11px] text-emerald-600 font-medium mt-1">Real-time status</Text>
            </View>

            <View className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <Text className="text-xs font-bold uppercase text-slate-400">Total Bookings</Text>
              <Text className="text-2xl font-black text-slate-900 mt-1">
                {analytics?.totalBookings || 0}
              </Text>
              <Text className="text-[11px] text-purple-600 font-medium mt-1">Lifetime total</Text>
            </View>
          </View>

          {/* Inventory Breakdown */}
          <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <Text className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Room Inventory Distribution
            </Text>

            <View className="space-y-3">
              <View className="flex-row justify-between py-2 border-b border-slate-100">
                <Text className="text-sm text-slate-600">Total Registered Rooms</Text>
                <Text className="text-sm font-bold text-slate-900">{analytics?.totalRooms || 0}</Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-slate-100">
                <Text className="text-sm text-slate-600">Occupied by Guests</Text>
                <Text className="text-sm font-bold text-rose-600">{analytics?.occupiedRooms || 0}</Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-slate-100">
                <Text className="text-sm text-slate-600">Under Cleaning / Turnover</Text>
                <Text className="text-sm font-bold text-amber-600">{analytics?.cleaningRooms || 0}</Text>
              </View>

              <View className="flex-row justify-between pt-2">
                <Text className="text-sm font-bold text-slate-800">Available for Booking</Text>
                <Text className="text-sm font-extrabold text-emerald-600">
                  {analytics?.availableRooms || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}