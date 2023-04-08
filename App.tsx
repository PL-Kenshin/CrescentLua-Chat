import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native'

import GoogleAuthenticate from './src/GoogleAuthenticate';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}>
        <Stack.Screen name="Home" component={GoogleAuthenticate} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
