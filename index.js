import { registerRootComponent } from 'expo';
import App from './App'; // Asegúrate de que la ruta sea correcta
import { MD3DarkTheme as DefaultTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SearchScreen from './screens/Search.screen';
import CreateScreen from './screens/Create.screen';
const theme = {
  ...DefaultTheme, // Tema base
  colors: {
    ...DefaultTheme.colors, // Mantén los colores por defecto del tema de Paper
    primary: '#3498db', // Colores personalizados si es necesario
    accent: '#f1c40f',
    secondary: '#f39c12',
    error: '#e74c3c',
    backgraund: '#2c3e50',
  }
};

const Stack = createNativeStackNavigator();

export default function Main() {
  return (
    <PaperProvider theme={theme} style={[{ backgroundColor: theme.colors.backgraund }]}>
    <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={App}  />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="Create" component={CreateScreen} />
    </Stack.Navigator>
    </NavigationContainer>
    </PaperProvider>
  );
}

// Registrar Main como el componente raíz
registerRootComponent(Main);
