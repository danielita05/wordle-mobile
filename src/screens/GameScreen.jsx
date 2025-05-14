import React, { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, FlatList, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../api';
const GameScreen = () => {
  const navigation = useNavigation();
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [wonGame, setWonGame] = useState(false);
  const [correctWord, setCorrectWord] = useState('');

  const handleGuess = async () => {
    if (currentGuess.length !== 6) {
      Alert.alert('Invalid Word', 'Please enter a 6-letter word');
      return;
    }
    if (attemptCount >= 5) return;

    try {
      const response = await api.post('/game/attempt', {
        attempt: currentGuess.toLowerCase(),
      });

      const newGuess = {
        word: currentGuess.toUpperCase(),
        result: response.data.result.map((r) => ({ ...r, anim: new Animated.Value(1.5) })),
      };

      setGuesses([...guesses, newGuess]);
      setCurrentGuess('');
      setAttemptCount(attemptCount + 1);
      setRemainingAttempts(remainingAttempts - 1);

      newGuess.result.forEach((item) => {
        Animated.spring(item.anim, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      });

      const allCorrect = newGuess.result.every((item) => item.value === 1);
      if (allCorrect) {
        setWonGame(true);
        setGameOver(true);
        Alert.alert('Congratulations!', 'You guessed the word correctly!');
      } else if (attemptCount + 1 >= 5) {
        setCorrectWord(newGuess.word);
        setGameOver(true);
        Alert.alert('Game Over', `The correct word was: ${newGuess.word}`);
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit guess');
    }
  };

  const resetGame = async () => {
  setCurrentGuess('');
  setGuesses([]);
  setAttemptCount(0);
  setRemainingAttempts(5);
  setGameOver(false);
  setWonGame(false);
  setCorrectWord('');

  try {
    const response = await api.get('/word/current'); 
    console.log('🔤 Nueva palabra cargada:', response.data);
  } catch (error) {
    console.error('Error al obtener nueva palabra:', error);
    Alert.alert('Error', 'No se pudo obtener una nueva palabra');
  }
};

  const renderGuessLetter = ({ item }) => {
    let backgroundColor = '#E5E5E5';
    if (item.value === 1) backgroundColor = '#6AAA64';
    else if (item.value === 2) backgroundColor = '#C9B458';
    else if (item.value === 3) backgroundColor = '#787C7E';

    return (
      <Animated.View style={[styles.letterBox, { backgroundColor, transform: [{ scale: item.anim }] }]}>
        <Text style={styles.letterText}>{item.letter.toUpperCase()}</Text>
      </Animated.View>
    );
  };

  const renderGuessRow = ({ item }) => (
    <View style={styles.guessRow}>
      <FlatList
        data={item.result}
        renderItem={renderGuessLetter}
        keyExtractor={(_, index) => `letter-${index}`}
        horizontal
        contentContainerStyle={styles.guessLettersContainer}
      />
    </View>
  );

  const viewStats = () => navigation.navigate('Stats');
  const viewLeaderboard = () => navigation.navigate('Leaderboard');

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      <Text style={styles.legendText}>🟩 = Correct position</Text>
      <Text style={styles.legendText}>🟨 = Wrong position</Text>
      <Text style={styles.legendText}>⬜ = Not in word</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <Text style={styles.title}>WORDLE</Text>
          <Text style={styles.subtitle}>Attempt {attemptCount + 1} of 5</Text>
        </View>

        {renderLegend()}

        <FlatList
          data={guesses}
          renderItem={renderGuessRow}
          keyExtractor={(item, index) => `guess-${index}`}
          contentContainerStyle={styles.guessesContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No guesses yet</Text>}
        />

        {!gameOver && (
          <View style={styles.currentRow}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={[styles.letterBox, { borderColor: '#CCC', borderWidth: 1 }]}>
                <Text style={[styles.letterText, { color: '#000' }]}>{currentGuess[i]?.toUpperCase() || ''}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.inputContainer}>
          {[...'QWERTYUIOPASDFGHJKLZXCVBNM'].map((l, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.keyButton}
              disabled={gameOver || currentGuess.length >= 6}
              onPress={() => setCurrentGuess((prev) => (prev + l).slice(0, 6))}
            >
              <Text style={styles.keyButtonText}>{l}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.keyWide} onPress={() => setCurrentGuess(currentGuess.slice(0, -1))}>
            <Text style={styles.keyButtonText}>⌫</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.keyWide} onPress={handleGuess} disabled={gameOver}>
            <Text style={styles.keyButtonText}>GUESS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          {gameOver && (
            <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
              <Text style={styles.resetButtonText}>NEW GAME</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.statsButton} onPress={viewStats}>
            <Text style={styles.statsButtonText}>MY STATS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.leaderboardButton} onPress={viewLeaderboard}>
            <Text style={styles.leaderboardButtonText}>LEADERBOARD</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardAvoid: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: { fontSize: 32, fontWeight: '300', color: '#957DAD', letterSpacing: 4 },
  subtitle: { marginTop: 8, fontSize: 16, color: '#957DAD', fontWeight: '300' },
  guessesContainer: { flexGrow: 1, padding: 20 },
  emptyText: { textAlign: 'center', color: '#957DAD', marginTop: 40, fontWeight: '300' },
  guessRow: { marginBottom: 10 },
  guessLettersContainer: { justifyContent: 'center' },
  currentRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  letterBox: {
    width: 50,
    height: 50,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  letterText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  inputContainer: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 10,
  },
  keyButton: {
    width: 40,
    height: 40,
    backgroundColor: '#E0BBE4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 4,
  },
  keyWide: {
    width: 90,
    height: 40,
    backgroundColor: '#957DAD',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    margin: 6,
  },
  keyButtonText: { color: 'white', fontWeight: 'bold' },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resetButton: {
    backgroundColor: '#E0BBE4', borderRadius: 6, padding: 10, flex: 1, marginHorizontal: 5, alignItems: 'center',
  },
  resetButtonText: { color: 'white', fontWeight: '300', letterSpacing: 1 },
  statsButton: {
    backgroundColor: '#D0BDF4', borderRadius: 6, padding: 10, flex: 1, marginHorizontal: 5, alignItems: 'center',
  },
  statsButtonText: { color: 'white', fontWeight: '300', letterSpacing: 1 },
  leaderboardButton: {
    backgroundColor: '#957DAD', borderRadius: 6, padding: 10, flex: 1, marginHorizontal: 5, alignItems: 'center',
  },
  leaderboardButtonText: { color: 'white', fontWeight: '300', letterSpacing: 1 },
  legendContainer: {
    flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, paddingHorizontal: 20,
  },
  legendText: {
    color: '#555', fontSize: 14, fontWeight: '500', textAlign: 'center',
  },
});

export default GameScreen;
