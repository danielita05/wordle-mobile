import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../api';

const LeaderboardScreen = ({ navigation }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [popularWords, setPopularWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('players');

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);

      const playersResponse = await api.get('/leaderboard');
      setLeaderboard(playersResponse.data);

      const wordsResponse = await api.get('/stats/most-guessed-words');
      setPopularWords(wordsResponse.data);

      setError('');
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboardData();
  };

  const renderPlayerItem = ({ item, index }) => (
    <View style={[styles.itemContainer, index < 3 && styles.topThree]}>
      <View style={[styles.rankBadge, getRankStyle(index)]}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.username}</Text>
        <Text style={styles.playerScore}>{item.wins} wins</Text>
      </View>
    </View>
  );

  const renderWordItem = ({ item, index }) => (
    <View style={[styles.itemContainer, index < 3 && styles.topThree]}>
      <View style={[styles.rankBadge, getRankStyle(index)]}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.word}</Text>
        <Text style={styles.playerScore}>{item.count} correct guesses</Text>
      </View>
    </View>
  );

  const getRankStyle = (index) => {
    if (index === 0) return styles.firstPlace;
    if (index === 1) return styles.secondPlace;
    if (index === 2) return styles.thirdPlace;
    return {};
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#957DAD" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LEADERBOARD</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'players' && styles.activeTab]}
          onPress={() => setActiveTab('players')}
        >
          <Text style={[styles.tabText, activeTab === 'players' && styles.activeTabText]}>
            TOP PLAYERS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'words' && styles.activeTab]}
          onPress={() => setActiveTab('words')}
        >
          <Text style={[styles.tabText, activeTab === 'words' && styles.activeTabText]}>
            POPULAR WORDS
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLeaderboardData}>
            <Text style={styles.retryButtonText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'players' ? leaderboard : popularWords}
          renderItem={activeTab === 'players' ? renderPlayerItem : renderWordItem}
          keyExtractor={(item, index) => `${activeTab}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No data available</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#957DAD']}
              tintColor="#957DAD"
            />
          }
        />
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>BACK TO GAME</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#957DAD' },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: { fontSize: 24, fontWeight: '300', color: '#957DAD', letterSpacing: 2 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#957DAD' },
  tabText: { color: '#888', fontWeight: '300', letterSpacing: 1 },
  activeTabText: { color: '#957DAD', fontWeight: '500' },
  listContent: { padding: 10 },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    marginVertical: 5,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  topThree: { backgroundColor: '#F0EBF8' },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  firstPlace: { backgroundColor: '#FFD700' },
  secondPlace: { backgroundColor: '#C0C0C0' },
  thirdPlace: { backgroundColor: '#CD7F32' },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: '500', color: '#333' },
  playerScore: { fontSize: 14, color: '#666', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#888', fontStyle: 'italic' },
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
    margin: 20,
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  backButtonText: { color: 'white', fontWeight: '300', letterSpacing: 1 },
});

export default LeaderboardScreen;
