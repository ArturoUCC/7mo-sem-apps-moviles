import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TOTAL_RONDAS = 3;

export default function TestReaccion() {
  const [fase, setFase] = useState('inicio'); // inicio | esperando | listo | tramposo | resultado | final
  const [ronda, setRonda] = useState(0);
  const [tiempos, setTiempos] = useState([]);
  const [mejorHistorico, setMejorHistorico] = useState(null);

  const inicioEspera = useRef(0);
  const timeoutRef = useRef(null);

  const iniciarRonda = () => {
    setFase('esperando');

    const espera = 1500 + Math.random() * 2500; // entre 1.5s y 4s
    timeoutRef.current = setTimeout(() => {
      inicioEspera.current = Date.now();
      setFase('listo');
    }, espera);
  };

  const iniciarJuego = () => {
    setRonda(0);
    setTiempos([]);
    setTimeout(() => iniciarRonda(), 300);
  };

  const tocarPantalla = () => {
    if (fase === 'esperando') {
      // Tocó antes de tiempo, es tramposo
      clearTimeout(timeoutRef.current);
      setFase('tramposo');
      return;
    }

    if (fase === 'listo') {
      const reaccion = Date.now() - inicioEspera.current;
      const nuevosTiempos = [...tiempos, reaccion];
      setTiempos(nuevosTiempos);

      if (nuevosTiempos.length >= TOTAL_RONDAS) {
        const mejor = Math.min(...nuevosTiempos);
        setMejorHistorico((m) => (m === null ? mejor : Math.min(m, mejor)));
        setFase('final');
      } else {
        setFase('resultado');
      }
      return;
    }
  };

  const siguienteRonda = () => {
    setRonda((r) => r + 1);
    iniciarRonda();
  };

  const reintentarTramposo = () => {
    iniciarRonda();
  };

  const promedio = tiempos.length > 0
    ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length)
    : 0;

  return (
    <View style={styles.container}>
      {fase === 'inicio' && (
        <View style={styles.centro}>
          <Text style={styles.title}>Test de reacción</Text>
          <Text style={styles.hint}>Espera a que la pantalla se ponga verde y toca lo más rápido posible.</Text>
          <Text style={styles.hint}>{TOTAL_RONDAS} rondas, se toma tu mejor tiempo.</Text>
          {mejorHistorico !== null && (
            <Text style={styles.mejor}>Récord: {mejorHistorico} ms</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={iniciarJuego}>
            <Text style={styles.buttonText}>Empezar</Text>
          </TouchableOpacity>
        </View>
      )}

      {fase === 'esperando' && (
        <TouchableOpacity style={[styles.pantallaCompleta, styles.esperando]} onPress={tocarPantalla} activeOpacity={1}>
          <Text style={styles.textoEspera}>Espera el verde...</Text>
          <Text style={styles.rondaTexto}>Ronda {ronda + 1} de {TOTAL_RONDAS}</Text>
        </TouchableOpacity>
      )}

      {fase === 'listo' && (
        <TouchableOpacity style={[styles.pantallaCompleta, styles.listo]} onPress={tocarPantalla} activeOpacity={1}>
          <Text style={styles.textoListo}>¡TOCA YA!</Text>
        </TouchableOpacity>
      )}

      {fase === 'tramposo' && (
        <View style={styles.centro}>
          <Text style={styles.tramposoTitulo}>Muy pronto 😅</Text>
          <Text style={styles.hint}>Esperaste antes de que apareciera el verde.</Text>
          <TouchableOpacity style={styles.button} onPress={reintentarTramposo}>
            <Text style={styles.buttonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}

      {fase === 'resultado' && (
        <View style={styles.centro}>
          <Text style={styles.resultadoTiempo}>{tiempos[tiempos.length - 1]} ms</Text>
          <Text style={styles.hint}>Ronda {ronda + 1} de {TOTAL_RONDAS} completada</Text>
          <TouchableOpacity style={styles.button} onPress={siguienteRonda}>
            <Text style={styles.buttonText}>Siguiente ronda</Text>
          </TouchableOpacity>
        </View>
      )}

      {fase === 'final' && (
        <View style={styles.centro}>
          <Text style={styles.finTitulo}>⚡ Resultados</Text>
          <Text style={styles.finMejor}>{Math.min(...tiempos)} ms</Text>
          <Text style={styles.finLabel}>Tu mejor tiempo</Text>

          <View style={styles.detalle}>
            {tiempos.map((t, i) => (
              <Text key={i} style={styles.detalleTexto}>Ronda {i + 1}: {t} ms</Text>
            ))}
            <Text style={styles.detallePromedio}>Promedio: {promedio} ms</Text>
          </View>

          {Math.min(...tiempos) === mejorHistorico && (
            <Text style={styles.record}>🏆 ¡Nuevo récord!</Text>
          )}
          <Text style={styles.mejor}>Récord histórico: {mejorHistorico} ms</Text>

          <TouchableOpacity style={styles.button} onPress={iniciarJuego}>
            <Text style={styles.buttonText}>Jugar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  hint: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 4 },
  mejor: { fontSize: 15, color: '#6366f1', fontWeight: '600', marginTop: 16, marginBottom: 20 },
  pantallaCompleta: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  esperando: { backgroundColor: '#ef4444' },
  listo: { backgroundColor: '#10b981' },
  textoEspera: { fontSize: 20, fontWeight: '600', color: '#fff' },
  rondaTexto: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  textoListo: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  tramposoTitulo: { fontSize: 24, fontWeight: 'bold', color: '#f59e0b', marginBottom: 8 },
  resultadoTiempo: { fontSize: 42, fontWeight: 'bold', color: '#6366f1', marginBottom: 6 },
  finTitulo: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  finMejor: { fontSize: 46, fontWeight: 'bold', color: '#6366f1' },
  finLabel: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  detalle: { alignItems: 'center', marginBottom: 10 },
  detalleTexto: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  detallePromedio: { fontSize: 13, color: '#374151', fontWeight: '600', marginTop: 6 },
  record: { fontSize: 15, color: '#f59e0b', fontWeight: '700', marginTop: 10 },
  button: {
    marginTop: 16,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});