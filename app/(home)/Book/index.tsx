import { View, Image, ScrollView, RefreshControl, TouchableOpacity, Animated, LayoutAnimation } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import TextTheme from '@/components/TextTheme';
import twclass from '@/constants/twclass';
import { Ionicons } from '@expo/vector-icons';
import { useStatusBar } from '@/hook/useStatusBar';
import api, { apiUrl } from '@/helper/api';
import Loading from '@/components/Loading';

const Book = () => {
    useStatusBar("light-content");
    const { book_id } = useLocalSearchParams();
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [contentBook, setContentBook] = useState<any>(null);
    const [collapsedStates, setCollapsedStates] = useState<boolean[]>([false]);
    const [animatedHeights, setAnimatedHeights] = useState<Animated.Value[]>([]);

    const fetchBooks = async () => {
        const res = await api.get('/api/v1/books/content/' + book_id);
        if (res) {
            setContentBook(res);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            fetchBooks()
        }, 1000);
    }

    useFocusEffect(useCallback(() => {
        fetchBooks();
    }, []));

    useEffect(() => {
        if (contentBook && contentBook.books[0]) {
            const newCollapsedStates = contentBook.books[0].content.map(() => true);
            const newAnimatedHeights = contentBook.books[0].content.map(() => new Animated.Value(0));

            setCollapsedStates(newCollapsedStates);
            setAnimatedHeights(newAnimatedHeights);
        }
    }, [contentBook]);

    const collapseData = (index: number) => {
        if (index < 0 || index >= animatedHeights.length) return;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        setCollapsedStates(prevStates => {
            const newStates = [...prevStates];
            newStates[index] = !newStates[index];

            Animated.timing(animatedHeights[index], {
                toValue: newStates[index] ? 0 : 1,
                duration: 500,
                useNativeDriver: false,
            }).start();

            return newStates;
        });
    };

    return (
        <ScrollView style={twclass("p-5")}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={"#065985"}
                />
            } >
            {contentBook && animatedHeights[0]
                ? (contentBook.type === "data" ? (
                    <View style={twclass("bg-zinc-200 p-5 rounded-xl mb-32 shadow-sm")}>
                        {contentBook.books[0].content.map((item: any, index: number) => {
                            return (
                                <View style={twclass("flex-col gap-1 mb-2")} key={`data-${index}`}>
                                    <TextTheme>{item.text}</TextTheme>
                                    {item.image ? (
                                        <View style={twclass("flex-row justify-center")}>
                                            <Image source={{ uri: apiUrl + item.image }} style={[twclass("h-[200px] w-[200px] rounded-md my-2"), { objectFit: "cover" }]} />
                                        </View>
                                    ) : item.image !== "" ? (<Loading />) : ""}
                                </View>
                            )
                        })}
                    </View>
                ) : contentBook.type === "topic" ? (
                    <>
                        <TextTheme font='Prompt-SemiBold' size='3xl' style={twclass("text-sky-800")}>หน่วยการเรียนรู้</TextTheme>
                        <View style={twclass("flex-col gap-2")}>
                            {contentBook.books[0].content.map(({ chapter, label, sections }: any, index: number) => {
                                return (
                                    <View key={`data-${index}`} style={twclass("shadow-sm")}>
                                        <View style={twclass("border border-zinc-200 overflow-hidden rounded-2xl")}>
                                            <TouchableOpacity
                                                onPress={() => router.navigate({
                                                    pathname: "/Book/content",
                                                    params: {
                                                        book_id: book_id,
                                                        chapter: chapter,
                                                        label: label,
                                                        content_index: index
                                                    }
                                                })}
                                                style={twclass("bg-zinc-200 py-3 px-5 justify-between flex-row items-center")}>
                                                <View style={twclass("basis-[90%]")}>
                                                    <TextTheme font='Prompt-SemiBold' size='lg'>{chapter}</TextTheme>
                                                    <TextTheme font='Prompt-Regular' size='base'>{label}</TextTheme>
                                                </View>
                                                <TouchableOpacity style={twclass("w-[40px] bg-zinc-300 rounded-full h-[40px] flex-row justify-center items-center ")} onPress={() => collapseData(index)}>
                                                    <Ionicons size={25} name={collapsedStates[index] ? 'chevron-down-sharp' : 'chevron-up-sharp'} style={twclass("mt-0.5")} />
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                            <Animated.View
                                                style={[
                                                    twclass("bg-white"),
                                                    {
                                                        maxHeight: animatedHeights[index].interpolate({
                                                            inputRange: [0, 10],
                                                            outputRange: [0, 3000]
                                                        }),
                                                        opacity: animatedHeights[index],
                                                        overflow: 'hidden',
                                                    }
                                                ]}
                                            >
                                                {sections.map((data: any, contentIndex: number) => {
                                                    return (
                                                        <TouchableOpacity
                                                            onPress={() => router.navigate({
                                                                pathname: "/Book/content",
                                                                params: {
                                                                    content_id: contentIndex,
                                                                    book_id: book_id,
                                                                    chapter: chapter,
                                                                    label: label,
                                                                    content_index: index
                                                                }
                                                            })}
                                                            key={`content-${contentIndex}`} style={twclass("p-3 pl-5 border-b border-zinc-200")}>
                                                            <TextTheme font='Prompt-Light' size='sm'>{data.title}</TextTheme>
                                                        </TouchableOpacity>

                                                    )
                                                })}
                                            </Animated.View>
                                        </View>
                                        {/* <Animated.View
                                            style={[
                                                twclass("flex-row justify-center"),
                                                {
                                                    maxHeight: animatedHeights[key].interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0, 50]
                                                    }),
                                                    opacity: animatedHeights[key],
                                                    overflow: 'hidden',
                                                }
                                            ]}
                                        >
                                            <TouchableOpacity style={twclass("bg-sky-800 p-2 w-50 rounded-b-xl flex-row justify-center")}>
                                                <TextTheme color='white' font='Prompt-SemiBold'>แบบทดสอบ</TextTheme>
                                            </TouchableOpacity>
                                        </Animated.View> */}
                                    </View>
                                )
                            })}
                        </View>
                    </>
                ) : null)
                : (<Loading />)}
            {/* {contentBook && animatedHeights[0] ? (
                contentBook.type === "data" ? (
                    <View style={twclass("bg-zinc-200 p-5 rounded-xl mb-32 shadow-sm")}>
                        {Object.entries(contentBook[0].content).map(([key, data]: any, index: number) => {
                            return (
                                <View style={twclass("flex-col gap-1 mb-5")} key={`data-${index}`}>
                                    <TextTheme>{data.content}</TextTheme>
                                    {data.image
                                        ? (<Image source={{ uri: data.image }} style={[twclass("h-[180px] w-full rounded-md"), { objectFit: "cover" }]} />)
                                        : (<Loading />)
                                    }
                                </View>
                            )
                        })}
                    </View>
                ) : (contentBook.type === "topic" ? (
                    <>
                        <TextTheme font='Prompt-SemiBold' size='3xl' style={twclass("text-sky-800")}>หน่วยการเรียนรู้</TextTheme>
                        <View style={twclass("flex-col gap-2")}>

                            {Object.entries(contentBook[0].content).map(([key, data]: any, index: number) => {
                                return (
                                    <View key={`data-${key}`} style={twclass("shadow-sm")}>
                                        <View style={twclass("border border-zinc-200 overflow-hidden rounded-2xl")}>
                                            <TouchableOpacity
                                                onPress={() => router.navigate({
                                                    pathname: "/Book/content",
                                                    params: {
                                                        book_id: book_id,
                                                        chapter: data.chapter,
                                                        label: data.label
                                                    }
                                                })}
                                                style={twclass("bg-zinc-200 py-3 px-5 justify-between flex-row items-center")}>
                                                <View style={twclass("basis-[90%]")}>
                                                    <TextTheme font='Prompt-SemiBold' size='lg'>{data.chapter}</TextTheme>
                                                    <TextTheme font='Prompt-Regular' size='base'>{data.label}</TextTheme>
                                                </View>
                                                <TouchableOpacity style={twclass("basis-[14%] bg-zinc-300 rounded-full h-[40px] flex-row justify-center items-center ")} onPress={() => collapseData(key)}>
                                                    <Ionicons size={25} name={collapsedStates[key] ? 'chevron-down-sharp' : 'chevron-up-sharp'} style={twclass("mt-0.5")} />
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                            <Animated.View
                                                style={[
                                                    twclass("bg-white"),
                                                    {
                                                        maxHeight: animatedHeights[index].interpolate({
                                                            inputRange: [0, 10],
                                                            outputRange: [0, 3000]
                                                        }),
                                                        opacity: animatedHeights[index],
                                                        overflow: 'hidden',
                                                    }
                                                ]}
                                            >
                                                {data["sections"].map((item: { title: string }, contentIndex: number) => {
                                                    return (
                                                        <TouchableOpacity
                                                            onPress={() => router.navigate({
                                                                pathname: "/Book/content",
                                                                params: {
                                                                    content_id: contentIndex,
                                                                    book_id: book_id,
                                                                    chapter: data.chapter,
                                                                    label: data.label
                                                                }
                                                            })}
                                                            key={`content-${contentIndex}`} style={twclass("p-3 pl-5 border-b border-zinc-200")}>
                                                            <TextTheme font='Prompt-Light' size='sm'>{item.title}</TextTheme>
                                                        </TouchableOpacity>

                                                    )
                                                })}
                                            </Animated.View>
                                        </View>
                                        <Animated.View
                                            style={[
                                                twclass("flex-row justify-center"),
                                                {
                                                    maxHeight: animatedHeights[key].interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0, 50]
                                                    }),
                                                    opacity: animatedHeights[key],
                                                    overflow: 'hidden',
                                                }
                                            ]}
                                        >
                                            <TouchableOpacity style={twclass("bg-sky-800 p-2 w-50 rounded-b-xl flex-row justify-center")}>
                                                <TextTheme color='white' font='Prompt-SemiBold'>แบบทดสอบ</TextTheme>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    </View>
                                )
                            })}
                        </View>
                    </>
                ) : "")
            ) : (
                <Loading />
            )} */}



            <View style={twclass("ios:pb-20 android:pb-10")}></View>
        </ScrollView >
    )
}

export default Book