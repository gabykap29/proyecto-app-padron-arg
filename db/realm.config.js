import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import Realm from 'realm';

// Importa el archivo padron.realm desde la carpeta assets
import padronRealm from '../assets/padron.realm';

const padronSchema = {
  name: 'Padron',
  primaryKey: 'id',
  properties: {
    id: 'int?',
    dni: 'string?',
    names: 'string?',
    lastname: 'string?',
    address: 'string?',
    clase: 'string?',
    locality: 'string?',
    province: 'string?',
    work: 'string?',
  },
};

// Obtener la ruta donde se almacenará el archivo de la base de datos
const getRealmPath = async () => {
  return `${FileSystem.documentDirectory}padron.realm`;
};

// Eliminar la base de datos existente
const deleteDatabaseIfExists = async () => {
  const realmPath = await getRealmPath();
  const fileExist = await FileSystem.getInfoAsync(realmPath);

  if (fileExist.exists) {
    try {
      await FileSystem.deleteAsync(realmPath);
      console.log("Base de datos existente eliminada.");
    } catch (error) {
      console.error("Error al eliminar la base de datos existente:", error);
    }
  }
};

// Copiar la base de datos desde los assets si es necesario
const copyDatabaseIfNeeded = async () => {
  const realmPath = await getRealmPath();
  const fileExist = await FileSystem.getInfoAsync(realmPath);

  if (!fileExist.exists) {
    try {
      console.log("Copiando base de datos...");
            // Eliminar la base de datos existente si es necesario
           // await deleteDatabaseIfExists();
      // Obtener el asset
      const asset = Asset.fromModule(padronRealm);

      // Descargar el asset si es necesario
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error("No se pudo obtener la URI del asset");
      }

      // Copiar el archivo desde los assets al directorio de documentos
      await FileSystem.copyAsync({
        from: asset.localUri,
        to: realmPath,
      });

      // Verificar el tamaño del archivo copiado
      const copiedFileInfo = await FileSystem.getInfoAsync(realmPath);
      console.log('Base de datos copiada al almacenamiento local. Tamaño:', copiedFileInfo.size, 'bytes');
    } catch (error) {
      console.error('Error al copiar la base de datos:', error);
    }
  } else {
    console.log("Base de datos ya existe, no es necesario copiarla.");
    
  }
};

// Abrir la base de datos de Realm
export const openRealm = async () => {
  await copyDatabaseIfNeeded();
  const realmPath = await getRealmPath();
  console.log("Abriendo base de datos en:", realmPath);
  return Realm.open({
    path: realmPath,
    schema: [padronSchema],
  });
};

// Contar el número de registros en la base de datos
export const countRecords = async () => {
  try {
    const realm = await openRealm();
    const totalRecords = realm.objects("Padron").length;
    console.log("Total de registros en la base de datos:", totalRecords);
    return totalRecords;
  } catch (error) {
    console.error("Error al contar registros:", error);
    return { error: 500, message: error.message };
  }
};

// Listar algunos registros de la base de datos
export const listRecords = async () => {
  try {
    const realm = await openRealm();
    const records = realm.objects("Padron").slice(0, 10); // Obtener los primeros 10 registros
    console.log("Registros en la base de datos:", records);
    return records;
  } catch (error) {
    console.error("Error al listar registros:", error);
    return { error: 500, message: error.message };
  }
};

export const findPerson = async (filters) => {
  try {
    filters = {
      names: filters.names || "",
      lastname: filters.lastname || "",
      address: filters.address || "",
      dni: filters.dni || "",
      clase: filters.clase || "",
      locality: filters.locality || "",
      province: filters.province || "",
      work: filters.work || "",
    };

    const realm = await openRealm();
    let query = [];

    if (filters.names) query.push(`names CONTAINS[c] "${filters.names}"`);
    if (filters.lastname) query.push(`lastname == "${filters.lastname}"`);
    if (filters.address) query.push(`address CONTAINS[c] "${filters.address}"`);
    if (filters.dni) query.push(`dni == "${filters.dni}"`);
    if (filters.clase) query.push(`clase == "${filters.clase}"`);
    if (filters.locality) query.push(`locality CONTAINS[c] "${filters.locality}"`);
    if (filters.province) query.push(`province == "${filters.province}"`);
    if (filters.work) query.push(`work == "${filters.work}"`);

    const queryString = query.length > 0 ? query.join(" AND ") : "TRUEPREDICATE";

    console.log("Consulta generada:", queryString);

    const result = realm.objects("Padron").filtered(queryString).slice(0, 30);
    const cant = await countRecords();
    await listRecords(); // Verificar los registros
    
    console.log("Resultados encontrados:", result.length);
    console.log("Cantidad de registros en la base de datos:", cant);
    
    return result;
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    return {
      error: 500,
      message: error.message + " contacte al desarrollador y capture el error con una captura de pantalla",
    };
  }
};