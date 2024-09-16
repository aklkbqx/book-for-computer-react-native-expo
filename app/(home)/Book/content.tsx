import { View, ScrollView, RefreshControl, Image } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import twclass from '@/constants/twclass';
import TextTheme from '@/components/TextTheme';
import { useStatusBar } from '@/hook/useStatusBar';
import api, { apiUrl } from '@/helper/api';
import Loading from '@/components/Loading';

const Content = () => {
  useStatusBar("light-content");
  const { content_index, content_id, book_id, chapter, label, } = useLocalSearchParams();
  const contentId = Number(Array.isArray(content_id) ? content_id[0] : content_id);
  const contentIndex = Number(Array.isArray(content_index) ? content_index[0] : content_index);
  const scrollViewRef = useRef<ScrollView>(null);
  const viewRefs = useRef<any>({});
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [contentBook, setContentBook] = useState<any>(null);

  const fetchBooks = async () => {
    const res = await api.get('/api/v1/books/content/' + book_id);
    if (res && res.success) {
      setContentBook(res.books[0].content[contentIndex]);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      fetchBooks();
    }, 1000);
  }

  const scrollToKey = (key: number) => {
    if (viewRefs.current[key]) {
      viewRefs.current[key].measureLayout(
        scrollViewRef.current!.getInnerViewNode(),
        (x: number, y: number) => {
          scrollViewRef.current!.scrollTo({ y, animated: false });
        }
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      const sort = async () => {
        await fetchBooks();
        setTimeout(() => {
          scrollToKey(contentId)
        }, 100);
      }
      sort();
    }, [])
  );

  return (
    <ScrollView ref={scrollViewRef} style={twclass("p-5")}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={"#065985"}
        />}
    >
      {contentBook ? (
        <View style={twclass("flex-col gap-5 mb-32")}>
          <View>
            <View style={twclass("bg-zinc-200 p-5 rounded-xl mb-5 shadow-sm")}>
              <View style={twclass("flex-col gap-1")}>
                <TextTheme font='Prompt-SemiBold' size='lg'>{contentBook.chapter}</TextTheme>
                <TextTheme font='Prompt-Regular' size='base'>{contentBook.label}</TextTheme>
              </View>
            </View>

            {contentBook.sections.map((section: any, sectionIndex: number) => {
              return (
                <View
                  ref={el => viewRefs.current[sectionIndex] = el}
                  style={twclass("bg-zinc-200 p-5 rounded-xl shadow-sm mb-5")}
                  key={`section-${sectionIndex}`}
                >
                  <View style={twclass("flex-col gap-1")}>
                    <TextTheme font='Prompt-SemiBold' size='lg'>{section.title}</TextTheme>
                    {section.content.map((contentItem: any, contentIndex: number) => (
                      <View key={`content-${sectionIndex}-${contentIndex}`}>
                        <TextTheme>{contentItem.text}</TextTheme>
                        {contentItem.image && (
                          <View style={twclass("flex-col justify-center my-2 items-center")}>
                            <Image
                              source={{ uri: `${apiUrl}/${contentItem.image}` }}
                              style={[twclass("border border-zinc-400 w-[200px] h-[200px] rounded-xl"), { objectFit: "cover" }]}
                            />
                            {contentItem.imageCredit && (
                              <>
                                <TextTheme style={twclass("w-[300px] text-center mt-2")} font='Prompt-Light' size='sm'>{contentItem.imageCredit.des}</TextTheme>
                                <TextTheme style={twclass("w-[300px] text-center mt-2")} font='Prompt-Light' size='sm'>{contentItem.imageCredit.ref}</TextTheme>
                              </>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )
            })}
          </View>
        </View>
      ) : <Loading />}
    </ScrollView>
  )
}

export default Content;