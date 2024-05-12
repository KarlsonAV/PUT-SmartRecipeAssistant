import React, { useState, useEffect } from "react";
import {
  Button,
  Image,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
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

  const [hatYPosition] = useState(new Animated.Value(0)); // Initial position for the chef's hat

  useEffect(() => {
    const startBouncing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(hatYPosition, {
            toValue: -30, // Move up
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(hatYPosition, {
            toValue: 0, // Move back down
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (loading) {
      startBouncing();
    }

    return () => hatYPosition.setValue(0); // Reset position on unmount
  }, [loading]);

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
      <ImageBackground
        source={require("../assets/images/background_assistant.png")}
        style={styles.backgroundImage}
      >
        <Text style={styles.titleText}></Text>
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Text style={styles.buttonText}>Take a picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={openGallery}>
            <Text style={styles.buttonText}>Choose from gallery</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <Modal
        animationType="fade"
        transparent={true}
        visible={loading}
        onRequestClose={() => {
          setLoading(false);
        }}
      >
        <View
          style={[
            styles.fullScreenOverlay,
            { backgroundColor: loading ? "#FFFFFF" : "rgba(0, 0, 0, 0.5)" },
          ]}
        >
          <Animated.Image
            source={require("../assets/images/chef_hat.png")}
            style={{
              width: 100,
              height: 100,
              transform: [{ translateY: hatYPosition }],
            }}
          />
          <Text style={styles.loadingText}>Preparing a recipe...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "space-between",
    resizeMode: "cover",
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },
  bottomContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  button: {
    backgroundColor: "#FE8C45",
    padding: 15,
    borderRadius: 20,
    marginVertical: 20,
    width: 250,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  iconBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 10,
  },
  iconButton: {
    flex: 1,
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
  },
  fullScreenOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
});

export default CameraScreen;
