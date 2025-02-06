import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { TextInput, Button, Card, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { savePerson, getOnePerson } from "../db/sqlite.config"; // Función para guardar o obtener la persona en la BD
import { useTheme } from "react-native-paper";

export default function CreateEditPersonScreen() {
  const [person, setPerson] = useState({
    lastname: "",
    names: "",
    dni: "",
    clase: "",
    address: "",
    locality: "",
    province: "",
    work: ""
  });

  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const theme = useTheme();

  // Manejar los cambios en los campos
  const handleChange = (key, value) => {
    setPerson(prev => ({ ...prev, [key]: value }));
  };

  // Función para cargar los datos de la persona si el DNI ya existe
  const loadPerson = async (dni) => {
    if (dni) {
      try {
        const personFromDB = await getOnePerson(dni); // Obtener persona desde la base de datos
        if (personFromDB) {
          setPerson(personFromDB); // Si existe, actualizamos el estado
        } else {
          // Si no existe, limpiamos los campos relevantes o los dejamos vacíos
          setPerson(prev => ({
            ...prev,
            lastname: "",
            names: "",
            clase: "",
            address: "",
            locality: "",
            province: "",
            work: ""
          }));
        }
      } catch (error) {
        console.error("Error al cargar persona:", error);
      }
    }
  };

  // Función que se llama cuando el campo DNI pierde el foco (onBlur)
  const handleDniBlur = () => {
    loadPerson(person.dni); // Llamar a la función para cargar la persona cuando el DNI pierde el foco
  };

  // Función para guardar la persona
  const guardarPersona = async () => {
    setLoading(true);
    try {
      await savePerson(person); // Llamada a la función que guarda la persona
      navigation.goBack(); // Vuelve a la pantalla anterior tras guardar
    } catch (error) {
      console.error("Error al guardar persona:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={[styles.card, { backgroundColor: theme.colors.background }]}>
          <Card.Title title="Crear o Editar Persona" />
          <Text style={{ color: "white", textAlign: "center", marginBottom: 20 }}>
            Si la persona ya existe, ingrese el DNI y modifique los datos.
          </Text>
          <Card.Content>
            <TextInput
              label="DNI"
              value={person.dni}
              onChangeText={text => handleChange("dni", text)}
              onBlur={handleDniBlur}  // Llamamos a la función cuando el campo pierde el foco
              style={styles.input}
              keyboardType="numeric"
              mode="outlined"
            />
            <TextInput
              label="Apellido"
              value={person.lastname}
              onChangeText={text => handleChange("lastname", text)}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Nombre"
              value={person.names}
              onChangeText={text => handleChange("names", text)}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Clase"
              value={person.clase}
              onChangeText={text => handleChange("clase", text)}
              style={styles.input}
              keyboardType="numeric"
              mode="outlined"
            />
            <TextInput
              label="Dirección"
              value={person.address}
              onChangeText={text => handleChange("address", text)}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Localidad"
              value={person.locality}
              onChangeText={text => handleChange("locality", text)}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Provincia"
              value={person.province}
              onChangeText={text => handleChange("province", text)}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Situación Laboral / Trabajo"
              value={person.work}
              onChangeText={text => handleChange("work", text)}
              style={styles.input}
              mode="outlined"
            />

            <Button
              mode="contained"
              style={styles.guardarButton}
              onPress={guardarPersona}
              disabled={loading}
              labelStyle={{ color: "white" }}
            >
              {loading ? "Guardando..." : "Guardar Persona"}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Asegura que el contenedor ocupe todo el espacio disponible
    paddingTop: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  card: {
    paddingTop: 30,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 0,
  },
  input: {
    marginBottom: 20,
  },
  guardarButton: {
    marginTop: 20,
    backgroundColor: "rgb(12, 69, 122)",
  },
});
