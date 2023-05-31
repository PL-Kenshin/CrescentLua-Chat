import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, SafeAreaView, FlatList } from 'react-native';
import { scale, moderateScale, verticalScale } from './scalingUtils';
import { LogBox } from 'react-native';
import usePreventCloseApp from './preventCloseApp';
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state',]);
//odkomentować w przypadku braku rozwiązania na warning

const chatRooms = [
    {
        id: '1',
        title: 'Chat #1',
    },
    {
        id: '2',
        title: 'Chat #2',
    },
    {
        id: '3',
        title: 'Chat #3',
    },
]

const Item = ({ navigation, title, chatId, userInfo }) => (
    <View style={styles.item}>
        <TouchableOpacity onPress={() => {
            navigation.navigate('chatScreen', {
                userData: userInfo,
                title: title,
                chatId:chatId
            })
        }}>
            <View>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
            </View>
        </TouchableOpacity>
    </View>
)

const ChatRoomSelectionScreen = ({ navigation, route }) => {
    useEffect(() => {
        console.log(route.params.userData)
        navigation.setOptions({
            headerTitle: '',
            headerRight: () => (
                <View>
                    <TouchableOpacity onPress={() => {
                        route.params.fun()
                        navigation.reset({
                            index:0,
                            routes:[
                              {
                                name: 'LogIn',
                              }
                            ]
                          })
                    }}>
                        <Text style={styles.logout}>Wyloguj</Text>
                    </TouchableOpacity>
                </View>
            ),
            headerLeft: () => (
                
                <View>
                    <Text style={styles.welcome}>Witaj {route.params.userData.user.name}</Text>
                </View>
            ),
            headerBackVisible: false,
            headerStyle: {
                backgroundColor: '#444444',
            }
        })
    })

    const { closeApp } = usePreventCloseApp();

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={chatRooms}
                renderItem={({ item }) => <Item navigation={navigation} title={item.title} userInfo={route.params.userData} chatId={item.id} />}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
        flex: 1,
        display: 'flex',
    },
    item: {
        display: 'flex',
        flex: 1,
        backgroundColor: '#121212',

        borderBottomWidth: 1,
        borderBottomColor: 'white',
    },
    title: {
        fontSize: moderateScale(32, 0.3),
        color: '#AAAAAA',
        padding: moderateScale(20, 0.3),
        marginVertical: moderateScale(8, 0.3),
        alignSelf:'center'
    },
    logout: {
        color: 'red',
    },
    welcome: {
        color: 'white',
    }
})

export default ChatRoomSelectionScreen;