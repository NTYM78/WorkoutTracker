import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSessionStore } from '../store/sessionStore';
import { getAllWorkouts } from '../db/workoutRepo';

interface Workout {
  id: number;
  date: string;
  name: string;
  note: string;
  exerciseCount: number;
}

export default function HomeScreen() {
  const { isActive } = useSessionStore();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  useFocusEffect(
    useCallback(() => {
      const data = getAllWorkouts() as Workout[];
      setRecentWorkouts(data.slice(0, 3));
    }, [])
  );

  function formatDate(iso: string) {
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning 💪</Text>
        <Text style={styles.subtitle}>Ready to train?</Text>
      </View>

      {isActive ? (
        <TouchableOpacity style={styles.resumeButton} onPress={() => router.push('/log')}>
          <Text style={styles.startButtonText}>Resume Workout</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.startButton} onPress={() => router.push('/log')}>
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/history')}>
        <Text style={styles.historyButtonText}>View History</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Workouts</Text>

      {recentWorkouts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No workouts yet.</Text>
          <Text style={styles.emptySubtext}>Hit Start Workout to log your first session!</Text>
        </View>
      ) : (
        <>
          {recentWorkouts.map((workout) => (
           <View key={workout.id} style={styles.workoutCard}>
                <View>
                    <Text style={styles.workoutDate}>
                    {workout.name ? workout.name : 'Workout'}
                    </Text>
                    <Text style={styles.workoutMeta}>{formatDate(workout.date)}</Text>
                </View>
                    <Text style={styles.workoutMeta}>
                        {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? 's' : ''}
                    </Text>
            </View>
          ))}

          {/* Only show if there are more than 3 workouts */}
          <TouchableOpacity onPress={() => router.push('/history')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 4,
  },
  startButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  resumeButton: {
    backgroundColor: '#3a3a6a',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 36,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  historyButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutDate: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  workoutMeta: {
    color: '#666666',
    fontSize: 13,
  },
  seeAll: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});