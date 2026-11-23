import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { supabase } from '../config/supabase';

export default function CrearProducto() {

  const [producto, setProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);

  const guardarProducto = async () => {

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

    try {
      setGuardando(true);

      const { error } = await supabase
        .from('productos')
        .insert({
          producto: producto.trim(),
          descripcion: descripcion.trim(),
          precio: precioNumero,
        });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Éxito',
        'Producto guardado correctamente'
      );

      setProducto('');
      setDescripcion('');
      setPrecio('');

    } catch (error) {

      console.error('Error al guardar:', error);

      Alert.alert(
        'Error',
        error.message || 'No se pudo guardar'
      );

    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.contenedor}>

      <Text style={styles.titulo}>
        Registrar producto
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={producto}
        onChangeText={setProducto}
      />

      <TextInput
        style={[styles.input, styles.descripcion]}
        placeholder="Descripción del producto"
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
        onPress={guardarProducto}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBoton}>
            Guardar producto
          </Text>
        )}
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  contenedor: {
    padding: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#243B60',
    marginBottom: 25,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },

  descripcion: {
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

  textoBoton: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

});
