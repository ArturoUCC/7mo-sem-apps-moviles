import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';

const ICONS = ['🍎', '🍌', '🍇', '🍉', '🍒', '🍋', '🍑', '🥝'];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildDeck() {
  const pairs = shuffle([...ICONS, ...ICONS]);
  return pairs.map((icon, index) => ({ id: index, icon, flipped: false, matched: false }));
}

export default function Memorama() {
  const [cards, setCards] = useState(buildDeck());
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (cards.every((c) => c.matched)) {
      setWon(true);
    }
  }, [cards]);

  const handlePress = (index) => {
    if (cards[index].flipped || cards[index].matched || selected.length === 2) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSelected;
      if (newCards[a].icon === newCards[b].icon) {
        setTimeout(() => {
          const updated = [...newCards];
          updated[a].matched = true;
          updated[b].matched = true;
          setCards(updated);
          setSelected([]);
        }, 400);
      } else {
        setTimeout(() => {
          const updated = [...newCards];
          updated[a].flipped = false;
          updated[b].flipped = false;
          setCards(updated);
          setSelected([]);
        }, 700);
      }
    }
  };

  const restart = () => {
    setCards(buildDeck());
    setSelected([]);
    setMoves(0);
    setWon(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Memorama</Text>
      <Text style={styles.moves}>Movimientos: {moves}</Text>

      {won && <Text style={styles.won}>🎉 ¡Ganaste! 🎉</Text>}

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <MemoryCard key={card.id} card={card} onPress={() => handlePress(index)} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={restart}>
        <Text style={styles.buttonText}>Reiniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

function MemoryCard({ card, onPress }) {
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: card.flipped || card.matched ? 180 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [card.flipped, card.matched]);

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  return (
    <TouchableOpacity onPress={onPress} style={styles.cardSlot} activeOpacity={0.8}>
      <Animated.View style={[styles.cardFace, { transform: [{ rotateY: frontInterpolate }] }]}>
        <Text style={styles.cardBack}>❓</Text>
      </Animated.View>
      <Animated.View
        style={[styles.cardFace, styles.cardFaceFront, { transform: [{ rotateY: backInterpolate }] }]}
      >
        <Text style={styles.cardIcon}>{card.icon}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const size = Dimensions.get('window').width / 4 - 16;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', paddingTop: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  moves: { fontSize: 14, color: '#6b7280', marginBottom: 10 },
  won: { fontSize: 18, fontWeight: 'bold', color: '#10b981', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: '100%', paddingHorizontal: 8 },
  cardSlot: { width: size, height: size, margin: 6 },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    backgroundColor: '#6366f1',
  },
  cardFaceFront: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#6366f1' },
  cardBack: { fontSize: 24, color: '#fff' },
  cardIcon: { fontSize: 28 },
  button: { marginTop: 20, backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});