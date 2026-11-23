import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

import CrearProducto from './components/CrearProducto';
import ListaProductos from './components/ListaProductos';
import ActualizarProducto from './components/ActualizarProducto';
import EliminarProducto from './components/EliminarProducto';

export default function App() {

  const [pantalla, setPantalla] = useState('crear');

  const botones = [
    { id: 'crear', titulo: 'Crear' },
    { id: 'lista', titulo: 'Consultar' },
    { id: 'actualizar', titulo: 'Actualizar' },
    { id: 'eliminar', titulo: 'Eliminar' },
  ];

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.titulo}>
        Actividad: Persistencia
      </Text>

      <View style={styles.menu}>
        {botones.map((boton) => (

          <TouchableOpacity
            key={boton.id}
            style={[
              styles.boton,
              pantalla === boton.id && styles.botonActivo,
            ]}
            onPress={() => setPantalla(boton.id)}
          >
            <Text style={styles.textoBoton}>
              {boton.titulo}
            </Text>
          </TouchableOpacity>

        ))}
      </View>

      <View style={styles.contenido}>

        {pantalla === 'crear' && (
          <CrearProducto />
        )}

        {pantalla === 'lista' && (
          <ListaProductos />
        )}

        {pantalla === 'actualizar' && (
          <ActualizarProducto />
        )}

        {pantalla === 'eliminar' && (
          <EliminarProducto />
        )}

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#243B60',
    marginTop: 25,
    marginBottom: 20,
  },

  menu: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
    marginBottom: 15,
  },

  boton: {
    flex: 1,
    backgroundColor: '#16875C',
    paddingVertical: 12,
    marginHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
  },

  botonActivo: {
    backgroundColor: '#105C40',
  },

  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },

  contenido: {
    flex: 1,
  },

});
