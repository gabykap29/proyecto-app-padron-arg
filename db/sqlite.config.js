import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const dbName = 'padron.db';

const getDataBasePath = async () => {
  return `${FileSystem.documentDirectory}SQLite/${dbName}`;
};

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

    await FileSystem.copyAsync({ from: asset.localUri, to: dbPath });
    console.log('Base de datos copiada con éxito');
  } else {
    console.log('Base de datos ya existe');
  }
};

const openDataBase = async () => {
  await copyDataBase();
  const db = await SQLite.openDatabaseAsync(dbName);
  if (!db) throw new Error('No se pudo abrir la base de datos');
  console.log('Base de datos abierta con éxito');
  return db;
};

const closeDatabase = async (db) => {
  if (db) {
    try {
      await db.closeAsync();
      console.log('Base de datos cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar la base de datos:', error);
    }
  }
};

export const findPerson = async (filters, keepOpen = false) => {
  const db = await openDataBase();
  try {
    let query = "SELECT * FROM padron WHERE 1=1";
    let params = [];
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
    return result;
  } catch (error) {
    console.error('Error buscando persona:', error);
    return [];
  } finally {
    if (!keepOpen) await closeDatabase(db);
  }
};

export const getOnePerson = async (dni) => {
  try {
    const person = await findPerson({ dni }, false);
    return person.length > 0 ? person[0] : null;
  } catch (error) {
    console.error('Error al buscar persona:', error);
    return null;
  }
};

export const savePerson = async (person) => {
  const db = await openDataBase();
  try {
    await db.runAsync('BEGIN TRANSACTION');
    const exists = await findPerson({ dni: person.dni }, true);

    if (exists.length > 0) {
      await db.runAsync(
        'UPDATE padron SET lastname = ?, names = ?, clase = ?, address = ?, locality = ?, province = ?, work = ? WHERE dni = ?',
        [person.lastname, person.names, person.clase, person.address, person.locality, person.province, person.work, person.dni]
      );
      console.log('Persona actualizada con éxito');
    } else {
      await db.runAsync(
        'INSERT INTO padron (dni, lastname, names, clase, address, locality, province, work) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [person.dni, person.lastname, person.names, person.clase, person.address, person.locality, person.province, person.work]
      );
      console.log('Persona guardada con éxito');
    }

    await db.runAsync('COMMIT');
    return true;
  } catch (error) {
    console.error('Error al guardar persona:', error);
    await db.runAsync('ROLLBACK');
    return false;
  } finally {
    await closeDatabase(db);
  }
};