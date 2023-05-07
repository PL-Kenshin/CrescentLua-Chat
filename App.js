import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native'
import ChatRoomSelectionScreen from './src/chatroomSelectionScreen';
import GoogleAuthenticate from './src/GoogleAuthenticate';

import SplashScreen from 'react-native-splash-screen'

const Stack = createNativeStackNavigator();


const App = () => {

  useEffect(() => {
    SplashScreen.hide();
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LogIn" component={GoogleAuthenticate} options={{headerShown: false}} />
        <Stack.Screen name="ChatroomSelectionScreen" component={ChatRoomSelectionScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
