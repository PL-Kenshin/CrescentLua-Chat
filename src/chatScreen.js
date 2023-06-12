import React, { Component, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, SafeAreaView, FlatList, TextInput, Alert, ToastAndroid } from 'react-native';
import { scale, moderateScale, verticalScale } from './scalingUtils';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { getTimeZone } from "react-native-localize";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { LogBox } from 'react-native';
//LogBox.ignoreLogs([ 'Non-serializable values were found in the navigation state', ]);
//odkomentować w przypadku braku rozwiązania na warning


const Item = ({ list, fun, socket, chatId, _id, content, userId, userName, date, route }) => (
    <View >
        <Text style={userId == route.params.userData.user.id ? styles.nameSelf : styles.name}>{userName}</Text>
        <TouchableOpacity style={userId == route.params.userData.user.id ? styles.item : styles.item2}
            onLongPress={() => {
                if(userId == route.params.userData.user.id) {
                    Alert.alert('Confirm', 'Are you sure you want to delete message?', [
                        {
                            text: "Yes",
                            onPress: () => {
                                socket.emit('messageDelete', chatId, _id)
                                let items = [...list]
                                let index = items.findIndex((element) => element._id == _id)
                                items.splice(index, 1)

                                fun(items)
                            }
                        }, {
                            text: "No",
                            onPress: () => console.log('No')
                        }
                    ]
                    )
                }
            }}
            > 
                <Text style={styles.title}>{content}</Text> 
            </TouchableOpacity>
        <Text style={userId == route.params.userData.user.id ? styles.dateSelf : styles.date}>{date.toLocaleString("en-GB",{timeZone: getTimeZone()})}</Text>
    </View>
)

const ChatScreen = ({ navigation, route }) => {
    const flatList = useRef(null)
    const textInput = useRef(null)
    const [inputValue, setInputValue] = useState('')
    const [messagesList, setMessagesList] = useState(null)
    const [isMore, setIsMore] = useState(false)
    const [isOffline, setOfflineStatus] = useState(false);


    const socket = route.params.socket
    useEffect(() => {
        navigation.setOptions({
            headerTitle: route.params.title,
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    navigation.goBack()
                }} hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}>
                    <Icon name="angle-left" size={30} color="white" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    ToastAndroid.show(!isOffline?"Connected":"Disconnected",3000)
                }} hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}>
                    <MaterialIcon name={!isOffline?"signal":"signal-off"} size={30} color="white"></MaterialIcon>
                </TouchableOpacity>
            ),
            headerBackVisible: false,
            headerStyle: {
                backgroundColor: '#444444',
            },
            headerTintColor: 'white',
            headerTitleAlign: 'center'
        })

        const unsubscribe = NetInfo.addEventListener(async state => {

            if(!state.isConnected){
                setOfflineStatus(true)
                try {
                    let jsonValue = await AsyncStorage.getItem('messages')
                    jsonValue = jsonValue != null ? JSON.parse(jsonValue) : null;
                    if(jsonValue !== null) {
                      setMessagesList(jsonValue)
                    }
                  } catch(e) {
                    console.error(e)
                  }
                
            } else{
                setOfflineStatus(false)

            }
        });

        const fetchMessages = async () => {
            try {
                socket.emit("getMessages", route.params.chatId, async (response) => {
                    let messages = [...response.messages]
                    messages.forEach(element => {
                        element.date = new Date(element.date)
                    });
                    setMessagesList(messages)
                    setIsMore(response.isMore)
                    try {
                        const jsonValue = JSON.stringify(messages)
                        await AsyncStorage.setItem('messages', jsonValue)
                    } catch (e) {
                        console.error('saving data error')
                    }
                });
            } catch (e) {
                console.error('Error fetching data:', e)
            }
        }
        fetchMessages()

        return () => {
            unsubscribe()
        }
    }, [])
    useEffect(() => {
        const messageListener = async (message) => {
            try {
                let updated = [...messagesList]
                updated.push({ _id: message._id, userId: message.userId, userName: message.userName, date: new Date(message.date), content: message.content })
                setMessagesList(updated)
                try {
                    const jsonValue = JSON.stringify(updated)
                    await AsyncStorage.setItem('messages', jsonValue)
                } catch (e) {
                    console.error('saving data error')
                }
            } catch (e) {
                console.log('messageListener Error: ',e)
            }
        }

        try {
            socket.on("newMessage", messageListener)
        } catch (e) {
            console.log("error on listening", e)
        }

        const deleteListener = async (_id) =>{
            let items = [...messagesList]
            let index = items.findIndex((element) => element._id == _id)
            items.splice(index, 1)
            setMessagesList(items)
            try {
                const jsonValue = JSON.stringify(items)
                await AsyncStorage.setItem('messages', jsonValue)
            } catch (e) {
                console.error('saving data error')
            }
        }
        try {
            socket.on("deleteMessage", deleteListener)
        } catch (e) {
            console.log(e)
        }

        return () => {
            try {
                socket.off("newMessage", messageListener)
                socket.off("deleteMessage", deleteListener)
            } catch (e) {
                console.log("error on closing listeners", e)
            }

        }
    }, [messagesList])

    const [isRefreshing,setIsRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [refreshed, setRefreshed] = useState(false)

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {messagesList ? <View style={styles.container}><FlatList
                ref={flatList}
                onContentSizeChange={() => {
                    if(refreshed) return
                    if (messagesList.length != 0 ) {
                        flatList.current.scrollToEnd()
                    }
                }}
                onLayout={() => {
                    if (messagesList.length != 0) {
                        flatList.current.scrollToEnd()
                    }
                }}
                data={messagesList.sort((a, b) =>{ 
                    return a.date - b.date;
                })}
                renderItem={({ item }) => <Item list={messagesList} fun={setMessagesList} socket={socket} chatId={route.params.chatId} _id={item._id} content={item.content} userId={item.userId} date={item.date} route={route} userName={item.userName} />}
                keyExtractor={item => item._id}
                onRefresh={async () => {
                    setIsRefreshing(true)
                    console.log(isMore)
                    
                    if(isMore===true ){
                        await new Promise(resolve => socket.emit('getNextMessages',route.params.chatId,page, (response) =>{
                            setPage(page+1)
                            const newList = [...messagesList]
                            const messages = [...response.messages]
                            messages.forEach(element => {
                                element.date = new Date(element.date)
                                console.log('messages',element.date)
                            });
                            newList.push(...messages)
                            newList.forEach(element => {
                                console.log('newList',element.date)
                            });
                            setRefreshed(true)
                            setMessagesList(newList)
                            setTimeout(() => {
                                setRefreshed(false)
                            }, 1000);
                            
                            resolve(setIsMore(response.isMore))
                        }))
                    }
                    setIsRefreshing(false)
                }}
                refreshing={isRefreshing}
            />
                <View style={styles.inputArea}>
                    <TextInput style={styles.input} ref={textInput} onChangeText={(value) => setInputValue(value)} />
                    <TouchableOpacity style={styles.send} onPress={async () => {
                        let date = null
                        if (inputValue == "") {
                            return
                        }
                        content = inputValue
                        textInput.current.clear()
                        setInputValue('')
                        let _id = null
                        try {
                            await new Promise(resolve => socket.emit("message", route.params.chatId, {
                                userId: route.params.userData.user.id,
                                userName: route.params.userData.user.name,
                                content: content
                            }, (response) => {
                                _id = response._id
                                resolve(date = new Date(response.date))
                            }))
                        } catch (e) {
                            console.error("Sending error", e)
                        }

                        const test = [...messagesList]
                        test.push({ _id: _id, userId: route.params.userData.user.id, userName: route.params.userData.user.name, date: date, content: inputValue })

                        setMessagesList(test)
                        try {
                            const jsonValue = JSON.stringify(test)
                            await AsyncStorage.setItem('messages', jsonValue)
                        } catch (e) {
                            console.error('saving data error')
                        }

                    }}>

                        <Icon name="chevron-circle-right" size={40} color="#777777" />
                    </TouchableOpacity>
                </View></View> : <View><Text>Loading...</Text></View>}

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#121212',
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end'
    },
    item: {
        display: 'flex',
        maxWidth: '70%',
        backgroundColor: '#444444',
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 25,
        alignSelf: 'flex-end'
    },
    item2: {
        display: 'flex',
        backgroundColor: '#444444',
        maxWidth: '70%',
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 25,
        alignSelf: 'flex-start'
    },
    title: {
        padding: 10,
        fontSize: 16,
        color: '#BBBBBB'
    },
    title2: {
        padding: 10,
        fontSize: 16,
        color: '#BBBBBB'
    },
    logout: {
        color: 'red',
    },
    welcome: {
        color: 'white',
    },
    date: {
        display: 'flex',
        fontSize: 10,
        alignSelf: 'flex-start',
        paddingHorizontal: 30,
        marginTop: -7,

    },
    dateSelf: {
        display: 'flex',
        fontSize: 10,
        alignSelf: 'flex-end',
        paddingHorizontal: 30,
        marginTop: -7
    },
    name: {
        display: 'flex',
        fontSize: 12,
        alignSelf: 'flex-start',
        paddingHorizontal: 30,
        marginTop: 10,
        marginBottom: -7
    },
    nameSelf: {
        display: 'flex',
        fontSize: 12,
        alignSelf: 'flex-end',
        paddingHorizontal: 30,
        marginTop: 10,
        marginBottom: -7
    },
    inputArea: {
        display: 'flex',
        flexDirection: 'row',
    },
    input: {
        height: 40,
        margin: 12,
        width: 300,
        borderWidth: 1,
        padding: 10,
        borderColor: '#444444'
    },
    send: {
        marginVertical: 12,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 100
    }
})

export default ChatScreen;