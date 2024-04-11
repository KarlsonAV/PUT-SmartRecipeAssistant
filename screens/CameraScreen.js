// CameraScreen.js
import React from "react";
import { View, Button, StyleSheet, Text, TextComponent, SafeAreaView } from "react-native";

const CameraScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Button title="Take a picture" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
});

export default CameraScreen;
