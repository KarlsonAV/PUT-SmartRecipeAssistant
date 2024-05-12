// App.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { app, getAuth } from "./configs/firebase";
import { onAuthStateChanged } from "@firebase/auth";

// Importing new screens
import CameraScreen from "./screens/CameraScreen";
import ListScreen from "./screens/ListScreen";
import DetailsScreen from "./screens/DetailsScreen";
import UserScreen from "./screens/UserScreen";
import { LogInScreen } from "./screens/LoginScreen"; // Assuming the LogInScreen handles both login and signup
import { SignUpScreen } from "./screens/SignUpScreen"; // Separate Sign Up screen

import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true); // To toggle between LogIn and SignUp

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  if (!loggedIn) {
    return (
      <NavigationContainer>
        {isLoginView ? (
          <LogInScreen onAuthChange={setIsLoginView} />
        ) : (
          <SignUpScreen onAuthChange={setIsLoginView} />
        )}
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#FE8C45" },
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "#6C2B33",
        }}
      >
        <Tab.Screen
          name="Camera"
          component={CameraScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="camera" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="List"
          component={ListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="fast-food-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Details"
          component={DetailsScreen}
          options={{ tabBarButton: () => null }}
        />
        <Tab.Screen
          name="User"
          component={UserScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
