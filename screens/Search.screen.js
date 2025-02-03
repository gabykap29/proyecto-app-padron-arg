import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ToastAndroid } from 'react-native';
import { TextInput, Button, useTheme, Card, Divider, IconButton, Text } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard'; // Importar portapapeles
import { useNavigation } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { findPerson } from '../db/realm.config';

export default function SearchScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState({
    names: '',
    lastname: '',
    address: '',
    dni: '',
    clase: '',
    locality: '',
    province: '',
    work: '',
  });

  const [resultados, setResultados] = useState([]); // Estado para almacenar los resultados
  const [loading, setLoading] = useState(false); // Estado para mostrar un indicador de carga
  const navigation = useNavigation();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Home');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Función para copiar datos al portapapeles
  const copiarAlPortapapeles = (item) => {
    const texto = `
      Apellido: ${item.apellido}
      Nombre: ${item.nombre}
      DNI: ${item.dni}
      Clase: ${item.clase}
      Localidad: ${item.localidad}
      Provincia: ${item.provincia}
      Trabajo: ${item.trabajo}
    `;

    Clipboard.setStringAsync(texto); // Copiar al portapapeles
    ToastAndroid.show('Datos copiados al portapapeles', ToastAndroid.SHORT); // Mostrar notificación en Android
  };

  // Simula la búsqueda de datos
  const buscarDatos = async () => {
    setLoading(true); // Mostrar indicador de carga
    const data = await findPerson(filter);
    setLoading(false); // Ocultar indicador de carga
      // Asegúrate de que `data` sea un arreglo
  if (Array.isArray(data)) {
    if (data.length === 0) {
      ToastAndroid.show('No se encontraron resultados', ToastAndroid.SHORT);
      console.log('No se encontraron resultados');
      return;
    }
    setResultados([data]);
  } else {
    // Si `data` no es un arreglo, muestra un mensaje o maneja el error
    ToastAndroid.show('Error en los resultados de búsqueda', ToastAndroid.SHORT);
    console.log('Error en los resultados de búsqueda');
    return;
  }

    setResultados(data);
  };

  const setApellido = (apellido) => setFilter(prevState => ({ ...prevState, lastname: apellido }));
  const setNombre = (nombre) => setFilter(prevState => ({ ...prevState, names: nombre }));
  const setDni = (dni) => setFilter(prevState => ({ ...prevState, dni: dni }));
  const setDireccion = (direccion) => setFilter(prevState => ({ ...prevState, address: direccion }));
  const setClase = (clase) => setFilter(prevState => ({ ...prevState, clase: clase }));
  const setLocalidad = (localidad) => setFilter(prevState => ({ ...prevState, locality: localidad }));
  const setProvincia = (provincia) => setFilter(prevState => ({ ...prevState, province: provincia }));
  const setTrabajo = (trabajo) => setFilter(prevState => ({ ...prevState, work: trabajo }));
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.flexContainer, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={[
          {
            id: 'header',
            type: 'header', // Esto es solo para identificar la tarjeta de búsqueda
          },
          ...resultados,
        ]}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          // Tarjeta de búsqueda
          <Card style={styles.card}>
            <Card.Title title="Consulta de Personas" subtitle="Ingrese los datos para buscar" />
            <Card.Content>
              <TextInput label="Apellido" value={filter.lastname} onChangeText={setApellido} style={styles.input} mode="outlined" />
              <TextInput label="Nombre" value={filter.names} onChangeText={setNombre} style={styles.input} mode="outlined" />
              <TextInput label="DNI" value={filter.dni} onChangeText={setDni} style={styles.input} keyboardType="numeric" mode="outlined" />

              <Button mode="contained" onPress={() => setMostrarFiltros(!mostrarFiltros)} style={styles.filtroButton} icon={mostrarFiltros ? 'chevron-up' : 'chevron-down'}>
                Filtros Avanzados
              </Button>

              {mostrarFiltros && (
                <View style={styles.filtrosContainer}>
                  <Divider style={{ marginVertical: 10 }} />
                  <TextInput label="Clase" value={filter.clase} onChangeText={setClase} style={styles.input} keyboardType="numeric" mode="outlined" />
                 <TextInput label="Dirección" value={filter.address} onChangeText={setDireccion} style={styles.input} mode="outlined" />
                  <TextInput label="Localidad" value={filter.locality} onChangeText={setLocalidad} style={styles.input} mode="outlined" />
                  <TextInput label="Provincia" value={filter.province} onChangeText={setProvincia} style={styles.input} mode="outlined" />
                  <TextInput label="Situación Laboral / Trabajo" value={filter.work} onChangeText={setTrabajo} style={styles.input} mode="outlined" />
                </View>
              )}

              <Button mode="contained" style={styles.buscarButton} icon="magnify" onPress={buscarDatos}>
                Buscar
              </Button>
            </Card.Content>
          </Card>
        }
        ListEmptyComponent={
          // Componente cuando no hay resultados
          <Text style={styles.noResultados}>No hay resultados</Text>
        }
        renderItem={({ item }) => {
          if (item.type === 'header') return null; // No renderizamos la tarjeta de búsqueda en los resultados

          return (
            <Card style={styles.resultadoCard}>
              <Card.Title title={`${item.apellido}, ${item.nombre}`} subtitle={`DNI: ${item.dni}`} />
              <Card.Content>
                <Text>Clase: {item.clase}</Text>
                <Text>Localidad: {item.localidad}</Text>
                <Text>Provincia: {item.provincia}</Text>
                <Text>Trabajo: {item.trabajo}</Text>
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
    marginTop: 40,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    padding: 15,
    borderRadius: 10,
  },
  input: {
    marginBottom: 15,
  },
  filtroButton: {
    marginTop: 10,
    backgroundColor: '#f39c12',
  },
  filtrosContainer: {
    marginTop: 10,
  },
  buscarButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
  },
  resultadosTitulo: {
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noResultados: {
    textAlign: 'center',
    marginTop: 10,
    color: 'gray',
  },
  resultadoCard: {
    marginTop: 10,
    padding: 10,
  },
});
