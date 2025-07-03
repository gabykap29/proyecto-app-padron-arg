import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Alert, Animated, StatusBar } from "react-native";
import { Button, useTheme, Text, Card, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Configurar StatusBar
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("#0f172a");
    StatusBar.setTranslucent(true);

    // Animaciones de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const checkFirstTime = async () => {
      try {
        const firstLaunch = await AsyncStorage.getItem("firstLaunch");
        if (firstLaunch === null) {
          // Delay para que se vea la animación primero
          setTimeout(() => {
            Alert.alert(
              "Información Importante",
              "Si es la primera vez que instala la app o la reinstaló, su primera búsqueda puede tardar unos momentos. La base de datos se copiará en su dispositivo.",
              [{ text: "Entendido" }]
            );
          }, 1200);
          await AsyncStorage.setItem("firstLaunch", "true");
        }
      } catch (error) {
        console.error("Error al verificar el primer inicio:", error);
      }
    };

    checkFirstTime();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Logo con efecto de glow */}
        <View style={styles.logoContainer}>
          <Image source={require("./assets/sgi.png")} style={styles.logo} />
          <View style={styles.logoGlow} />
        </View>

        {/* Título principal */}
        <Text variant="displayLarge" style={styles.title}>
          Padrón ARG
        </Text>
        
        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          Sistema de Consulta de Datos
        </Text>

        {/* Separador decorativo */}
        <View style={styles.decorativeLine} />

        {/* Botones principales */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Create")}
            labelStyle={styles.buttonLabel}
            icon="cloud-upload"
            contentStyle={styles.buttonContent}
          >
            Cargar Datos
          </Button>

          <Button
            mode="contained"
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Search")}
            labelStyle={styles.buttonLabel}
            icon="magnify"
            contentStyle={styles.buttonContent}
          >
            Buscar Datos
          </Button>
        </View>

        {/* Card informativa opcional */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoContent}>
            <Text style={styles.infoText}>
              💡 Base de datos actualizada
            </Text>
            <Text style={styles.infoSubtext}>
              Información confiable y segura
            </Text>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Elementos decorativos de fondo */}
      <View style={styles.backgroundDecoration1} />
      <View style={styles.backgroundDecoration2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // Fondo oscuro principal
    paddingTop: 50,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3b82f6',
    opacity: 0.1,
    top: 0,
    left: 0,
  },
  title: {
    marginBottom: 8,
    fontWeight: "800",
    color: "#f1f5f9",
    fontSize: 36,
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "500",
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  primaryButton: {
    width: "80%",
    marginBottom: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  secondaryButton: {
    width: "80%",
    marginBottom: 16,
    backgroundColor: "#22c55e",
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonContent: {
    height: 56,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontWeight: "700",
    fontSize: 16,
    color: "white",
    letterSpacing: 0.5,
  },
  infoCard: {
    width: "85%",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  // Elementos decorativos de fondo
  backgroundDecoration1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#3b82f6',
    opacity: 0.05,
  },
  backgroundDecoration2: {
    position: 'absolute',
    bottom: 150,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#22c55e',
    opacity: 0.03,
  },
});

// Estilos adicionales que puedes usar
const additionalStyles = StyleSheet.create({
  // Versión alternativa con gradiente (si quieres experimentar)
  gradientButton: {
    width: "80%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  // Botón con borde brillante
  glowButton: {
    width: "80%",
    marginBottom: 16,
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  
  // Texto con efecto brillante
  glowText: {
    color: "#f1f5f9",
    textShadowColor: '#3b82f6',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});