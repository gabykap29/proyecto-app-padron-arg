import { registerRootComponent } from 'expo';
import App from './App'; // Asegúrate de que la ruta sea correcta
import { MD3DarkTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

const theme = {
  ...DefaultTheme, // Tema base
  colors: {
    ...DefaultTheme.colors, // Mantén los colores por defecto del tema de Paper
    primary: '#3498db', // Colores personalizados si es necesario
    accent: '#f1c40f',
    secondary: '#f39c12',
    error: '#e74c3c',
  }
};

export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}

// Registrar Main como el componente raíz
registerRootComponent(Main);
