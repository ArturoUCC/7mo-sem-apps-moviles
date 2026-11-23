import React, { useCallback, useEffect, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { supabase } from '../config/supabase';

export default function ListaProductos() {

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorMensaje, setErrorMensaje] = useState('');

  const consultarProductos = useCallback(async () => {

    setCargando(true);
    setErrorMensaje('');

    try {
      const { data, error } = await supabase
        .from('productos')
        .select('id, producto, descripcion, precio')
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      setProductos(data ?? []);

    } catch (error) {
      console.error('Error al consultar:', error);
      setErrorMensaje(error.message || 'Error al consultar');
    } finally {
      setCargando(false);
    }

  }, []);

  useEffect(() => {
    consultarProductos();
  }, [consultarProductos]);

  const renderProducto = ({ item }) => (
    <View style={styles.tarjeta}>
      <Text style={styles.nombre}>
        {item.producto}
      </Text>

      <Text style={styles.descripcion}>
        {item.descripcion}
      </Text>

      <Text style={styles.precio}>
        ${Number(item.precio).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.contenedor}>

      <Text style={styles.titulo}>
        Lista de productos
      </Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={consultarProductos}
        disabled={cargando}
      >
        <Text style={styles.textoBoton}>
          Actualizar lista
        </Text>
      </TouchableOpacity>

      {cargando ? (
        <ActivityIndicator
          size="large"
          color="#16875C"
        />
      ) : errorMensaje ? (
        <Text style={styles.error}>
          {errorMensaje}
        </Text>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No hay productos registrados.
            </Text>
          }
          contentContainerStyle={styles.lista}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({

  contenedor: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F8FA',
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#243B60',
    marginBottom: 15,
  },

  boton: {
    backgroundColor: '#16875C',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },

  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  lista: {
    paddingBottom: 25,
    flexGrow: 1,
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4DEE9',
  },

  nombre: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#243B60',
  },

  descripcion: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
  },

  precio: {
    fontSize: 18,
    color: '#16875C',
    fontWeight: 'bold',
    marginTop: 8,
  },

  error: {
    color: '#B91C1C',
    textAlign: 'center',
  },

  vacio: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 30,
  },

});
