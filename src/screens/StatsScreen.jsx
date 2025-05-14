import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import api from '../api';

const StatsScreen = ({ navigation }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stats/stats');
      setStats(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#957DAD" />
          <Text style={styles.loadingText}>Loading stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>MY STATS</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
              <Text style={styles.retryButtonText}>RETRY</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.gamesPlayed || 0}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats?.wins || 0}</Text>
              <Text style={styles.statLabel}>Victories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats?.gamesPlayed > 0
                  ? Math.round((stats.wins / stats.gamesPlayed) * 100)
                  : 0}
                %
              </Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>BACK TO GAME</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#957DAD' },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: { fontSize: 24, fontWeight: '300', color: '#957DAD', letterSpacing: 2 },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    width: '30%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#957DAD', marginBottom: 5 },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '300',
  },
  errorContainer: {
    alignItems: 'center',
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF1F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCCC7',
  },
  errorText: { color: '#CF1322', marginBottom: 15, textAlign: 'center' },
  retryButton: {
    backgroundColor: '#957DAD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryButtonText: { color: 'white', fontWeight: '300' },
  backButton: {
    backgroundColor: '#957DAD',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  backButtonText: { color: 'white', fontWeight: '300', letterSpacing: 1 },
});

export default StatsScreen;
