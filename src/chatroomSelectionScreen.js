import React, { Component, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, SafeAreaView, FlatList } from 'react-native';
import { scale, moderateScale, verticalScale } from './scalingUtils';
import { LogBox } from 'react-native';
LogBox.ignoreLogs([ 'Non-serializable values were found in the navigation state', ]);
//odkomentować w przypadku braku rozwiązania na warning

const chatRooms = [
    {
        id: '1',
        title: 'Chatroom #1',
    },
    {
        id: '2',
        title: 'Chatroom #2',
    },
    {
        id: '3',
        title: 'Chatroom #3',
    },
]

const Item = ({ navigation, title, userInfo }) => (
    <View style={styles.item}>
        <TouchableOpacity  onPress={() => {navigation.navigate('chatScreen',{
            userData: userInfo,
        })
        }}>
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    </View>
)

const ChatRoomSelectionScreen = ({ navigation, route }) => {
    useEffect(() => {
        navigation.setOptions({
            headerTitle: '',
            headerRight: () => (
                <View>
                    <TouchableOpacity onPress={() => {
                        route.params.fun()
                        navigation.navigate('LogIn')
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
                backgroundColor: '#444444'
            }
        })
    })

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={chatRooms}
                renderItem={({ item }) => <Item navigation={navigation} title={item.title} userInfo={route.params.userData} />}
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
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    item: {
        backgroundColor: '#121212',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'white',
    },
    title: {
        fontSize: 32,
    },
    logout: {
        color: 'red',
    },
    welcome: {
        color: 'white',
    }
})

export default ChatRoomSelectionScreen;