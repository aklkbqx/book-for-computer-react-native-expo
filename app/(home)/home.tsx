import TextTheme from '@/components/TextTheme';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useStatusBar } from '@/hook/useStatusBar';
import { Ionicons } from '@expo/vector-icons';
import twclass from '@/constants/twclass';
import api, { apiUrl, fetchUserData, UserData } from '@/helper/api';
import useLoginStatus from '@/hook/useLoginStatus';
import Loading from '@/components/Loading';
import { LinearGradient } from 'expo-linear-gradient';

const Home = () => {
  useStatusBar("light-content");
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredBooks, setFilteredBooks] = useState<BookData[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [allBooks, setAllBooks] = useState<Record<string, BookData> | null>(null);

  const { isLoggedIn, isCheckingLogin, checkLoginStatus } = useLoginStatus();
  const [userData, setUserData] = useState<UserData | null>(null);

  useFocusEffect(() => {
    checkLoginStatus();
    if (isLoggedIn) {
      fetchUserData(setUserData);
    }
    if (userData?.role == "ADMIN") {
      router.replace("/admin/");
    }
  });

  const fetchBooks = async () => {
    const res = await api.get('/api/v1/books');
    if (res.length > 0) {
      setAllBooks(res);
      setFilteredBooks(Object.values(res));
    } else {
      setAllBooks(null);
      setFilteredBooks([]);
    }
  }
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      fetchBooks();
    }, 1000);
  }

  const handleSearch = useCallback((text: string) => {
    setSearchInput(text);
    if (allBooks) {
      const filtered = Object.values(allBooks).filter((item: BookData) =>
        item.th_name.toLowerCase().includes(text.toLowerCase()) ||
        item.eng_name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [allBooks]);

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchBooks();
  //   }, [allBooks])
  // );
  useEffect(() => {
    fetchBooks();
  }, [])

  if (isCheckingLogin) {
    return <Loading />;
  }


  return (
    <>
      <ScrollView keyboardDismissMode='on-drag'
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"#265881"}
          />
        }
      >
        <View style={twclass("p-5")}>
          <TextTheme font='Prompt-SemiBold' size='3xl' style={twclass("text-sky-800")}>อยากจะเรียนอะไร?</TextTheme>
          <View style={twclass("flex-row gap-2")}>
            <TextInput
              value={searchInput}
              onChangeText={handleSearch}
              placeholder='ค้นหาสิ่งที่อยากเรียน'
              placeholderTextColor={"#9E9E9E"}
              style={[{ fontFamily: "Prompt-Regular" }, twclass("bg-zinc-200 p-2 rounded-xl flex-1")]}
              autoCapitalize='none'
            />
            <TouchableOpacity style={twclass("bg-sky-800 p-2 rounded-xl")}>
              <Ionicons name='search' size={25} color={"white"} />
            </TouchableOpacity>
          </View>

          <View style={twclass("mt-5 flex-col gap-5")}>
            {filteredBooks.length === 0 ? (
              <TextTheme style={twclass("text-center")}>ยังไม่มีข้อมูลหนังสือที่คุณค้นหา...</TextTheme>
            ) : (
              filteredBooks.map((item: BookData, index: number) => {
                return (
                  <LinearGradient
                    key={`allBook-${index}`}
                    colors={[`${twclass(`bg-${item.color}-400`).backgroundColor}`, `${twclass(`bg-${item.color}-700`).backgroundColor}`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={twclass(`p-2 rounded-xl`)}
                  >
                    <TouchableOpacity key={Object.keys(item)[0] + "_" + item.book_id}
                      onPress={() => router.navigate({
                        pathname: "/Book",
                        params: { book_id: item.book_id.toString() }
                      })}
                    >
                      <View style={twclass("flex-row gap-2 items-center")}>
                        <Image source={{ uri: `${apiUrl}${item.book_image}` }} style={twclass("h-[120px] w-[100px] rounded-xl")} />
                        <View style={twclass("basis-[70%]")}>
                          <TextTheme color='white' font='Prompt-SemiBold' size='lg'>{item.th_name}</TextTheme>
                          <TextTheme color='white' font='Prompt-Medium' size='sm'>{item.eng_name}</TextTheme>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </LinearGradient>
                )
              })
            )}
          </View>

        </View>
      </ScrollView>
    </>
  )
}

export default Home