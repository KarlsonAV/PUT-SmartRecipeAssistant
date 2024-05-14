import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  authContainer: {
    width: "90%", // Increased the width
    maxWidth: 500, // Increased the max width
    backgroundColor: "#fff",
    padding: 32, // Increased padding for a more spacious look
    borderRadius: 16, // Increased border radius for rounded corners
    elevation: 5,
  },
  title: {
    fontSize: 36, // Increased font size
    marginBottom: 24, // Increased margin bottom for more space
    textAlign: "center",
    color: "#f97316",
    fontWeight: "bold", // Made the title bold
  },
  input: {
    height: 50, // Increased height for larger input fields
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 24, // Increased margin bottom for more space between inputs
    padding: 12, // Increased padding for larger input fields
    borderRadius: 8, // Increased border radius for rounded corners
    fontSize: 18, // Increased font size for better readability
  },
  buttonContainer: {
    marginBottom: 24, // Increased margin bottom for more space
  },
  toggleText: {
    color: "#f97316",
    textAlign: "center",
    fontSize: 16, // Increased font size for better readability
  },
});
