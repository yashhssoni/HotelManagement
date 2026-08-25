import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { customerApi } from '../../api/customerApi';

// Demo Room Inventory
const ROOM_CATALOG = [
  {
    id: '1',
    type: 'Deluxe Suite',
    price: 3500,
    features: ['King Bed', 'AC', 'Free WiFi', 'City View'],
    description: 'Spacious luxury room ideal for couples or business travelers.',
  },
  {
    id: '2',
    type: 'Executive Double',
    price: 2400,
    features: ['Double Bed', 'AC', 'Free WiFi', 'Breakfast Included'],
    description: 'Comfortable double room with premium amenities.',
  },
  {
    id: '3',
    type: 'Standard Single',
    price: 1500,
    features: ['Single Bed', 'AC', 'High Speed WiFi'],
    description: 'Cozy and economical choice for solo travelers.',
  },
];

export default function CustomerHomeScreen({ navigation }) {
  const [selectedRoom, setSelectedRoom] = useState(ROOM_CATALOG[0]);
  const [loading, setLoading] = useState(false);

  // Default: 1 Night Booking starting today
  const checkInDate = new Date();
  const checkOutDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const handleBookingPayment = async () => {
    setLoading(true);
    try {
      // 1. Create Razorpay Order in Backend
      const orderResponse = await customerApi.createRazorpayOrder({
        amount: selectedRoom.price,
        receipt: `rcpt_${Date.now()}`,
      });

      const orderData = orderResponse.data;

      // 2. Launch Razorpay Checkout Modal
      const options = {
        description: `Booking for ${selectedRoom.type}`,
        currency: 'INR',
        key: 'rzp_test_yourKeyIdHere', // Replace with your RAZORPAY_KEY_ID
        amount: orderData.amount,
        name: 'GrandStay Hotel',
        order_id: orderData.id,
        prefill: {
          email: 'guest@example.com',
          contact: '9876543210',
          name: 'Hotel Guest',
        },
        theme: { color: '#2563eb' },
      };

      RazorpayCheckout.open(options)
        .then(async (paymentSuccessData) => {
          // 3. Verify Payment Signature & Save Booking
          await customerApi.verifyPaymentAndBook({
            razorpay_order_id: paymentSuccessData.razorpay_order_id,
            razorpay_payment_id: paymentSuccessData.razorpay_payment_id,
            razorpay_signature: paymentSuccessData.razorpay_signature,
            hotelId: '65f000000000000000000001', // Automatically mapped to active hotel
            roomType: selectedRoom.type,
            checkInDate,
            checkOutDate,
            totalAmount: selectedRoom.price,
          });

          Alert.alert(
            'Booking Successful!',
            'Your payment is confirmed. The receptionist will allot your room shortly and email your receipt.',
            [{ text: 'View Bookings', onPress: () => navigation.navigate('MyBookings') }]
          );
        })
        .catch((error) => {
          Alert.alert('Payment Cancelled', error.description || 'Payment was not completed.');
        });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to initiate checkout.';
      Alert.alert('Checkout Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 px-5 py-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-slate-900">Choose Your Stay</Text>
        <Text className="text-sm text-slate-500 mt-0.5">Select a category and complete instant checkout</Text>
      </View>

      {/* Room Selection Cards */}
      <View className="space-y-4">
        {ROOM_CATALOG.map((room) => {
          const isSelected = selectedRoom.id === room.id;
          return (
            <TouchableOpacity
              key={room.id}
              activeOpacity={0.8}
              onPress={() => setSelectedRoom(room)}
              className={`p-5 rounded-2xl border transition-all ${
                isSelected ? 'bg-blue-50/50 border-blue-600 shadow-sm' : 'bg-white border-slate-200'
              }`}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1 pr-2">
                  <Text className={`text-lg font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {room.type}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-1">{room.description}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-extrabold text-blue-600">₹{room.price}</Text>
                  <Text className="text-[10px] text-slate-400 font-medium">/ night</Text>
                </View>
              </View>

              {/* Amenities Badges */}
              <View className="flex-row flex-wrap gap-1.5 mt-4">
                {room.features.map((feat, idx) => (
                  <View key={idx} className="bg-slate-100 px-2.5 py-1 rounded-md">
                    <Text className="text-[11px] font-medium text-slate-600">{feat}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Booking Summary Box */}
      <View className="mt-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-10">
        <Text className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Reservation Summary
        </Text>
        <View className="flex-row justify-between py-1.5 border-b border-slate-100">
          <Text className="text-slate-600">Selected Type</Text>
          <Text className="font-semibold text-slate-800">{selectedRoom.type}</Text>
        </View>
        <View className="flex-row justify-between py-1.5 border-b border-slate-100">
          <Text className="text-slate-600">Duration</Text>
          <Text className="font-semibold text-slate-800">1 Night</Text>
        </View>
        <View className="flex-row justify-between pt-3">
          <Text className="text-base font-bold text-slate-900">Total Payable</Text>
          <Text className="text-xl font-extrabold text-blue-600">₹{selectedRoom.price}</Text>
        </View>

        <TouchableOpacity
          className="w-full bg-blue-600 py-3.5 rounded-xl items-center justify-center shadow mt-6"
          onPress={handleBookingPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-base">Pay with Razorpay (₹{selectedRoom.price})</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}