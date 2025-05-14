import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import api from '../api'; // Ajusta la ruta si es necesario

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    try {
      let token = null;

      if (isSignUp) {
        await api.post('/auth/register', { username, email, password });
        const loginResponse = await api.post('/auth/login', { email, password });
        token = loginResponse.data.access_token;
      } else {
        const response = await api.post('/auth/login', { email, password });
        token = response.data.access_token;
      }

      if (!token) {
        throw new Error('No token received from server');
      }

      await SecureStore.setItemAsync('token', token);
      Alert.alert('Success', 'Authentication successful!');
      navigation.navigate('Game');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Authentication error');
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <LinearGradient colors={['#E0BBE4', '#FEC8D8']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.title}>
                {isSignUp ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
              </Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {isSignUp && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>USERNAME</Text>
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>EMAIL</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {isSignUp ? 'SIGN UP' : 'LOGIN'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toggleContainer} onPress={toggleMode}>
                <Text style={styles.toggleText}>
                  {isSignUp ? 'Already have an account? Log in' : 'Need an account? Sign up'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 24,
    color: '#957DAD',
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#B91C1C' },
  inputContainer: { marginBottom: 16 },
  label: {
    color: '#957DAD',
    marginBottom: 8,
    fontWeight: '300',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0BDF4',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#957DAD',
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '300',
    letterSpacing: 2,
    fontSize: 16,
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#957DAD',
    fontWeight: '300',
  },
});

export default Login;
