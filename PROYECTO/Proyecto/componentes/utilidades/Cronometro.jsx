import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';

function formatearTiempo(ms) {
  const centesimas = Math.floor((ms % 1000) / 10);
  const segundos = Math.floor((ms / 1000) % 60);
  const minutos = Math.floor(ms / 60000);

  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(minutos)}:${pad(segundos)}.${pad(centesimas)}`;
}

export default function Cronometro() {
  const [tiempo, setTiempo] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [vueltas, setVueltas] = useState([]);

  const inicioRef = useRef(0);
  const tiempoAcumulado = useRef(0);
  const intervalRef = useRef(null);

  const pulso = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (corriendo) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulso, { toValue: 1.03, duration: 500, useNativeDriver: true }),
          Animated.timing(pulso, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulso.stopAnimation();
      pulso.setValue(1);
    }
  }, [corriendo]);

  const iniciar = () => {
    inicioRef.current = Date.now();
    setCorriendo(true);

    intervalRef.current = setInterval(() => {
      setTiempo(tiempoAcumulado.current + (Date.now() - inicioRef.current));
    }, 30);
  };

  const pausar = () => {
    clearInterval(intervalRef.current);
    tiempoAcumulado.current = tiempo;
    setCorriendo(false);
  };

  const reiniciar = () => {
    clearInterval(intervalRef.current);
    setCorriendo(false);
    setTiempo(0);
    tiempoAcumulado.current = 0;
    setVueltas([]);
  };

  const marcarVuelta = () => {
    setVueltas((prev) => [{ numero: prev.length + 1, tiempo }, ...prev]);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cronómetro</Text>

      <Animated.View style={[styles.circulo, { transform: [{ scale: pulso }] }]}>
        <Text style={styles.tiempo}>{formatearTiempo(tiempo)}</Text>
      </Animated.View>

      <View style={styles.botones}>
        {!corriendo && tiempo === 0 && (
          <TouchableOpacity style={[styles.boton, styles.botonIniciar]} onPress={iniciar}>
            <Text style={styles.botonTexto}>Iniciar</Text>
          </TouchableOpacity>
        )}

        {corriendo && (
          <>
            <TouchableOpacity style={[styles.boton, styles.botonVuelta]} onPress={marcarVuelta}>
              <Text style={styles.botonTexto}>Vuelta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.boton, styles.botonPausar]} onPress={pausar}>
              <Text style={styles.botonTexto}>Pausar</Text>
            </TouchableOpacity>
          </>
        )}

        {!corriendo && tiempo > 0 && (
          <>
            <TouchableOpacity style={[styles.boton, styles.botonIniciar]} onPress={iniciar}>
              <Text style={styles.botonTexto}>Reanudar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.boton, styles.botonReiniciar]} onPress={reiniciar}>
              <Text style={styles.botonTexto}>Reiniciar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {vueltas.length > 0 && (
        <ScrollView style={styles.listaVueltas}>
          {vueltas.map((v, i) => {
            const anterior = vueltas[i + 1]?.tiempo ?? 0;
            const diferencia = v.tiempo - anterior;
            return (
              <View key={v.numero} style={styles.vueltaItem}>
                <Text style={styles.vueltaNumero}>Vuelta {v.numero}</Text>
                <Text style={styles.vueltaTiempo}>{formatearTiempo(v.tiempo)}</Text>
                <Text style={styles.vueltaDiferencia}>+{formatearTiempo(diferencia)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const CIRCLE_SIZE = 220;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', paddingTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 30 },
  circulo: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 6,
    borderColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  tiempo: { fontSize: 32, fontWeight: 'bold', color: '#111827', fontVariant: ['tabular-nums'] },
  botones: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  boton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  botonIniciar: { backgroundColor: '#10b981' },
  botonPausar: { backgroundColor: '#ef4444' },
  botonVuelta: { backgroundColor: '#6366f1' },
  botonReiniciar: { backgroundColor: '#6b7280' },
  botonTexto: { color: '#fff', fontWeight: '600', fontSize: 16 },
  listaVueltas: {
    width: '85%',
    maxHeight: 220,
  },
  vueltaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
  },
  vueltaNumero: { fontSize: 13, color: '#6b7280', flex: 1 },
  vueltaTiempo: { fontSize: 13, fontWeight: '600', color: '#111827', flex: 1, textAlign: 'center' },
  vueltaDiferencia: { fontSize: 13, color: '#9ca3af', flex: 1, textAlign: 'right' },
});