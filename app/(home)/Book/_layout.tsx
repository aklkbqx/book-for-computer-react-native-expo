import { View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import TextTheme from '@/components/TextTheme'
import { LinearGradient } from 'expo-linear-gradient'
import Constants from 'expo-constants';
import twclass from '@/constants/twclass'
import api from '@/helper/api'

const RootBook = () => {
  const statusBarHeight = Platform.OS === 'ios' ? Constants.statusBarHeight : 0;
  const { book_id } = useLocalSearchParams();
  const bookId = Array.isArray(book_id) ? book_id[0] : book_id;
  const [allBooks, setAllBooks] = useState<Record<string, BookData> | null>(null);
  const [bookName, setBookName] = useState<{ th_name: string; eng_name: string }>({ th_name: "", eng_name: "" });
  const [colorHeader, setColorHeader] = useState(["#fff", "#fff"]);
  const [headerHeight, setHeaderHeight] = useState(100); 

  let color_spit;
  let combinedString: string;

  const fetchBooks = async () => {
    const res = await api.get(`/api/v1/books`);
    if (res) {
      setAllBooks(res);
    }
  }

  useEffect(() => {
    if (allBooks) {
      const book = Object.values(allBooks).find((val) => val.book_id === Number(bookId));
      if (book) {
        setBookName({ th_name: book.th_name, eng_name: book.eng_name });
        color_spit = `bg-${book.color}-400`.split("-");
        color_spit[2] = "700";
        combinedString = color_spit.join('-');
        setColorHeader([twclass(`bg-${book.color}-400`).backgroundColor as never, twclass(combinedString).backgroundColor as never])
      }
    }
  }, [allBooks, bookId]);

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(100 + height);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  if (colorHeader) {
    return (
      <Stack screenOptions={{
        headerShown: true,
        header: () => (
          <LinearGradient
            colors={colorHeader}
            style={{
              height: Platform.OS !== "ios" ? headerHeight + statusBarHeight : headerHeight,
              paddingTop: statusBarHeight
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={twclass("flex-col p-5 pt-2 android:pt-12")}>
              <TouchableOpacity onPress={() => router.back()} style={twclass("flex-row items-center")}>
                <Ionicons name='chevron-back' size={30} color={allBooks ? "white" : "black"} />
                <TextTheme font='Prompt-SemiBold' size='xl' color={allBooks ? "white" : "black"} style={twclass("mt-0.5")}>กลับ</TextTheme>
              </TouchableOpacity>
              <View style={twclass("flex-col p-2 pl-5")} id='heightName' onLayout={handleLayout}>
                {allBooks ? (
                  <>
                    <TextTheme style={twclass("text-white")} size='lg' font='Prompt-SemiBold'>{bookName.th_name}</TextTheme>
                    <TextTheme style={twclass("text-white")} size='base'>({bookName.eng_name})</TextTheme>
                  </>
                ) : (
                  <>
                    <View style={twclass("text-white bg-zinc-100 mb-1 rounded-xl p-2 mt-2")}></View>
                    <View style={twclass("text-white bg-zinc-100 rounded-xl p-2 w-[200px]")}></View>
                  </>
                )}
              </View>
            </View>
          </LinearGradient>
        )
      }}>
        <Stack.Screen name='index' />
        <Stack.Screen name='content' />
      </Stack>
    )
  } else {
    return (
      <View style={twclass("flex-1 justify-center items-center")}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

}

export default RootBook;
