import React, { useEffect } from 'react'
import { Stack, useNavigation } from 'expo-router'

const RootAuth = () => {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            animation: 'slide_from_bottom',
        });
    }, [navigation]);

    return (
        <Stack screenOptions={{
            headerShown: false,
        }}>
            <Stack.Screen
                name='login'
                options={{
                    presentation: "modal",
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name='register'
                options={{
                    presentation: "modal",
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name='logout'
                options={{
                    presentation: "fullScreenModal",
                    animation: 'slide_from_bottom'
                }}
            />
        </Stack>
    )
}

export default RootAuth