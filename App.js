import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { Text } from 'react-native-paper';

export default function App() {
  const theme = useTheme(); // Usa el tema oscuro de Paper

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Imagen del logo */}
      <Image source={require('./assets/sgi.png')} style={styles.logo} />
      
      <Text variant="displayLarge" style={styles.title}>
        Padrón ARG
      </Text>

      <Button 
        mode="contained" 
        style={[styles.button, { backgroundColor: '#3498db' }]} 
        onPress={() => console.log('Cargar')}
        labelStyle={[styles.buttonLabel, { color: 'white' }]}
        icon="cloud-upload" 
      >
        Cargar Datos
      </Button>

      <Button 
        mode="contained" 
        style={[styles.button, { backgroundColor: 'rgb(12, 69, 122)' }]} 
        onPress={() => console.log('Buscar')}
        labelStyle={[styles.buttonLabel, { color: 'white' }]}
        icon={'magnify'}
      >
        Buscar Datos
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50, // Añadir espacio para el logo
  },
  logo: {
    width: 100,  // Ajusta el tamaño del logo según sea necesario
    height: 100, // Ajusta el tamaño del logo según sea necesario
    marginBottom: 20, // Espacio debajo del logo
  },
  title: {
    marginBottom: 30,
    fontWeight: 'bold',
    color: 'white',
    fontSize: 32, // Tamaño de fuente para mejor legibilidad
  },
  button: {
    width: '60%',
    marginBottom: 20,
    padding: 12,
    elevation: 5, // Sombra para profundidad
    alignItems: 'center', // Asegura que el texto esté centrado en el botón
  },
  buttonLabel: {
    fontWeight: 'bold', // Etiquetas de botones más destacadas
    textTransform: 'uppercase', // Hacer que los textos sean más llamativos
  },
});
