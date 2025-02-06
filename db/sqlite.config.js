import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const dbName = 'padron.db';

// Función para obtener la ruta de la base de datos
const getDataBasePath = async () => {
  return `${FileSystem.documentDirectory}SQLite/${dbName}`;
};

// Función para copiar la base de datos si no existe
const copyDataBase = async () => {
  const dbPath = await getDataBasePath();
  const exists = await FileSystem.getInfoAsync(dbPath);

  if (!exists.exists) {
    console.log('Copiando base de datos...');
    await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite/`, { intermediates: true });
    const asset = Asset.fromModule(require('../assets/padron.db'));
    await asset.downloadAsync();

    if (!asset.localUri) {
      throw new Error('Error al descargar la base de datos');
    }

    await FileSystem.copyAsync({
      from: asset.localUri,
      to: dbPath,
    });
    console.log('Base de datos copiada con éxito');
  } else {
    console.log('Base de datos ya existe');
  }
};

// Abrir la base de datos de forma asíncrona
let dbInstance = null;

const openDataBase = async () => {
  try {
    if (dbInstance) return dbInstance; // Reusar la conexión si ya está abierta
    await copyDataBase();
    dbInstance = await SQLite.openDatabaseAsync(dbName);
    if (!dbInstance) throw new Error("No se pudo abrir la base de datos");
    console.log('Base de datos abierta con éxito');
    return dbInstance;
  } catch (error) {
    console.error('Error al abrir la base de datos', error);
    throw error;
  }
};

// Función para buscar personas
export const findPerson = async (filters) => {
  try {
    const db = await openDataBase();
    let query = "SELECT * FROM padron WHERE 1=1";
    let params = [];

    // Agregar filtros dinámicos
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query += ` AND ${key} LIKE ?`;
        params.push(`%${value.trim().replace(/\s+/g, '%')}%`);
      }
    });

    if (params.length === 0) {
      console.log('No se ingresaron filtros');
      return [];
    }
    query += ' LIMIT 30';
    console.log(query, params);
    
    const result = await db.getAllAsync(query, params);
    console.log('Resultados de búsqueda:', result);

    if (result.length === 0) {
      console.log('No se encontraron resultados');
    }

    return result;
  } catch (error) {
    console.error('Error buscando persona:', error);
    return [];
  }
};
