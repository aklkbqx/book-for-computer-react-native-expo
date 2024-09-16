import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import TextTheme from '@/components/TextTheme';
import twclass from '@/constants/twclass';
import { useStatusBar } from '@/hook/useStatusBar';


const Logout: React.FC = () => {
    useStatusBar(Platform.OS != "ios" ? "dark-content" : "light-content");

    const checkToken = async () => {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            await AsyncStorage.removeItem('userToken');
            setTimeout(() => {
                router.replace("/");
            }, 2000);
        } else {
            setTimeout(() => {
                router.replace("/");
            }, 2000);
        }
    }

    useEffect(() => {
        checkToken()
    }, [checkToken])

    return (
        <View style={twclass("flex-1 justify-center items-center")}>
            <View style={twclass("flex-row gap-3")}>
                <TextTheme font='Prompt-SemiBold' size='2xl' children="กำลังออกจากระบบ.." />
                <ActivityIndicator size="large" color={"#065985"} />
            </View>
        </View>
    );
};

export default Logout;