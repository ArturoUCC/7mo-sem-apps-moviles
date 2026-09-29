import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Magnetometer } from "expo-sensors";

const TOLERANCIA = 15; // grados de margen para considerar "alineado"
const TIEMPO_SOSTENER = 500; // ms que debes mantenerte alineado
const DIRECCIONES = [
  { nombre: 'Norte', letra: 'N', grados: 0 },
  { nombre: 'Este', letra: 'E', grados: 90 },
  { nombre: 'Sur', letra: 'S', grados: 180 },
  { nombre: 'Oeste', letra: 'O', grados: 270 },
];

function calcularAngulo(magnetometro) {
  let angulo = 0;
  if (magnetometro) {
    const { x, y } = magnetometro;
    if (Math.atan2(y, x) >= 0) {
      angulo = Math.atan2(y, x) * (180 / Math.PI);
    } else {
      angulo = (Math.atan2(y, x) + 2 * Math.PI) * (180 / Math.PI);
    }
  }
  return angulo;
}

// Diferencia angular más corta entre dos ángulos (maneja el cruce 360°/0°)
function diferenciaAngular(a, b) {
  let diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function ordenAleatorio() {
  const arr = [...DIRECCIONES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function EncontrarNorte() {
  const [fase, setFase] = useState('esperando'); // esperando | jugando | terminado
  const [rondas, setRondas] = useState([]);
  const [rondaActual, setRondaActual] = useState(0);
  const [grados, setGrados] = useState(0);
  const [alineado, setAlineado] = useState(false);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const [tiemposRonda, setTiemposRonda] = useState([]);
  const [mejorTiempo, setMejorTiempo] = useState(null);

  const anguloAnimado = useRef(new Animated.Value(0)).current;
  const ultimoAngulo = useRef(0);
  const holdInicio = useRef(null);
  const inicioRonda = useRef(0);
  const inicioTotal = useRef(0);
  const faseRef = useRef(fase);
  const rondaActualRef = useRef(0);
  const rondasRef = useRef([]);

  useEffect(() => { faseRef.current = fase; }, [fase]);
  useEffect(() => { rondaActualRef.current = rondaActual; }, [rondaActual]);
  useEffect(() => { rondasRef.current = rondas; }, [rondas]);

  useEffect(() => {
    const subscribir = Magnetometer.addListener((measurements) => {
      const nuevoAngulo = calcularAngulo(measurements);
      setGrados(nuevoAngulo);

      let diferencia = nuevoAngulo - (ultimoAngulo.current % 360);
      if (diferencia > 180) diferencia -= 360;
      if (diferencia < -180) diferencia += 360;
      const destino = ultimoAngulo.current + diferencia;
      ultimoAngulo.current = destino;

      Animated.timing(anguloAnimado, {
        toValue: destino,
        duration: 150,
        useNativeDriver: true,
      }).start();

      if (faseRef.current !== 'jugando') return;

      const objetivo = rondasRef.current[rondaActualRef.current];
      if (!objetivo) return;

      const distancia = diferenciaAngular(nuevoAngulo, objetivo.grados);
      const enTolerancia = distancia <= TOLERANCIA;
      setAlineado(enTolerancia);

      if (enTolerancia) {
        if (!holdInicio.current) holdInicio.current = Date.now();
        if (Date.now() - holdInicio.current >= TIEMPO_SOSTENER) {
          completarRonda();
        }
      } else {
        holdInicio.current = null;
      }
    });

    Magnetometer.setUpdateInterval(150);
    return () => subscribir.remove();
  }, []);

  const completarRonda = () => {
    holdInicio.current = null;
    const tiempoRonda = Date.now() - inicioRonda.current;
    setTiemposRonda((prev) => [...prev, tiempoRonda]);

    const siguienteIndice = rondaActualRef.current + 1;
    if (siguienteIndice >= rondasRef.current.length) {
      const total = Date.now() - inicioTotal.current;
      setTiempoTotal(total);
      setMejorTiempo((m) => (m === null ? total : Math.min(m, total)));
      setFase('terminado');
    } else {
      setRondaActual(siguienteIndice);
      inicioRonda.current = Date.now();
    }
  };

  const iniciarReto = () => {
    const nuevasRondas = ordenAleatorio();
    setRondas(nuevasRondas);
    rondasRef.current = nuevasRondas;
    setRondaActual(0);
    rondaActualRef.current = 0;
    setTiemposRonda([]);
    holdInicio.current = null;
    inicioRonda.current = Date.now();
    inicioTotal.current = Date.now();
    setFase('jugando');
  };

  const rotacionDial = anguloAnimado.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ['360deg', '0deg', '-360deg'],
  });

  const objetivoActual = rondas[rondaActual];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encuentra la dirección</Text>

      {fase === 'esperando' && (
        <View style={styles.centro}>
          <Text style={styles.hint}>Gira el celular hasta apuntar hacia cada dirección.</Text>
          <Text style={styles.hint}>4 rondas, contra el reloj.</Text>
          {mejorTiempo !== null && (
            <Text style={styles.mejor}>Mejor tiempo: {(mejorTiempo / 1000).toFixed(1)}s</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={iniciarReto}>
            <Text style={styles.buttonText}>Empezar reto</Text>
          </TouchableOpacity>
        </View>
      )}

      {fase === 'jugando' && objetivoActual && (
        <>
          <Text style={styles.ronda}>Ronda {rondaActual + 1} de {rondas.length}</Text>
          <Text style={[styles.objetivo, alineado && styles.objetivoOk]}>
            Apunta al {objetivoActual.nombre} ({objetivoActual.letra})
          </Text>

          <View style={styles.compassWrap}>
            <Animated.View style={[styles.dial, { transform: [{ rotate: rotacionDial }] }]}>
              {DIRECCIONES.map((d) => (
                <Text
                  key={d.letra}
                  style={[
                    styles.cardinal,
                    d.letra === objetivoActual.letra && styles.cardinalObjetivo,
                    { transform: [{ rotate: `${d.grados}deg` }, { translateY: -95 }] },
                  ]}
                >
                  {d.letra}
                </Text>
              ))}
            </Animated.View>

            <View style={styles.needle} />
            <View style={styles.centerDot} />
          </View>

          <Text style={[styles.estado, alineado && styles.estadoOk]}>
            {alineado ? 'Mantente firme...' : `${Math.round(grados)}°`}
          </Text>
        </>
      )}

      {fase === 'terminado' && (
        <View style={styles.centro}>
          <Text style={styles.finTitulo}>🧭 ¡Completado!</Text>
          <Text style={styles.finTiempo}>{(tiempoTotal / 1000).toFixed(1)}s</Text>
          {tiempoTotal === mejorTiempo && <Text style={styles.record}>🏆 ¡Nuevo mejor tiempo!</Text>}
          <Text style={styles.mejor}>Mejor tiempo: {(mejorTiempo / 1000).toFixed(1)}s</Text>

          <View style={styles.detalleRondas}>
            {tiemposRonda.map((t, i) => (
              <Text key={i} style={styles.detalleTexto}>
                {rondas[i].nombre}: {(t / 1000).toFixed(1)}s
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={iniciarReto}>
            <Text style={styles.buttonText}>Jugar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const DIAL_SIZE = 220;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 20, paddingHorizontal: 20, backgroundColor: '#f9fafb' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hint: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 4 },
  mejor: { fontSize: 15, color: '#6366f1', fontWeight: '600', marginTop: 16, marginBottom: 20 },
  ronda: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  objetivo: { fontSize: 20, fontWeight: 'bold', color: '#374151', marginBottom: 16 },
  objetivoOk: { color: '#10b981' },
  compassWrap: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardinal: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  cardinalObjetivo: {
    color: '#ef4444',
    fontSize: 22,
  },
  needle: {
    position: 'absolute',
    width: 4,
    height: DIAL_SIZE - 30,
    backgroundColor: '#6366f1',
    top: 15,
  },
  centerDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#374151',
  },
  estado: { fontSize: 22, fontWeight: 'bold', color: '#6b7280' },
  estadoOk: { color: '#10b981' },
  finTitulo: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  finTiempo: { fontSize: 42, fontWeight: 'bold', color: '#6366f1' },
  record: { fontSize: 15, color: '#f59e0b', fontWeight: '700', marginTop: 10 },
  detalleRondas: { marginTop: 16, marginBottom: 10, alignItems: 'center' },
  detalleTexto: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  button: {
    marginTop: 10,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});