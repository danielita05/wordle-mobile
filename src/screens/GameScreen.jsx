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
        setCorrectWord(response.data.correctWord);
        setGameOver(true);
        Alert.alert('Game Over', `The correct word was: ${response.data.correctWord}`);
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

  // Componente para renderizar una fila de letras uniforme
  const renderGuessRow = ({ item, index }) => (
    <View style={styles.guessRow}>
      {item.result.map((letterResult, letterIndex) => {
        let backgroundColor = '#E5E5E5';
        if (letterResult.value === 1) backgroundColor = '#6AAA64';
        else if (letterResult.value === 2) backgroundColor = '#C9B458';
        else if (letterResult.value === 3) backgroundColor = '#787C7E';
        
        return (
          <Animated.View 
            key={`letter-${index}-${letterIndex}`} 
            style={[
              styles.letterBox, 
              { backgroundColor, transform: [{ scale: letterResult.anim }] }
            ]}
          >
            <Text style={styles.letterText}>{letterResult.letter.toUpperCase()}</Text>
          </Animated.View>
        );
      })}
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

  // Renderiza filas vacías para mantener la estructura
  const renderEmptyRows = () => {
    const emptyRowsCount = 5 - guesses.length;
    if (emptyRowsCount <= 0) return null;

    return Array(emptyRowsCount).fill().map((_, i) => (
      <View key={`empty-row-${i}`} style={styles.guessRow}>
        {i === 0 && !gameOver ? (
          // Primera fila vacía muestra la entrada actual
          Array(6).fill().map((_, j) => (
            <View key={`current-${j}`} style={[styles.letterBox, { borderColor: '#CCC', borderWidth: 1, backgroundColor: 'white' }]}>
              <Text style={[styles.letterText, { color: '#000' }]}>{currentGuess[j]?.toUpperCase() || ''}</Text>
            </View>
          ))
        ) : (
          // Otras filas vacías
          Array(6).fill().map((_, j) => (
            <View key={`empty-${i}-${j}`} style={[styles.letterBox, { borderColor: '#E5E5E5', borderWidth: 1, backgroundColor: 'white' }]}>
              <Text style={[styles.letterText, { color: 'white' }]}></Text>
            </View>
          ))
        )}
      </View>
    ));
  };

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

        <View style={styles.gameArea}>
          {/* Adivinanzas ya realizadas */}
          {guesses.map((guess, index) => renderGuessRow({ item: guess, index }))}
          
          {/* Filas vacías y fila actual */}
          {renderEmptyRows()}
        </View>

        <View style={styles.keyboardContainer}>
          <View style={styles.keyboardRow}>
            {[...'QWERTYUIOP'].map((letter) => (
              <TouchableOpacity
                key={letter}
                style={styles.keyButton}
                disabled={gameOver || currentGuess.length >= 6}
                onPress={() => setCurrentGuess((prev) => (prev + letter).slice(0, 6))}
              >
                <Text style={styles.keyButtonText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.keyboardRow}>
            <View style={styles.keyboardSpacer} />
            {[...'ASDFGHJKL'].map((letter) => (
              <TouchableOpacity
                key={letter}
                style={styles.keyButton}
                disabled={gameOver || currentGuess.length >= 6}
                onPress={() => setCurrentGuess((prev) => (prev + letter).slice(0, 6))}
              >
                <Text style={styles.keyButtonText}>{letter}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.keyboardSpacer} />
          </View>
          
          <View style={styles.keyboardRow}>
            <TouchableOpacity 
              style={styles.keyWide} 
              onPress={handleGuess} 
              disabled={gameOver || currentGuess.length !== 6}
            >
              <Text style={styles.keyButtonText}>GUESS</Text>
            </TouchableOpacity>
            
            {[...'ZXCVBNM'].map((letter) => (
              <TouchableOpacity
                key={letter}
                style={styles.keyButton}
                disabled={gameOver || currentGuess.length >= 6}
                onPress={() => setCurrentGuess((prev) => (prev + letter).slice(0, 6))}
              >
                <Text style={styles.keyButtonText}>{letter}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.keyWide} 
              onPress={() => setCurrentGuess(currentGuess.slice(0, -1))}
            >
              <Text style={styles.keyButtonText}>⌫</Text>
            </TouchableOpacity>
          </View>
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
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  keyboardAvoid: { 
    flex: 1 
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: { 
    fontSize: 32, 
    fontWeight: '300', 
    color: '#957DAD', 
    letterSpacing: 4 
  },
  subtitle: { 
    marginTop: 5, 
    fontSize: 16, 
    color: '#957DAD', 
    fontWeight: '300' 
  },
  gameArea: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  guessRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    height: 60,
  },
  letterBox: {
    width: 50,
    height: 50,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  letterText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white' 
  },
  keyboardContainer: {
    paddingHorizontal: 5,
    marginTop: 10,
    marginBottom: 5,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  keyboardSpacer: {
    width: 20,
  },
  keyButton: {
    width: 30,
    height: 40,
    backgroundColor: '#E0BBE4',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 2,
  },
  keyWide: {
    width: 60,
    height: 40,
    backgroundColor: '#957DAD',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 2,
  },
  keyButtonText: { 
    color: 'white', 
    fontWeight: 'bold',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 5,
  },
  resetButton: {
    backgroundColor: '#E0BBE4', 
    borderRadius: 6, 
    padding: 10, 
    flex: 1, 
    marginHorizontal: 5, 
    alignItems: 'center',
  },
  resetButtonText: { 
    color: 'white', 
    fontWeight: '300', 
    letterSpacing: 1 
  },
  statsButton: {
    backgroundColor: '#D0BDF4', 
    borderRadius: 6, 
    padding: 10, 
    flex: 1, 
    marginHorizontal: 5, 
    alignItems: 'center',
  },
  statsButtonText: { 
    color: 'white', 
    fontWeight: '300', 
    letterSpacing: 1 
  },
  leaderboardButton: {
    backgroundColor: '#957DAD', 
    borderRadius: 6, 
    padding: 10, 
    flex: 1, 
    marginHorizontal: 5, 
    alignItems: 'center',
  },
  leaderboardButtonText: { 
    color: 'white', 
    fontWeight: '300', 
    letterSpacing: 1 
  },
  legendContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginVertical: 10, 
    paddingHorizontal: 10,
  },
  legendText: {
    color: '#555', 
    fontSize: 12, 
    fontWeight: '500', 
    textAlign: 'center',
  },
});

export default GameScreen;