import React, { useEffect } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { Button, useTheme, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const theme = useTheme(); 
  const navigation = useNavigation();

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const firstLaunch = await AsyncStorage.getItem("firstLaunch");
        if (firstLaunch === null) {
          Alert.alert(
            "Información Importante",
            "Si es la primera vez que instala la app o la reinstaló, su primera búsqueda puede tardar unos momentos. La base de datos se copiará en su dispositivo.",
            [{ text: "Entendido" }]
          );
          await AsyncStorage.setItem("firstLaunch", "true"); // Marca como vista la alerta
        }
      } catch (error) {
        console.error("Error al verificar el primer inicio:", error);
      }
    };

    checkFirstTime();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={require("./assets/sgi.png")} style={styles.logo} />
      
      <Text variant="displayLarge" style={styles.title}>Padrón ARG</Text>

      <Button 
        mode="contained" 
        style={[styles.button, { backgroundColor: "#3498db" }]} 
        onPress={() => navigation.navigate("Create")}
        labelStyle={[styles.buttonLabel, { color: "white" }]}
        icon="cloud-upload"
      >
        Cargar Datos
      </Button>

      <Button 
        mode="contained" 
        style={[styles.button, { backgroundColor: "rgb(12, 69, 122)" }]} 
        onPress={() => navigation.navigate("Search")}
        labelStyle={[styles.buttonLabel, { color: "white" }]}
        icon="magnify"
      >
        Buscar Datos
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    marginBottom: 30,
    fontWeight: "bold",
    color: "white",
    fontSize: 32,
  },
  button: {
    width: "60%",
    marginBottom: 20,
    padding: 12,
    elevation: 5,
    alignItems: "center",
  },
  buttonLabel: {
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
