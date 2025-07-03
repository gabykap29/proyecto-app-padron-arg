import { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Animated,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  useTheme,
  Card,
  Divider,
  Text,
  ActivityIndicator,
  IconButton,
  Surface,
  Badge,
} from "react-native-paper";
import * as Clipboard from "expo-clipboard";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { findPerson } from "../db/sqlite.config";
import { StatusBar } from "react-native";
import { Keyboard } from "react-native";
import { ScrollView } from "react-native";

export default function SearchScreen() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
  
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
  
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("#0f172a");
    StatusBar.setTranslucent(false);
  }, []);

  const theme = useTheme();
  const [filter, setFilter] = useState({
    names: "",
    lastname: "",
    address: "",
    alternative_address: "",
    dni: 0,
    clase: "",
    locality: "",
    province: "",
    work: "",
  });

  const dniRef = useRef(filter.dni); 
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [dni, setDni] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate("Home");
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);

  // Animación para filtros avanzados
  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: mostrarFiltros ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [mostrarFiltros]);

  // Copiar datos al portapapeles
  const copiarAlPortapapeles = (item) => {
    // Animación de feedback
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const texto = `
      Apellido: ${item.lastname}
      Nombre: ${item.names}
      DNI: ${item.dni}
      Clase: ${item.clase}
      Domicilio: ${item.address}
      Dirección Alternativa: ${item.alternative_address ?? "No especificada"}
      Localidad: ${item.locality}
      Provincia: ${item.province}
      Trabajo: ${item.work ?? "No especificado"}
    `;
    Clipboard.setStringAsync(texto);
    ToastAndroid.show("✅ Datos copiados al portapapeles", ToastAndroid.SHORT);
  };

  // Buscar datos
  const buscarDatos = async () => {
    setLoading(true);
    const data = await findPerson(filter);
    console.log("Resultados de búsqueda:", data);
    setLoading(false);
    setCount(data.length);
    if (Array.isArray(data) && data.length > 0) {
      setResultados(data);
    } else {
      ToastAndroid.show("🔍 No se encontraron resultados", ToastAndroid.SHORT);
      console.log("No se encontraron resultados");
      setResultados([]);
    }
  };

  // Métodos para actualizar los filtros
  const setApellido = (lastname) =>
    setFilter((prevState) => ({ ...prevState, lastname }));
  const setNombre = (names) =>
    setFilter((prevState) => ({ ...prevState, names }));
  const handleDniChange = (value) => {
    setDni(value);
    setFilter((prev) => ({ ...prev, dni: value }));
};

  const setDireccion = (address) =>
    setFilter((prevState) => ({ ...prevState, address }));
  const setAlternativeAddress = (alternative_address) =>
    setFilter((prevState) => ({ ...prevState, alternative_address }));
  const setClase = (clase) =>
    setFilter((prevState) => ({ ...prevState, clase }));
  const setLocalidad = (locality) =>
    setFilter((prevState) => ({ ...prevState, locality }));
  const setProvincia = (province) =>
    setFilter((prevState) => ({ ...prevState, province }));
  const setTrabajo = (work) =>
    setFilter((prevState) => ({ ...prevState, work }));

  const limpiarFiltros = () => {
    setFilter({
      names: "",
      lastname: "",
      address: "",
      alternative_address: "",
      dni: "",
      clase: "",
      locality: "",
      province: "",
      work: "",
    });
    setDni("");
    setResultados([]);
    setCount(0);
  };

  const renderHeader = () => (
    <Surface style={styles.headerContainer}>
      {/* Header con gradiente */}
      <View style={styles.headerGradient}>
        <Text style={styles.headerTitle}>🔍 Consulta de Personas</Text>
        <Text style={styles.headerSubtitle}>
          Encuentra información detallada de manera rápida y segura
        </Text>
      </View>

      {/* Formulario principal */}
      <Card style={styles.mainCard}>
        <Card.Content style={styles.cardContent}>
          {/* Campos principales */}
          <View style={styles.mainFieldsContainer}>
            <Text style={styles.sectionTitle}>📋 Datos Principales</Text>
            
            <View style={styles.fieldRow}>
              <TextInput
                label="👤 Apellido"
                value={filter.lastname}
                onChangeText={setApellido}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
                theme={{ colors: { primary: '#3b82f6' } }}
              />
              <TextInput
                label="✏️ Nombre"
                value={filter.names}
                onChangeText={setNombre}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
                theme={{ colors: { primary: '#3b82f6' } }}
              />
            </View>

            <TextInput
              label="🆔 DNI"
              value={dni}
              onChangeText={handleDniChange}
              onBlur={() => {
                setFilter((prev) => ({ ...prev, dni: dniRef.current }));
              }}
              style={styles.input}
              keyboardType="numeric"
              mode="outlined"
              theme={{ colors: { primary: '#3b82f6' } }}
            />
          </View>

          {/* Botón de filtros avanzados */}
          <Button
            mode="contained"
            onPress={() => setMostrarFiltros(!mostrarFiltros)}
            style={styles.filtroButton}
            icon={mostrarFiltros ? "chevron-up" : "chevron-down"}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
          >
            {mostrarFiltros ? "Ocultar Filtros" : "Filtros Avanzados"}
          </Button>

          {/* Filtros avanzados con animación */}
          <Animated.View
            style={[
              styles.filtrosContainer,
              {
                maxHeight: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 400],
                }),
                opacity: slideAnimation,
              },
            ]}
          >
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>🎯 Filtros Avanzados</Text>
            
            <View style={styles.fieldRow}>
              <TextInput
                label="📅 Clase"
                value={filter.clase}
                onChangeText={setClase}
                style={[styles.input, styles.halfWidth]}
                keyboardType="numeric"
                mode="outlined"
                theme={{ colors: { primary: '#3b82f6' } }}
              />
              <TextInput
                label="🏠 Dirección"
                value={filter.address}
                onChangeText={setDireccion}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
                theme={{ colors: { primary: '#3b82f6' } }}
              />
            </View>

            <View style={styles.fieldRow}>
              <TextInput
                label="🌍 Localidad"
                value={filter.locality}
                onChangeText={setLocalidad}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
                theme={{ colors: { primary: '#3b82f6' } }}
              />
              <TextInput
                label="🏛️ Provincia"
                value={filter.province}
                onChangeText={setProvincia}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
                theme={{ colors: { primary: '#3b82f6' } }}
              />
            </View>

            <TextInput
              label="💼 Situación Laboral / Trabajo"
              value={filter.work}
              onChangeText={setTrabajo}
              style={styles.input}
              mode="outlined"
              theme={{ colors: { primary: '#3b82f6' } }}
            />
          </Animated.View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              style={styles.buscarButton}
              icon="magnify"
              onPress={buscarDatos}
              disabled={loading}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator animating={true} color="white" size="small" />
                  <Text style={styles.loadingText}>Buscando...</Text>
                </View>
              ) : (
                "🔍 Buscar"
              )}
            </Button>
            
            <Button
              mode="outlined"
              style={styles.limpiarButton}
              icon="refresh"
              onPress={limpiarFiltros}
              labelStyle={styles.outlinedButtonLabel}
              contentStyle={styles.buttonContent}
            >
              🧹 Limpiar
            </Button>
          </View>

          {/* Contador de resultados */}
          {count > 0 && (
            <Surface style={styles.resultsCounter}>
              <Text style={styles.counterText}>
                ✅ {count} resultado{count > 1 ? 's' : ''} encontrado{count > 1 ? 's' : ''}
              </Text>
              {count >= 30 && (
                <Text style={styles.limitText}>
                  ⚠️ Se muestran máximo 30 resultados
                </Text>
              )}
            </Surface>
          )}
        </Card.Content>
      </Card>
    </Surface>
  );

  const renderResultItem = ({ item }) => {
    if (item.type === "header") return null;
    
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
        <Card style={styles.resultCard}>
          <Card.Content>
            {/* Header del resultado */}
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleContainer}>
                <Text style={styles.resultName}>
                  {item.lastname}, {item.names}
                </Text>
                <Badge style={styles.dniBadge}>
                  DNI: {item.dni}
                </Badge>
              </View>
              <IconButton
                icon="content-copy"
                size={20}
                iconColor="#3b82f6"
                onPress={() => copiarAlPortapapeles(item)}
                style={styles.copyIcon}
              />
            </View>

            {/* Información del resultado */}
            <View style={styles.resultInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 Clase:</Text>
                <Text style={styles.infoValue}>{item.clase}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏠 Domicilio:</Text>
                <Text style={styles.infoValue}>{item.address}</Text>
              </View>
              
              {item.alternative_address && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📍 Dir. Alternativa:</Text>
                  <Text style={styles.infoValue}>{item.alternative_address}</Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🌍 Localidad:</Text>
                <Text style={styles.infoValue}>{item.locality}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏛️ Provincia:</Text>
                <Text style={styles.infoValue}>{item.province}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>💼 Trabajo:</Text>
                <Text style={styles.infoValue}>
                  {item.work || "No especificado"}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

return (
      <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"} // cambiar height a padding
      style={styles.container}
      keyboardVerticalOffset={0}
      >

    <FlatList
      ListHeaderComponent={
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
        </ScrollView>
      }
      data={resultados}
      keyExtractor={(item, index) => item.id || index.toString()}
      contentContainerStyle={[
        styles.listContainer,
        { paddingBottom: keyboardVisible ? 0 : 0, backgroundColor: "#0f172a"}
      ]}
      ListEmptyComponent={
        resultados.length === 0 && count === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              Realiza una búsqueda para ver los resultados
            </Text>
          </View>
        ) : null
      }
      renderItem={renderResultItem}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: "#0f172a", flex: 1 }}
    />
    
  </KeyboardAvoidingView>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 30,
  },
  listContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: "transparent",
    elevation: 0,
    marginBottom: 10,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#1e293b",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f1f5f9",
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    fontStyle: "italic",
  },
  mainCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: '#1e293b',
  },
  cardContent: {
    padding: 20,
  },
  mainFieldsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: 15,
    textAlign: "left",
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 12,
  },
  halfWidth: {
    flex: 1,
  },
  filtroButton: {
    backgroundColor: "#475569",
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 10,
  },
  buttonLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContent: {
    height: 48,
  },
  filtrosContainer: {
    overflow: 'hidden',
    marginTop: 10,
  },
  divider: {
    backgroundColor: "#374151",
    height: 1,
    marginVertical: 15,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  buscarButton: {
    flex: 2,
    backgroundColor: "#3b82f6",
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  limpiarButton: {
    flex: 1,
    borderColor: "#64748b",
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: 'transparent',
  },
  outlinedButtonLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsCounter: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderRadius: 15,
    padding: 12,
    marginTop: 20,
    elevation: 2,
  },
  counterText: {
    color: "#22c55e",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  limitText: {
    color: "#f59e0b",
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
  },
  keyboardSpacer: {
  height: 100, 
  backgroundColor: "#0f172a", 
},

  resultCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#1e293b',
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  resultTitleContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f1f5f9",
    marginBottom: 8,
  },
  dniBadge: {
    backgroundColor: "#3b82f6",
    color: "white",
    alignSelf: "flex-start",
  },
  copyIcon: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 8,
  },
  resultInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
    minWidth: 120,
  },
  infoValue: {
    fontSize: 14,
    color: "#f1f5f9",
    flex: 1,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    fontStyle: "italic",
  },
});