import { View, TouchableOpacity, Image, Modal, ScrollView, RefreshControl } from 'react-native'
import React, { useCallback, useState } from 'react'
import twclass from '@/constants/twclass'
import IconIonicons from '@/components/IconIonicons'
import { useStatusBar } from '@/hook/useStatusBar'
import api, { apiUrl, fetchUserData, UserData } from '@/helper/api'
import useLoginStatus from '@/hook/useLoginStatus'
import { router, useFocusEffect } from 'expo-router'
import TextTheme from '@/components/TextTheme'
import Loading from '@/components/Loading'
import { LinearGradient } from 'expo-linear-gradient'

const AdminDashboard = () => {
    useStatusBar("dark-content");
    const defalutProfile = require("@/assets/images/default-profile.jpg");
    const [isVisible, setIsVisible] = useState(false);
    const { isLoggedIn, isCheckingLogin, checkLoginStatus } = useLoginStatus();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [allBooks, setAllBooks] = useState<Record<string, BookData> | null>(null);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const fetchBooks = async () => {
        const res = await api.get('/api/v1/books');
        if (res.length > 0) {
            setAllBooks(res);
        } else {
            setAllBooks(null);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            fetchUserData(setUserData)
            fetchBooks();
            setRefreshing(false);
        }, 1000);
    }

    useFocusEffect(
        useCallback(() => {
            checkLoginStatus();
            if (isLoggedIn) {
                fetchUserData(setUserData);
            }
            if (userData?.role === "USER") {
                router.replace("/home");
            }
        }, [checkLoginStatus, isLoggedIn])
    );

    useFocusEffect(useCallback(() => {
        fetchBooks();
    }, [allBooks]))

    if (isCheckingLogin) {
        return <Loading />;
    }

    return (
        <View style={twclass("px-5 android:pt-12 ios:pt-15 flex-1 flex-col")}>
            <TextTheme font='Prompt-SemiBold' color='sky-800' size='3xl'>ผู้ดูแลระบบ</TextTheme>
            <View style={twclass("flex-row justify-between items-center mt-4")}>
                <View style={twclass("flex-row gap-2 items-center")}>
                    <Image source={defalutProfile} style={twclass("w-[50px] h-[50px] rounded-full")} />
                    <View style={twclass("flex-col gap-0")}>
                        <View style={twclass("flex-row gap-1")}>
                            <TextTheme style={twclass("text-sky-800")} size='xl'>
                                {userData?.firstname}
                            </TextTheme>
                            <TextTheme style={twclass("text-sky-800")} size='xl'>
                                {userData?.lastname}
                            </TextTheme>
                        </View>
                        <TextTheme font='Prompt-SemiBold' style={twclass("text-sky-800")} size='xs'>ยินดีต้อนรับ</TextTheme>
                    </View>
                </View>
                <View>
                    <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={twclass("flex-row items-center")}>
                        <IconIonicons name='settings' style={twclass("text-sky-800")} />
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
                            <View style={[twclass("absolute ios:top-40 android:top-31 android:right-6 ios:right-6 bg-white w-5 h-5"), { transform: [{ rotate: "45deg" }] }]} />
                            <View style={twclass("absolute android:top-32 ios:top-41 android:right-2 ios:right-2 bg-white rounded-xl p-2")}>
                                <TouchableOpacity onPress={() => router.replace("/logout")} style={twclass("p-2 flex-row gap-2 items-center")}>
                                    <IconIonicons name='power' size={20} style={twclass("text-red-500")} />
                                    <TextTheme color='red-500'>ออกจากระบบ</TextTheme>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
            </View>

            <View style={twclass("mt-5 flex-1")}>
                <TouchableOpacity onPress={() => router.navigate("/admin/addBook")} style={twclass("flex-row gap-2 items-center justify-start")}>
                    <TextTheme font='Prompt-SemiBold' size='xl' color='sky-800'>เพิ่มหนังสือ</TextTheme>
                    <View style={twclass("bg-sky-800 rounded-xl p-1 w-[30px] h-[30px] justify-center items-center")}>
                        <IconIonicons name='add' color={"white"} style={twclass("text-xl absolute top-0.4 left-1.3")} />
                    </View>
                </TouchableOpacity>
                <ScrollView style={twclass("mt-2 flex-col")}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={"#265881"}
                        />}
                    showsVerticalScrollIndicator={false}
                >
                    {allBooks ? Object.entries(allBooks).map(([key, book]: [string, BookData], index: number) => {
                        return (
                            <LinearGradient
                                key={`allBook-${index}`}
                                colors={[`${twclass(`bg-${book.color}-400`).backgroundColor}`, `${twclass(`bg-${book.color}-700`).backgroundColor}`]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={twclass(`p-2 rounded-2xl bg-${book.color}-400 my-2`)}>
                                <View style={twclass("flex-row gap-2 items-start")}>
                                    <Image source={{ uri: `${apiUrl}${book.book_image}` }} style={twclass("h-[120px] w-[100px] rounded-xl")} />
                                    <View style={twclass("basis-[70%]")}>
                                        <TextTheme color='white' font='Prompt-SemiBold' size='lg'>{book.th_name}</TextTheme>
                                        <TextTheme color='white' font='Prompt-Medium' size='base'>({book.eng_name})</TextTheme>
                                    </View>
                                </View>
                                <View style={twclass("flex-row justify-end gap-2 mt-3 absolute right-[10px] bottom-[10px]")}>
                                    <TouchableOpacity
                                        onPress={() => router.navigate({
                                            pathname: "/Book",
                                            params: { book_id: book.book_id.toString() }
                                        })} style={twclass("px-2 py-1 bg-sky-500 rounded-xl flex-row gap-2")}>
                                        <IconIonicons name='eye' size={20} style={twclass("text-white")} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => router.navigate({
                                            pathname: "/admin/settings",
                                            params: { book_id: book.book_id.toString() }
                                        })}
                                        style={twclass("px-2 py-1 bg-red-500 rounded-xl pb-2")}>
                                        <IconIonicons name='settings' size={20} style={twclass("text-white")} />
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        );
                    }) : (
                        <View style={twclass("flex-row justify-center mt-5")}>
                            <TextTheme style={twclass("w-[200px] opacity-60 text-center")} color='sky-900'>ขณะนี้ยังไม่มีข้อมูลหนังสือ กรุณาทำการเพิ่มหนังสือก่อน!</TextTheme>
                        </View>
                    )}
                </ScrollView>
            </View>


        </View>
    )
}

export default AdminDashboard