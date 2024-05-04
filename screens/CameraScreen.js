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
import uuid from "react-native-uuid";
import { GPT_VISION_ENDPOINT, GPT_VISION_API_KEY } from "@env";
import gpt_config from "../configs/gpt_vision.json";
import { app, getAuth, db, storage } from "../configs/firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "@firebase/firestore";

import { decode, encode } from "base-64";

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

const CameraScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);

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
      quality: 0.7,
      base64: true,
    });

    if (!result.cancelled) {
      handleAPIRequest(result.assets[0]);
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
      quality: 0.7,
      base64: true,
    });

    if (!result.cancelled) {
      handleAPIRequest(result.assets[0]);
    }
  };

  const handleAPIRequest = async (image) => {
    setLoading(true);

    const base64Data = image.base64;
    const imageURI = image.uri;

    const parseRecipe = (text) => {
      const nameRegex = /Recipe Name:\s*(.+)/;
      const timeRegex = /Estimated cooking time:\s*(.+)/;
      const personsRegex = /Recipe for (\d+(?:-\d+)?)/; // Updated to handle ranges like "1-2"
      const stepsRegex = /Recipe:\s*([\s\S]+)/;
      const ingredientsRegex = /Ingredients:\s*([\s\S]*?)\n(?=\n|Recipe Name)/;

      const nameMatch = text.match(nameRegex);
      const timeMatch = text.match(timeRegex);
      const personsMatch = text.match(personsRegex);
      const stepsMatch = text.match(stepsRegex);
      const ingredientsMatch = text.match(ingredientsRegex);

      const name = nameMatch ? nameMatch[1].trim() : "";
      const time = timeMatch ? timeMatch[1].trim() : "";
      const persons = personsMatch ? personsMatch[1] : "1"; // Default to "1" if not specified
      const rawSteps = stepsMatch ? stepsMatch[1].trim() : "";

      const steps = rawSteps
        .split("\n")
        .filter((step) => step.trim() !== "")
        .map((step) => step.replace(/^\d+\.\s*/, "").trim());

      const ingredients = ingredientsMatch
        ? ingredientsMatch[1]
            .split("\n")
            .filter((ingredient) => ingredient.trim() !== "")
            .map((ingredient) => ingredient.replace(/^- /, "").trim())
        : [];

      return {
        recipeName: name,
        cookingTime: time,
        servings: persons,
        ingredients: ingredients,
        steps: steps,
      };
    };

    const uploadImageToStorage = async () => {
      const response = await fetch(imageURI);
      const blob = await response.blob();
      const fileName = `${Date.now()}.jpg`;
      const storageRef = ref(storage, `images/${fileName}`);

      try {
        await uploadBytesResumable(storageRef, blob);
      } catch (e) {
        console.error(e);
        return "";
      }

      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    };

    const addRecipeToDB = async (userID, imageURL, recipe) => {
      const recipeDoc = {
        userID: userID,
        imageURL: imageURL,
        recipeName: recipe.recipeName,
        cookingTime: recipe.cookingTime,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        servings: recipe.servings,
        createdAt: new Date(),
      };

      const recipeID = uuid.v4();

      try {
        await setDoc(doc(db, "recipes", recipeID), recipeDoc);
      } catch (e) {
        console.error(e);
      }
    };

    const dataURL = `data:image/jpeg;base64,${base64Data}`;

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
                url: dataURL,
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
      console.log("Making request to Azure OpenAI...");
      const response = await fetch(GPT_VISION_ENDPOINT, requestOptions);
      const result = await response.json();

      console.log("Response received from Azure OpenAI");

      const assistantResponse = result.choices[0].message.content;

      if (assistantResponse.includes("NoFoodException")) {
        alert("No food detected in the image. Please try again.");
        return;
      }

      const recipe = parseRecipe(assistantResponse);

      console.log("Uploading image to storage...");
      const imageDownloadURL = await uploadImageToStorage();

      console.log("Adding recipe to database...");
      await addRecipeToDB(auth.currentUser.uid, imageDownloadURL, recipe);

      console.log("Recipe added to database");

      navigation.navigate("Details", {
        image: dataURL,
        recipe: recipe,
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
