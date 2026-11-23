import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library/legacy';

export default function TomarFoto() {
  const [permisoCamara, solicitarPermisoCamara] = useCameraPermissions();
  const [permisoGaleria, solicitarPermisoGaleria] = MediaLibrary.usePermissions();

  const [tipoCamara, setTipoCamara] = useState('back');
  const [foto, setFoto] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const camaraRef = useRef(null);

  if (!permisoCamara || !permisoGaleria) {
    return <View style={styles.centro} />;
  }

  if (!permisoCamara.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.titulo}>Permiso de cámara</Text>
        <Text style={styles.hint}>Necesitamos acceso a tu cámara para tomar fotos.</Text>
        <TouchableOpacity style={styles.button} onPress={solicitarPermisoCamara}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permisoGaleria.granted) {
    return (
      <View style={styles.centro}>
        <Text style={styles.titulo}>Permiso de galería</Text>
        <Text style={styles.hint}>Necesitamos acceso para guardar las fotos que tomes.</Text>
        <TouchableOpacity style={styles.button} onPress={solicitarPermisoGaleria}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tomarFoto = async () => {
    if (!camaraRef.current) return;

    const foto = await camaraRef.current.takePictureAsync({ quality: 0.8 });
    setFoto(foto);
    setMensaje('');
  };

  const guardarFoto = async () => {
    if (!foto) return;

    setGuardando(true);
    try {
      await MediaLibrary.saveToLibraryAsync(foto.uri);
      setMensaje('✓ Foto guardada en tu galería');
    } catch (error) {
      setMensaje('No se pudo guardar la foto');
    } finally {
      setGuardando(false);
    }
  };

  const tomarOtra = () => {
    setFoto(null);
    setMensaje('');
  };

  const voltearCamara = () => {
    setTipoCamara((actual) => (actual === 'back' ? 'front' : 'back'));
  };

  if (foto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: foto.uri }} style={styles.preview} />

        {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}

        <View style={styles.botonesPreview}>
          <TouchableOpacity style={[styles.button, styles.buttonSecundario]} onPress={tomarOtra}>
            <Text style={styles.buttonText}>Tomar otra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={guardarFoto} disabled={guardando}>
            <Text style={styles.buttonText}>{guardando ? 'Guardando...' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camara} facing={tipoCamara} ref={camaraRef} />

      <View style={styles.controles}>
        <TouchableOpacity style={styles.botonSecundarioCircular} onPress={voltearCamara}>
          <Text style={styles.iconoVoltear}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botonCapturar} onPress={tomarFoto}>
          <View style={styles.botonCapturarInterior} />
        </TouchableOpacity>

        <View style={{ width: 50 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f9fafb' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  hint: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  camara: { flex: 1 },
  controles: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  botonCapturar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  botonCapturarInterior: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  botonSecundarioCircular: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconoVoltear: { fontSize: 24 },
  preview: { flex: 1, resizeMode: 'contain' },
  mensaje: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    fontSize: 13,
  },
  botonesPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    padding: 20,
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  buttonSecundario: {
    backgroundColor: '#374151',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});