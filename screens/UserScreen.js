// UserScreen.js
import React from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { signOut } from "@firebase/auth";
import { app, getAuth } from "../configs/firebase";
import { styles } from "../auth_styles";

const UserScreen = () => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  console.log("UserId:", user.uid);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.emailText}>{user.email}</Text>
        <Text style={styles.title}>{user.metadata.lastSignInTime}</Text>
        <Button title="Logout" onPress={handleLogout} color="#e74c3c" />
      </View>
    </ScrollView>
  );
};

export default UserScreen;
