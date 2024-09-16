import { View, Platform, TouchableOpacity, Modal } from 'react-native'
import React, { useState } from 'react'
import { router, Stack, useFocusEffect } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import TextTheme from '@/components/TextTheme';
import Constants from 'expo-constants';
import twclass from '@/constants/twclass';
import { fetchUserData, UserData } from '@/helper/api';
import useLoginStatus from '@/hook/useLoginStatus';
import Loading from '@/components/Loading';
import { Ionicons } from '@expo/vector-icons';

const RootHome = () => {
    const statusBarHeight = Platform.OS === 'ios' ? Constants.statusBarHeight : 0;
    const [isVisible, setIsVisible] = useState(false);

    const { isLoggedIn, isCheckingLogin, checkLoginStatus } = useLoginStatus();
    const [userData, setUserData] = useState<UserData | null>(null);

    const handleLogout = () => {
        router.replace("/logout");
        setIsVisible(false);
    };

    useFocusEffect(() => {
        checkLoginStatus();
        if (isLoggedIn) {
            fetchUserData(setUserData);
        }
    });

    if (isCheckingLogin) {
        return <Loading />;
    }

    return (
        <Stack screenOptions={{}}>
            <Stack.Screen name='home'
                options={{
                    headerTitle: "",
                    header: () => (
                        <LinearGradient
                            colors={['#265881', '#142E47']}
                            style={{
                                height: Platform.OS !== "ios" ? 160 : 120 + statusBarHeight,
                                paddingTop: statusBarHeight
                            }}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={twclass("p-5 pt-3 android:pt-14")}>
                                <View style={twclass("flex-row justify-between")}>
                                    <View>
                                        <View style={twclass("flex-row gap-2")}>
                                            <TextTheme style={twclass("text-white")} size='3xl' font='Prompt-Bold'>สวัสดี</TextTheme>
                                            {isLoggedIn ? (<TextTheme style={twclass("text-white")} size='2xl' font='Prompt-SemiBold'>"{userData?.firstname}"</TextTheme>) : null}
                                        </View>
                                        <TextTheme style={twclass("text-white")} size='xl' font='Prompt-SemiBold'>ยินดีต้อนรับ</TextTheme>
                                    </View>
                                    <View>
                                        {isLoggedIn ? (
                                            <View>
                                                <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={twclass("flex-row items-center")}>
                                                    <Ionicons name='person-circle' size={50} color="white" />
                                                </TouchableOpacity>

                                                <Modal transparent={true}
                                                    visible={isVisible}
                                                    onRequestClose={() => setIsVisible(false)}
                                                >
                                                    <TouchableOpacity
                                                        style={twclass("flex-1 bg-[rgba(0,0,0,0.5)]")}
                                                        activeOpacity={1}
                                                        onPress={() => setIsVisible(false)}
                                                    >
                                                        <View style={[twclass("absolute android:top-19 android:right-9 ios:top-28 ios:right-9 bg-white w-5 h-5"), { transform: [{ rotate: "45deg" }] }]} />
                                                        <View style={twclass("absolute android:top-20 android:right-5 ios:top-30 ios:right-5 bg-white rounded-xl p-2")}>
                                                            <TouchableOpacity onPress={handleLogout} style={twclass("p-2 flex-row gap-2 items-center")}>
                                                                <Ionicons name='power' size={20} style={twclass("text-red-500")} />
                                                                <TextTheme color='red-500'>ออกจากระบบ</TextTheme>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </TouchableOpacity>
                                                </Modal>
                                            </View>
                                        ) : (
                                            <View style={twclass("flex-row gap-2")}>
                                                <TouchableOpacity onPress={() => router.navigate("/register")} style={twclass("border-2 border-white rounded-xl p-2 justify-center items-center")}>
                                                    <TextTheme style={twclass("text-white")} size='base' font='Prompt-SemiBold'>สมัครสมาชิก</TextTheme>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => router.navigate("/login")} style={twclass("bg-white rounded-xl p-2 justify-center items-center")}>
                                                    <TextTheme style={twclass("text-sky-900")} size='base' font='Prompt-SemiBold'>เข้าสู่ระบบ</TextTheme>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <TextTheme style={twclass("text-white")} size='base'>เรียนรู้เรื่องคอมพิวเตอร์ไปด้วยกัน</TextTheme>
                            </View>
                        </LinearGradient>
                    )
                }}
            />
            <Stack.Screen name='Book' options={{
                headerShown: false,
                presentation: "card",
                animation: "simple_push",
                animationDuration: 500
            }} />
        </Stack>
    )
}

export default RootHome