import React, { useState } from "react";
import {
  Button,
  Image,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { GPT_VISION_ENDPOINT, GPT_VISION_API_KEY } from "@env";
import gpt_config from "../configs/gpt_vision.json";

const CameraScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const openCamera = async () => {
    // Requesting camera permissions
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera permissions to make this work!");
      return;
    }

    // Launch the camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.cancelled) {
      handleAPIRequest(result.assets[0].base64);
    }
  };

  const openGallery = async () => {
    // Requesting camera roll permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.cancelled) {
      handleAPIRequest(result.assets[0].base64);
    }
  };

  const handleAPIRequest = async (base64Data) => {
    setLoading(true);

    const dataUrl = `data:image/jpeg;base64,${base64Data}`;

    const myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("api-key", GPT_VISION_API_KEY);

    const raw = JSON.stringify({
      max_tokens: gpt_config.max_tokens,
      messages: [
        {
          role: "system",
          content: gpt_config.system_prompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: gpt_config.user_prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      console.log("Making request...");
      const response = await fetch(GPT_VISION_ENDPOINT, requestOptions);
      const result = await response.json();
      console.log(result);
      const assistantResponse = result.choices[0].message.content;
      console.log(assistantResponse);
      navigation.navigate("Details", {
        imageBase64: dataUrl,
        text: assistantResponse,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Take a picture" onPress={openCamera} />
      <Button title="Choose from gallery" onPress={openGallery} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={loading}
        onRequestClose={() => {
          setLoading(false);
        }}
      >
        <View style={styles.fullScreenOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
});

export default CameraScreen;
