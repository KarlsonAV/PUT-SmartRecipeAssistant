import React from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { signOut } from "@firebase/auth";
import { app, getAuth } from "../configs/firebase";

const backgroundImage = require("../assets/images/background_user.png"); // Adjust the path as needed

const UserScreen = () => {
  const auth = getAuth(app);
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>WELCOME!</Text>
            <Text style={styles.emailText}>{user.email}</Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authContainer: {
    width: "80%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    marginBottom: "90%",
    textAlign: "center",
    color: "#FE8C45",
    fontWeight: "bold",
  },
  emailText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#34495e",
  },
  button: {
    backgroundColor: "#FE8C45",
    padding: 8, // Decreased padding
    borderRadius: 63,
    alignItems: "center",
    justifyContent: "center", // Center text vertically
    width: "50%",
    height: "7%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 20, // Decreased font size
    fontWeight: "bold",
    textAlign: "center", // Center text horizontally
  },
});

export default UserScreen;
