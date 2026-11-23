import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import { supabase } from '../config/supabase';

export default function ActualizarProducto() {

  const [productos, setProductos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  const [producto, setProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');

  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    consultarProductos();
  }, []);

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
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarProducto = (item) => {
    setSeleccionado(item);

    setProducto(item.producto);
    setDescripcion(item.descripcion);
    setPrecio(String(item.precio));
  };

  const actualizarProducto = async () => {

    if (
      !producto.trim() ||
      !descripcion.trim() ||
      !precio.trim()
    ) {
      Alert.alert('Aviso', 'Completa todos los campos');
      return;
    }

    const precioNumero = Number(precio.replace(',', '.'));

    if (
      !Number.isFinite(precioNumero) ||
      precioNumero < 0 ||
      precioNumero > 99999999.99
    ) {
      Alert.alert('Error', 'Ingresa un precio válido');
      return;
    }

    if (!seleccionado) return;

    setGuardando(true);

    try {
      const { data, error } = await supabase
        .from('productos')
        .update({
          producto: producto.trim(),
          descripcion: descripcion.trim(),
          precio: precioNumero,
        })
        .eq('id', seleccionado.id)
        .select('id');

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          'No se encontró el producto para actualizar'
        );
      }

      Alert.alert(
        'Éxito',
        'Producto actualizado correctamente'
      );

      setSeleccionado(null);
      await consultarProductos();

    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', error.message);
    } finally {
      setGuardando(false);
    }
  };

  const renderProducto = ({ item }) => (
    <TouchableOpacity
      style={styles.tarjeta}
      onPress={() => seleccionarProducto(item)}
    >
      <Text style={styles.nombre}>{item.producto}</Text>

      <Text style={styles.descripcion}>
        {item.descripcion}
      </Text>

      <Text style={styles.precio}>
        ${Number(item.precio).toFixed(2)}
      </Text>

      <Text style={styles.editar}>
        Tocar para editar
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedor}>

      <Text style={styles.titulo}>
        Actualizar productos
      </Text>

      {seleccionado === null ? (
        <>
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
              ListEmptyComponent={
                <Text style={styles.vacio}>
                  No hay productos registrados
                </Text>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshing={cargando}
              onRefresh={consultarProductos}
            />
          )}
        </>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 30 }}
        >

          <Text style={styles.subtitulo}>
            Editando producto ID: {seleccionado.id}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre del producto"
            value={producto}
            onChangeText={setProducto}
          />

          <TextInput
            style={[styles.input, styles.inputDescripcion]}
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Precio"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={styles.boton}
            onPress={actualizarProducto}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBoton}>
                Guardar cambios
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonCancelar}
            onPress={() => setSeleccionado(null)}
            disabled={guardando}
          >
            <Text style={styles.textoBoton}>
              Cancelar
            </Text>
          </TouchableOpacity>

        </ScrollView>
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

  subtitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#243B60',
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
    marginTop: 5,
  },

  precio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16875C',
    marginTop: 8,
  },

  editar: {
    fontSize: 13,
    color: '#2563EB',
    marginTop: 10,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
  },

  inputDescripcion: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  boton: {
    backgroundColor: '#16875C',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  botonCancelar: {
    backgroundColor: '#64748B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  textoBoton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  vacio: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 30,
  },

});
