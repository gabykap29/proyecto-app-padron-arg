import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from "react-native";
import {
  TextInput,
  Button,
  useTheme,
  Card,
  Divider,
  Text,
  ActivityIndicator
} from "react-native-paper";
import * as Clipboard from "expo-clipboard"; // Importar portapapeles
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { findPerson } from "../db/sqlite.config";
import { StatusBar } from "react-native";

export default function SearchScreen() {


  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor(theme.colors.background);
    StatusBar.setTranslucent(true); // Esto elimina el espacio blanco bajo el StatusBar
  }, []);
  

  const theme = useTheme();
  const [filter, setFilter] = useState({
    names: "",
    lastname: "",
    address: "",
    dni: "",
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

  // Copiar datos al portapapeles
  const copiarAlPortapapeles = (item) => {
    const texto = `
      Apellido: ${item.lastname}
      Nombre: ${item.names}
      DNI: ${item.dni}
      Clase: ${item.clase}
      Domicilio: ${item.address}
      Localidad: ${item.locality}
      Provincia: ${item.province}
      Trabajo: ${item.work ?? "No especificado"}
    `;
    Clipboard.setStringAsync(texto);
    ToastAndroid.show("Datos copiados al portapapeles", ToastAndroid.SHORT);
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
      ToastAndroid.show("No se encontraron resultados", ToastAndroid.SHORT);
      console.log("No se encontraron resultados");
      setResultados([]);
    }
  };

  // Métodos para actualizar los filtros
  const setApellido = (lastname) =>
    setFilter((prevState) => ({ ...prevState, lastname }));
  const setNombre = (names) =>
    setFilter((prevState) => ({ ...prevState, names }));
  const handleDniChange = (dni) => {
    dniRef.current = dni;
    setDni(dni);
  };  
  const setDireccion = (address) =>
    setFilter((prevState) => ({ ...prevState, address }));
  const setClase = (clase) =>
    setFilter((prevState) => ({ ...prevState, clase }));
  const setLocalidad = (locality) =>
    setFilter((prevState) => ({ ...prevState, locality }));
  const setProvincia = (province) =>
    setFilter((prevState) => ({ ...prevState, province }));
  const setTrabajo = (work) =>
    setFilter((prevState) => ({ ...prevState, work }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.flexContainer, { backgroundColor: theme.colors.background }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <FlatList
        data={[{ id: "header", type: "header" }, ...resultados]}
        keyExtractor={(item, index) => item.id || index.toString()}
        ListHeaderComponent={
          <Card style={styles.card} key={filter.dni}>
            <Card.Title
              title="Consulta de Personas"
              subtitle="Ingrese los datos para buscar"
            />
            <Card.Content>
              <TextInput
                label="Apellido"
                value={filter.lastname}
                onChangeText={setApellido}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Nombre"
                value={filter.names}
                onChangeText={setNombre}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="DNI"
                value={dni}
                onChangeText={handleDniChange}
                onBlur={()=>{
                  setFilter((prev)=>({...prev, dni: dniRef.current}))
                }}
                style={styles.input}
                keyboardType="numeric"
                mode="outlined"
              />

              <Button
                mode="contained"
                onPress={() => setMostrarFiltros(!mostrarFiltros)}
                style={styles.filtroButton}
                icon={mostrarFiltros ? "chevron-up" : "chevron-down"}
                labelStyle={{ color: "white" }}
              >
                Filtros Avanzados
              </Button>

              {mostrarFiltros && (
                <View style={styles.filtrosContainer}>
                  <Divider style={{ marginVertical: 10 }} />
                  <TextInput
                    label="Clase"
                    value={filter.clase}
                    onChangeText={setClase}
                    style={styles.input}
                    keyboardType="numeric"
                    mode="outlined"
                  />
                  <TextInput
                    label="Dirección"
                    value={filter.address}
                    onChangeText={setDireccion}
                    style={styles.input}
                    mode="outlined"
                  />
                  <TextInput
                    label="Localidad"
                    value={filter.locality}
                    onChangeText={setLocalidad}
                    style={styles.input}
                    mode="outlined"
                  />
                  <TextInput
                    label="Provincia"
                    value={filter.province}
                    onChangeText={setProvincia}
                    style={styles.input}
                    mode="outlined"
                  />
                  <TextInput
                    label="Situación Laboral / Trabajo"
                    value={filter.work}
                    onChangeText={setTrabajo}
                    style={styles.input}
                    mode="outlined"
                  />
                </View>
              )}

              <Button
                mode="contained"
                style={styles.buscarButton}
                icon="magnify"
                onPress={buscarDatos}
                disabled={loading}
                labelStyle={{ color: "white" }}
              >
                  {loading ? <ActivityIndicator animating={true} color="white" /> : "Buscar"}
              </Button>
            </Card.Content>
            <Text style={{ color: "white", textAlign: "center", marginTop: 10 }}>
              {count > 0 ? `Se encontraron ${count} resultados, recuerda que el limite es 30` : ""}
            </Text>
          </Card>
        }
        ListEmptyComponent={<Text style={styles.noResultados}>No hay resultados</Text>}
        renderItem={({ item }) => {
          if (item.type === "header") return null;
          return (
            <Card style={styles.resultadoCard}>
              <Card.Title title={`${item.lastname}, ${item.names}`} subtitle={`DNI: ${item.dni}`} />
              <Card.Content>
                <Text>Clase: {item.clase}</Text>
                <Text>Domicilio: {item.address}</Text>
                <Text>Localidad: {item.locality}</Text>
                <Text>Provincia: {item.province}</Text>
                <Text>Trabajo: {item.work ?? "No especificado"}</Text>
              </Card.Content>
              <Card.Actions>
                <Button icon="content-copy" mode="outlined" onPress={() => copiarAlPortapapeles(item)}>
                  Copiar
                </Button>
              </Card.Actions>
            </Card>
          );
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    marginTop: 0,
    paddingTop: 30,
    backgroundColor: "black",
    marginBottom: 0,
    paddingBottom: 0,
  },
  card: {
    paddingTop: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  input: {
    marginBottom: 15,
  },
  filtroButton: {
    marginTop: 10,
    backgroundColor: "rgb(55, 58, 61)",
  },
  filtrosContainer: {
    marginTop: 10,
  },
  buscarButton: {
    marginTop: 20,
    backgroundColor: "rgb(12, 69, 122)",
  },
  noResultados: {
    textAlign: "center",
    marginTop: 10,
    color: "gray",
  },
  resultadoCard: {
    marginTop: 10,
    paddingTop: 10,
  },
});

