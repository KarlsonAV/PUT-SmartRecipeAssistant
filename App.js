// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CameraScreen from './screens/CameraScreen';
import ListScreen from './screens/ListScreen';
import LoginScreen from './screens/LoginScreen';
import DetailsScreen from './screens/DetailsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  return (
    <NavigationContainer>
      {loggedIn ? (
        <Tab.Navigator>
          <Tab.Screen name="Camera" component={CameraScreen} />
          <Tab.Screen name="List" component={ListScreen} />
          <Tab.Screen name="Details" component={DetailsScreen} options={{tabBarButton: () => null }}/>
        </Tab.Navigator>
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}
