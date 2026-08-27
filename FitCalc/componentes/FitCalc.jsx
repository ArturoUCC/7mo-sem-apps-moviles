import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function CalculadoraIMC() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const calcularIMC = () => {
    const pesoNumero = parseFloat(peso);
    const alturaNumero = parseFloat(altura);

    if (
      isNaN(pesoNumero) ||
      isNaN(alturaNumero) ||
      pesoNumero <= 0 ||
      alturaNumero <= 0
    ) {
      return;
    }

    const resultado = pesoNumero / (alturaNumero * alturaNumero);

    setImc(resultado.toFixed(2));
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>Calculadora de IMC</Text>

      <View style={styles.seccion}>
        <Text style={styles.label}>Peso (kg)</Text>

        <TextInput
          style={styles.input}
          placeholder="Ingrese su peso"
          keyboardType="numeric"
          value={peso}
          onChangeText={setPeso}
        />
      </View>

      <View style={styles.seccion}>
        <Text style={styles.label}>Altura (m)</Text>

        <TextInput
          style={styles.input}
          placeholder="Ingrese su altura"
          keyboardType="numeric"
          value={altura}
          onChangeText={setAltura}
        />
      </View>

      <TouchableOpacity
        style={styles.boton}
        onPress={calcularIMC}
      >
        <Text style={styles.textoBoton}>Calcular IMC</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalFondo}>

          <View style={styles.modalContenido}>

            <TouchableOpacity
              style={styles.botonCerrar}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoCerrar}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.textoIMC}>{imc}</Text>

            <TouchableOpacity
              style={styles.botonAceptar}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoAceptar}>Aceptar</Text>
            </TouchableOpacity>

          </View>

        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },

  seccion: {
    marginBottom: 25,
  },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },

  boton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },

  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  modalFondo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContenido: {
    width: '80%',
    padding: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  botonCerrar: {
    position: 'absolute',
    right: 15,
    top: 10,
  },

  textoCerrar: {
    fontSize: 24,
  },

  textoIMC: {
    fontSize: 42,
    fontWeight: 'bold',
    marginVertical: 30,
  },

  botonAceptar: {
    width: '100%',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },

  textoAceptar: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});