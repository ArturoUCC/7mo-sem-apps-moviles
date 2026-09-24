import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell)) return 'draw';
  return null;
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const winner = checkWinner(board);

  const handlePress = (index) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
  };

  const statusText = winner === 'draw' ? 'Empate 🤝' : winner ? `¡Ganó ${winner}! 🎉` : `Turno de ${turn}`;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tic Tac Toe</Text>
      <Text style={styles.status}>{statusText}</Text>

      <View style={styles.board}>
        {board.map((cell, index) => (
          <TouchableOpacity key={index} style={styles.cell} onPress={() => handlePress(index)}>
            <Text style={[styles.cellText, cell === 'X' && styles.xText, cell === 'O' && styles.oText]}>
              {cell}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={restart}>
        <Text style={styles.buttonText}>Reiniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', alignItems: 'center', paddingTop: 30 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  status: { fontSize: 16, color: '#6b7280', marginVertical: 12 },
  board: { width: 300, height: 300, flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: { fontSize: 40, fontWeight: 'bold' },
  xText: { color: '#ec4899' },
  oText: { color: '#6366f1' },
  button: { marginTop: 24, backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});