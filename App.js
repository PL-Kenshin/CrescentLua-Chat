import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native'
import ChatRoomSelectionScreen from './src/chatroomSelectionScreen';
import GoogleAuthenticate from './src/GoogleAuthenticate';


const Stack = createNativeStackNavigator();

const App = () => {
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
