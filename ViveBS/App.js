import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Memorama from './componentes/Memorama';
import TicTacToe from './componentes/TicTacToe';
import DiceRoller from './componentes/DiceRoller';
import IMCCalculator from './componentes/IMCCalculator';

SplashScreen.preventAutoHideAsync();


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
        <Text style={splashStyles.title}>ViveBS</Text>
        <Text style={splashStyles.subtitle}>Juegos & Utilidades</Text>
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


const games = [
  { name: 'Memorama', screen: 'Memorama', icon: 'grid-outline', color: '#6366f1', desc: 'Encuentra las parejas de cartas' },
  { name: 'Tic Tac Toe', screen: 'Tic Tac Toe', icon: 'close-outline', color: '#ec4899', desc: 'Clásico gato, X contra O' },
  { name: 'Lanzar Dados', screen: 'Dados', icon: 'cube-outline', color: '#10b981', desc: 'Tira el dado virtual' },
  { name: 'Calculadora IMC', screen: 'IMC', icon: 'body-outline', color: '#f59e0b', desc: 'Calcula tu índice de masa corporal' },
];

function HomeScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView style={homeStyles.container} contentContainerStyle={{ padding: 20 }}>
      <Animated.View style={{ opacity: fade, transform: [{ translateY }] }}>
        <Text style={homeStyles.title}>Bienvenido a ViveBS 👋</Text>
        <Text style={homeStyles.subtitle}>Elige un juego o herramienta para comenzar</Text>

        {games.map((game) => (
          <TouchableOpacity
            key={game.screen}
            style={[homeStyles.card, { borderLeftColor: game.color }]}
            onPress={() => navigation.navigate('Juegos', { screen: game.screen })}
            activeOpacity={0.8}
          >
            <View style={[homeStyles.iconWrap, { backgroundColor: game.color }]}>
              <Ionicons name={game.icon} size={26} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={homeStyles.cardTitle}>{game.name}</Text>
              <Text style={homeStyles.cardDesc}>{game.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
});

/* ---------------------- TAB NAVIGATOR (Juegos) ---------------------- */
const Tab = createBottomTabNavigator();

const tabIcons = {
  Memorama: 'grid-outline',
  'Tic Tac Toe': 'close-outline',
  Dados: 'cube-outline',
  IMC: 'body-outline',
};

function GamesTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={tabIcons[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Memorama" component={Memorama} />
      <Tab.Screen name="Tic Tac Toe" component={TicTacToe} />
      <Tab.Screen name="Dados" component={DiceRoller} />
      <Tab.Screen name="IMC" component={IMCCalculator} />
    </Tab.Navigator>
  );
}

import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';

/* ---------------------- CONTENIDO CUSTOM DEL DRAWER ---------------------- */
const drawerGameIcons = {
  Memorama: 'grid-outline',
  'Tic Tac Toe': 'close-outline',
  Dados: 'cube-outline',
  IMC: 'body-outline',
};

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      {/* Esto renderiza Inicio y Juegos normal */}
      <DrawerItemList {...props} />

      {/* Separador visual */}
      <View style={{ borderTopWidth: 1, borderTopColor: '#e5e7eb', marginVertical: 8 }} />

      {/* Accesos directos a cada juego, pero navegando DENTRO de Juegos */}
      {Object.keys(drawerGameIcons).map((game) => (
        <DrawerItem
          key={game}
          label={game}
          icon={({ color, size }) => <Ionicons name={drawerGameIcons[game]} size={size} color={color} />}
          onPress={() => {
            props.navigation.navigate('Juegos', { screen: game });
          }}
        />
      ))}
    </DrawerContentScrollView>
  );
}

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
      <Drawer.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Drawer.Screen
        name="Juegos"
        component={GamesTabNavigator}
        options={{ drawerIcon: ({ color, size }) => <Ionicons name="game-controller-outline" size={size} color={color} /> }}
      />
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