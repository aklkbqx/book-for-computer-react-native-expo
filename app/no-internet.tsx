import { TouchableOpacity, View } from 'react-native'
import React from 'react'
import twclass from '@/constants/twclass'
import TextTheme from '@/components/TextTheme'
import { router } from 'expo-router'

const NoInternet = () => {
    return (
        <View style={twclass("flex-1 justify-center items-center")}>
            <View style={twclass("flex-col items-center")}>
                <TextTheme font='Prompt-SemiBold'>ไม่มีการเชื่อมต่อ internet</TextTheme>
                <View style={twclass("flex-row gap-1")}>
                    <TextTheme>กรุณา</TextTheme>
                    <TouchableOpacity onPress={() => router.navigate("/")}>
                        <TextTheme font='Prompt-SemiBold' style={twclass("underline")}>ลองใหม่อีกครั้ง</TextTheme>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default NoInternet