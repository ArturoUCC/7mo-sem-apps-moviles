import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import { supabase } from '../config/supabase';

export default function EliminarProducto() {

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    consultarProductos();
  }, []);

  // Consultar todos los productos
  const consultarProductos = async () => {
    setCargando(true);

    try {
      const { data, error } = await supabase
        .from('productos')
        .select('id, producto, descripcion, precio')
        .order('id', { ascending: true });

      if (error) throw error;

      setProductos(data ?? []);

    } catch (error) {
      console.error('Error al consultar:', error);
      Alert.alert('Error', error.message);

    } finally {
      setCargando(false);
    }
  };

  // Solicitar confirmación antes de eliminar
  const confirmarEliminacion = (item) => {

    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar "${item.producto}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarProducto(item.id),
        },
      ]
    );
  };

  // Eliminar el producto desde Supabase
  const eliminarProducto = async (id) => {

    setEliminandoId(id);

    try {
      const { data, error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          'No se encontró el producto para eliminar'
        );
      }

      Alert.alert(
        'Éxito',
        'Producto eliminado correctamente'
      );

      // Actualizar la lista local
      setProductos((anteriores) =>
        anteriores.filter((item) => item.id !== id)
      );

    } catch (error) {

      console.error('Error al eliminar:', error);

      Alert.alert(
        'Error',
        error.message || 'No se pudo eliminar'
      );

    } finally {
      setEliminandoId(null);
    }
  };

  // Diseño de cada producto
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

      <TouchableOpacity
        style={styles.botonEliminar}
        onPress={() => confirmarEliminacion(item)}
        disabled={eliminandoId !== null}
      >
        {eliminandoId === item.id ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBoton}>
            Eliminar producto
          </Text>
        )}
      </TouchableOpacity>

    </View>
  );

  return (
    <View style={styles.contenedor}>

      <Text style={styles.titulo}>
        Eliminar productos
      </Text>

      <TouchableOpacity
        style={styles.botonActualizar}
        onPress={consultarProductos}
        disabled={cargando || eliminandoId !== null}
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
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No hay productos registrados
            </Text>
          }
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
    color: '#243B60',
    textAlign: 'center',
    marginBottom: 20,
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

  botonEliminar: {
    backgroundColor: '#DC3545',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },

  botonActualizar: {
    backgroundColor: '#16875C',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },

  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  lista: {
    paddingBottom: 30,
  },

  vacio: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 30,
  },

});
