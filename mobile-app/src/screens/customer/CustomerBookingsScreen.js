import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { customerApi } from '../../api/customerApi';
import { AuthContext } from '../../context/AuthContext';

export default function CustomerBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { logout, user } = useContext(AuthContext);

  const fetchBookings = async () => {
    try {
      const response = await customerApi.getMyBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Fetch Bookings Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', bg: 'bg-emerald-100', text: 'text-emerald-700' };
      case 'checked_in':
        return { label: 'Checked In', bg: 'bg-blue-100', text: 'text-blue-700' };
      case 'checked_out':
        return { label: 'Completed', bg: 'bg-slate-100', text: 'text-slate-700' };
      default:
        return { label: 'Pending Allotment', bg: 'bg-amber-100', text: 'text-amber-700' };
    }
  };

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-4">
      {/* Header & User Info */}
      <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-slate-200">
        <View>
          <Text className="text-xl font-bold text-slate-900">My Reservations</Text>
          <Text className="text-xs text-slate-500">Logged in as {user?.email}</Text>
        </View>
        <TouchableOpacity
          onPress={logout}
          className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg"
        >
          <Text className="text-xs font-bold text-red-600">Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center justify-center py-16">
              <Text className="text-slate-400 font-medium">No bookings placed yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.bookingStatus);
            return (
              <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-xs font-mono font-bold text-slate-400 uppercase">
                      #{item.bookingId}
                    </Text>
                    <Text className="text-base font-bold text-slate-800 mt-0.5">
                      {item.roomType}
                    </Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full ${badge.bg}`}>
                    <Text className={`text-[11px] font-bold ${badge.text}`}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Assigned Room Card (Dynamic) */}
                <View className="bg-slate-50 p-3 rounded-xl border border-slate-100 my-2">
                  <Text className="text-xs text-slate-500">Room Assignment</Text>
                  <Text className="text-sm font-extrabold text-slate-800 mt-0.5">
                    {item.roomId ? `Room ${item.roomId.roomNumber}` : '⏳ Allotment in progress by front desk'}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-100">
                  <Text className="text-xs text-slate-400">
                    {new Date(item.checkInDate).toLocaleDateString()}
                  </Text>
                  <Text className="text-base font-bold text-slate-900">
                    ₹{item.totalAmount}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}