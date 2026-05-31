import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getAllWorkouts, getWorkoutDetails, deleteWorkout } from '../db/workoutRepo';

interface Workout {
  id: number;
  date: string;
  name: string;
  notes: string;
  exerciseCount: number;
}

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, any[]>>({});

  useFocusEffect(
    useCallback(() => {
      const data = getAllWorkouts() as Workout[];
      setWorkouts(data);
    }, [])
  );

  function handleExpand(workoutId: number) {
    if (expandedId === workoutId) {
      setExpandedId(null);
      return;
    }
    const workoutDetails = getWorkoutDetails(workoutId);
    setDetails(prev => ({ ...prev, [workoutId]: workoutDetails }));
    setExpandedId(workoutId);
  }

  function handleDelete(workoutId: number) {
    Alert.alert(
      'Delete Workout',
      'This will permanently delete this session and all its sets. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteWorkout(workoutId);
            setWorkouts(prev => prev.filter(w => w.id !== workoutId));
            if (expandedId === workoutId) setExpandedId(null);
          },
        },
      ]
    );
  }

  function formatDate(iso: string) {
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <ScrollView style={styles.container}>

      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>History</Text>

      {workouts.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No workouts yet.</Text>
          <Text style={styles.emptySubtext}>Finished sessions will appear here.</Text>
        </View>
      )}

      {workouts.map((workout) => (
        <TouchableOpacity
          key={workout.id}
          style={styles.workoutCard}
          onPress={() => handleExpand(workout.id)}
          activeOpacity={0.8}
        >
          {/* Header row */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
                <Text style={styles.workoutDate}>
                    {workout.name ? workout.name : 'Workout'}
                </Text>
                <Text style={styles.workoutMeta}>
                    {formatDate(workout.date)} · {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? 's' : ''}
                </Text>
            </View>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDelete(workout.id);
                }}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <Text style={styles.chevron}>{expandedId === workout.id ? '▲' : '▼'}</Text>
            </View>
          </View>

          {/* Expanded details */}
          {expandedId === workout.id && details[workout.id] && (
            <View style={styles.detailsContainer}>
                <View style={styles.divider} />
                    {details[workout.id] && workout.notes ? (
                        <View style={styles.notesBlock}>
                            <Text style={styles.notesLabel}>Notes</Text>
                            <Text style={styles.notesText}>{workout.notes}</Text>
                        </View>
                    ) : null}
                {details[workout.id].map((exercise, ei) => (
                    <View key={ei} style={styles.exerciseBlock}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        {exercise.sets.map((s: any, si: number) => (
                            <Text key={si} style={styles.setRow}>
                                Set {si + 1}: {s.weight}kg × {s.reps} reps
                            </Text>
                        ))}
                    </View>
                ))}
            </View>
          )}
        </TouchableOpacity>
      ))}

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
  backButton: {
    marginTop: 60,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
    marginBottom: 24,
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
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutDate: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutMeta: {
    color: '#666666',
    fontSize: 13,
    marginTop: 3,
  },
  deleteButton: {
    backgroundColor: '#2a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#5a2a2a',
  },
  deleteButtonText: {
    color: '#E24B4A',
    fontSize: 13,
    fontWeight: '600',
  },
  chevron: {
    color: '#6C63FF',
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginBottom: 12,
  },
  exerciseBlock: {
    marginBottom: 12,
  },
  exerciseName: {
    color: '#6C63FF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  setRow: {
    color: '#aaaaaa',
    fontSize: 13,
    marginTop: 3,
  },
  notesBlock: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  notesLabel: {
    color: '#555',
    fontSize: 11,
    marginBottom: 4,
  },
  notesText: {
    color: '#aaaaaa',
    fontSize: 13,
    lineHeight: 20,
  },
});