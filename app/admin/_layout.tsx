import React from 'react'
import { router, Stack } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Platform, TouchableOpacity, View } from 'react-native'
import Constants from 'expo-constants';
import twclass from '@/constants/twclass';
import { Ionicons } from '@expo/vector-icons';
import TextTheme from '@/components/TextTheme';

const RootAdminLayout = () => {
  const statusBarHeight = Platform.OS === 'ios' ? Constants.statusBarHeight : 0;
  return (
    <Stack>
      <Stack.Screen name='index' options={{
        headerShown: false,
      }} />
      <Stack.Screen name='addBook' options={{
        headerShown: true,
        header: () => (
          <LinearGradient
            colors={['#265881', '#142E47']}
            style={{
              height: Platform.OS !== "ios" ? 100 : 50 + statusBarHeight,
              paddingTop: statusBarHeight
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={twclass("flex-col p-5 pt-2 android:pt-12")}>
              <TouchableOpacity onPress={() => router.back()} style={twclass("flex-row items-center")}>
                <Ionicons name='chevron-back' size={30} color={"white"} />
                <TextTheme font='Prompt-SemiBold' size='xl' color='white' style={twclass("mt-0.5")}>กลับ</TextTheme>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ),
        animation: 'fade_from_bottom'
      }} />
      <Stack.Screen name='settings' options={{
        headerShown: false,
        animation: 'slide_from_right'
      }} />
    </Stack>
  )
}

export default RootAdminLayout