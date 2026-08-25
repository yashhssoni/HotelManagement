import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import axiosClient from '../../api/axiosClient';
import { receptionistApi } from '../../api/receptionistApi';

export default function ReceptionistOccupancyScreen() {
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveBookings = async () => {
    try {
      // Fetches confirmed and checked_in bookings
      const response = await axiosClient.get('/bookings/pending');
      setActiveBookings(response.data);
    } catch (error) {
      console.error('Fetch Active Bookings Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveBookings();
  }, []);

  const handleCheckIn = async (bookingId) => {
    try {
      await receptionistApi.checkInGuest(bookingId);
      Alert.alert('Status Updated', 'Guest marked as Checked-In.');
      fetchActiveBookings();
    } catch (error) {
      Alert.alert('Error', 'Unable to update check-in status.');
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await receptionistApi.checkOutGuest(bookingId);
      Alert.alert('Status Updated', 'Guest checked out. Room moved to Cleaning status.');
      fetchActiveBookings();
    } catch (error) {
      Alert.alert('Error', 'Unable to complete check-out.');
    }
  };

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-4">
      <View className="mb-4 pb-3 border-b border-slate-200">
        <Text className="text-xl font-bold text-slate-900">Live Occupancy & Desk</Text>
        <Text className="text-xs text-slate-500">Manage check-ins, key handouts, and check-outs</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <FlatList
          data={activeBookings}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchActiveBookings();
              }}
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-slate-400 font-medium">No active guest stays found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-base font-bold text-slate-800">
                    {item.customerId?.name || 'Guest'}
                  </Text>
                  <Text className="text-xs text-slate-500">{item.customerId?.phone}</Text>
                </View>
                <View className="bg-blue-100 px-2.5 py-1 rounded-full">
                  <Text className="text-[11px] font-bold text-blue-700 capitalize">
                    {item.bookingStatus.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              <View className="flex-row space-x-3 mt-4 pt-3 border-t border-slate-100">
                <TouchableOpacity
                  className="flex-1 bg-blue-600 py-2.5 rounded-xl items-center justify-center mr-2 shadow"
                  onPress={() => handleCheckIn(item._id)}
                >
                  <Text className="text-white font-bold text-xs">Check In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-slate-800 py-2.5 rounded-xl items-center justify-center ml-2 shadow"
                  onPress={() => handleCheckOut(item._id)}
                >
                  <Text className="text-white font-bold text-xs">Check Out & Clean</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}