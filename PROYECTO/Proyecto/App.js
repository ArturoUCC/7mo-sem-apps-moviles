import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Laberinto from './componentes/sensores/Laberinto';
import NivelBurbuja from './componentes/sensores/NivelBurbuja';
import RomperBurbuja from './componentes/sensores/RomperBurbuja';
import EncontrarNorte from './componentes/sensores/EncontrarNorte';
import Memorama from './componentes/juegos/Memorama';
import Buscaminas from './componentes/juegos/Buscaminas';
import SimonDice from './componentes/juegos/SimonDice';
import Cronometro from './componentes/utilidades/Cronometro';
import TestReaccion from './componentes/utilidades/TestReaccion';

SplashScreen.preventAutoHideAsync();

/* ---------------------- SPLASH ANIMADO ---------------------- */
function AnimatedSplash({ onFinish }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={splashStyles.container}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <Text style={splashStyles.emoji}>🎮</Text>
        <Text style={splashStyles.title}>Proyecto</Text>
        <Text style={splashStyles.subtitle}>Sensores & Juegos</Text>
      </Animated.View>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1b4b', justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 70, textAlign: 'center' },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginTop: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#a5b4fc', marginTop: 4, textAlign: 'center' },
});

/* ---------------------- SECCIONES (para Home y Drawer) ---------------------- */
const SECCIONES = [
  {
    titulo: 'Sensores',
    items: [
      { nombre: 'Laberinto', icono: 'navigate-outline', color: '#6366f1', desc: 'Mueve la bola inclinando el celular' },
      { nombre: 'Nivel de burbuja', icono: 'apps-outline', color: '#3b82f6', desc: 'Detecta si algo está nivelado' },
      { nombre: 'Romper burbujas', icono: 'ellipse-outline', color: '#ec4899', desc: 'Agita para reventar burbujas' },
      { nombre: 'Encontrar el norte', icono: 'compass-outline', color: '#10b981', desc: 'Reto de orientación con brújula' },
    ],
  },
  {
    titulo: 'Juegos',
    items: [
      { nombre: 'Memorama', icono: 'grid-outline', color: '#8b5cf6', desc: 'Encuentra las parejas de cartas' },
      { nombre: 'Buscaminas', icono: 'flag-outline', color: '#f59e0b', desc: 'Clásico buscaminas con dificultad' },
      { nombre: 'Simon dice', icono: 'color-palette-outline', color: '#ef4444', desc: 'Repite la secuencia de colores' },
    ],
  },
  {
    titulo: 'Utilidades',
    items: [
      { nombre: 'Cronómetro', icono: 'time-outline', color: '#14b8a6', desc: 'Con vueltas y tiempos parciales' },
      { nombre: 'Test de reacción', icono: 'flash-outline', color: '#f97316', desc: 'Mide tu velocidad de reacción' },
    ],
  },
];

const PANTALLAS = {
  Laberinto,
  'Nivel de burbuja': NivelBurbuja,
  'Romper burbujas': RomperBurbuja,
  'Encontrar el norte': EncontrarNorte,
  Memorama,
  Buscaminas,
  'Simon dice': SimonDice,
  Cronómetro: Cronometro,
  'Test de reacción': TestReaccion,
};

/* ---------------------- HOME SCREEN ---------------------- */
function HomeScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <ScrollView style={homeStyles.container} contentContainerStyle={{ padding: 20 }}>
      <Animated.View style={{ opacity: fade }}>
        <Text style={homeStyles.title}>Bienvenido 👋</Text>
        <Text style={homeStyles.subtitle}>Elige algo para comenzar</Text>

        {SECCIONES.map((seccion) => (
          <View key={seccion.titulo} style={{ marginBottom: 10 }}>
            <Text style={homeStyles.seccionTitulo}>{seccion.titulo}</Text>
            {seccion.items.map((item) => (
              <TouchableOpacity
                key={item.nombre}
                style={[homeStyles.card, { borderLeftColor: item.color }]}
                onPress={() => navigation.navigate(item.nombre)}
                activeOpacity={0.8}
              >
                <View style={[homeStyles.iconWrap, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icono} size={22} color="#fff" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={homeStyles.cardTitle}>{item.nombre}</Text>
                  <Text style={homeStyles.cardDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  seccionTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardDesc: { fontSize: 11, color: '#6b7280', marginTop: 1 },
});

/* ---------------------- CONTENIDO PERSONALIZADO DEL DRAWER ---------------------- */
function CustomDrawerContent(props) {
  const rutaActiva = props.state.routeNames[props.state.index];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
      <DrawerItem
        label="Inicio"
        focused={rutaActiva === 'Inicio'}
        icon={({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />}
        onPress={() => props.navigation.navigate('Inicio')}
      />

      {SECCIONES.map((seccion) => (
        <View key={seccion.titulo} style={{ marginTop: 12 }}>
          <Text style={drawerStyles.seccionTitulo}>{seccion.titulo}</Text>
          {seccion.items.map((item) => (
            <DrawerItem
              key={item.nombre}
              label={item.nombre}
              focused={rutaActiva === item.nombre}
              activeTintColor={item.color}
              icon={({ color, size }) => <Ionicons name={item.icono} size={size} color={color} />}
              onPress={() => props.navigation.navigate(item.nombre)}
            />
          ))}
        </View>
      ))}
    </DrawerContentScrollView>
  );
}

const drawerStyles = StyleSheet.create({
  seccionTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 4,
  },
});

/* ---------------------- DRAWER NAVIGATOR ---------------------- */
const Drawer = createDrawerNavigator();

function RootDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#1e1b4b' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#6366f1',
      }}
    >
      <Drawer.Screen name="Inicio" component={HomeScreen} />
      {Object.entries(PANTALLAS).map(([nombre, Componente]) => (
        <Drawer.Screen key={nombre} name={nombre} component={Componente} />
      ))}
    </Drawer.Navigator>
  );
}

/* ---------------------- APP PRINCIPAL ---------------------- */
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (showAnimatedSplash) {
    return <AnimatedSplash onFinish={() => setShowAnimatedSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootDrawerNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}