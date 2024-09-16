import { View, ActivityIndicator } from 'react-native'
import React from 'react'
import twclass from '@/constants/twclass'

const Loading = () => {
    return (
        <View style={twclass("flex-1 justify-center items-center")}>
            <ActivityIndicator size="large" color={"#065985"} />
        </View>
    )
}

export default Loading