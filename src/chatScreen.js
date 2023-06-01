import React, { Component, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, SafeAreaView, FlatList, TextInput } from 'react-native';
import { scale, moderateScale, verticalScale } from './scalingUtils';
import  Icon  from 'react-native-vector-icons/FontAwesome';
//import { LogBox } from 'react-native';
//LogBox.ignoreLogs([ 'Non-serializable values were found in the navigation state', ]);
//odkomentować w przypadku braku rozwiązania na warning



const Item = ({ content, userId, userName, date, route }) => (
    <View >
        <Text style={userId == route.params.userData.user.id ? styles.nameSelf : styles.name}>{userName}</Text>
        <TouchableOpacity style={userId == route.params.userData.user.id ?
            styles.item : styles.item2}>
            <Text style={styles.title}>{content}</Text>
        </TouchableOpacity>
        <Text style={userId == route.params.userData.user.id ? styles.dateSelf : styles.date}>{date.getHours()}:{date.getMinutes()<10?"0"+ date.getMinutes():date.getMinutes()}</Text>
    </View>
)

const ChatScreen = ({ navigation, route }) => {
    const flatList = React.useRef(null)
    const textInput = React.useRef(null)
    const [inputValue,setInputValue] = React.useState('')

    const [messagesList, setMessagesList] = React.useState(null)

    const socket = route.params.socket
    useEffect(() => {
        navigation.setOptions({
            headerTitle: route.params.title,
            headerLeft: () => (
                <TouchableOpacity onPress={() => {
                    navigation.goBack()
                }} hitSlop={{top:10,bottom:10,right:10,left:10}}>
                    <Icon name="angle-left" size={30} color="white" />
                </TouchableOpacity>
            ),
            headerBackVisible: false,
            headerStyle: {
                backgroundColor: '#444444',
            },
            headerTintColor:'white',
            headerTitleAlign:'center'
        })
        const fetchMessages = async () => {
            try {
                socket.emit("getMessages",route.params.chatId, (response) => {
                    setMessagesList(response.messages)
                });
            } catch (e) {
                console.error('Error fetching data:', e)
            }
        }
        fetchMessages()
    },[])
    useEffect(() => {
        const messageListener = async (message) => {
            try{
            console.log(message)
            console.log(messagesList)
            let updated = [...messagesList]
            
            updated.push({userId:message.userId,userName:message.userName,date:new Date(message.date),content:message.content})

            setMessagesList(updated)
            } catch (e) {
                console.log(e)
            }
        }
        try{
            socket.on("newMessage", messageListener)
        } catch (e) {
            console.log("error on listening", e)
        }
        return () => {
            try{
                socket.off("newMessage", messageListener)
            } catch (e) {
                console.log("error on closing listener", e)
            }

        }
    },[messagesList])

    return (
        <SafeAreaView style={styles.container}>
            {messagesList ? <View><FlatList
                ref={flatList}
                onContentSizeChange={() => {
                    if(messagesList.length != 0){
                        flatList.current.scrollToEnd()
                    }
                }}
                onLayout={() => {
                    if(messagesList.length != 0){
                        flatList.current.scrollToEnd()
                    }
                }}
                data={messagesList}
                renderItem={({ item }) => <Item content={item.content} userId={item.userId} date={new Date(item.date)} route={route} userName={item.userName} />}
                keyExtractor={item => item.date}
            />
            <View style={styles.inputArea}>
                <TextInput style={styles.input} ref={textInput} onChangeText={(value)=>setInputValue(value)}/>
                <TouchableOpacity style={styles.send} onPress={() =>{
                    if(inputValue==""){
                        return
                    }
                    try {
                        socket.emit("message",route.params.chatId,{
                            userId:route.params.userData.user.id,
                            userName:route.params.userData.user.name,
                            content:inputValue
                        })
                    } catch (e) {
                        console.error("Sending error", e)
                    }
                    //just to commit
                    const test = [...messagesList]
                    test.push({userId:route.params.userData.user.id,userName:route.params.userData.user.name,date:new Date(),content:inputValue})

                    setMessagesList(test)
                    textInput.current.clear()
                    setInputValue('')
                    }}>

                    <Icon name="chevron-circle-right" size={40} color="#777777"/>
                </TouchableOpacity>
            </View></View>:<View><Text>Loading...</Text></View>}

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
        color:'#BBBBBB'
    },
    title2: {
        padding: 10,
        fontSize: 16,
        color:'#BBBBBB'
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
    inputArea:{
        display:'flex',
        flexDirection:'row'
    },
    input: {
        height: 40,
        margin: 12,
        width:300,
        borderWidth: 1,
        padding: 10,
        borderColor: '#444444'
    },
    send: {
        marginVertical:12,
        marginRight: 12,
        alignItems:'center',
        justifyContent:'center',
        width: 40,
        height: 40,
        borderRadius: 100
    }
})

export default ChatScreen;