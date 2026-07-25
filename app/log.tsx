import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, Modal
} from 'react-native';
import { router } from 'expo-router';
import { useSessionStore } from '../store/sessionStore';
import { createWorkout, createExercise, createSet } from '../db/workoutRepo';

export default function LogScreen() {
  const {
    isActive, workoutName, notes, exercises,
    startSession, addExercise, removeExercise, addSet, removeSet, updateSet, setNotes, endSession
  } = useSessionStore();

  const [nameInput, setNameInput] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');

  // Set action modal state
  const [setActionVisible, setSetActionVisible] = useState(false);
  const [actionExerciseIdx, setActionExerciseIdx] = useState<number | null>(null);
  const [actionSetIdx, setActionSetIdx] = useState<number | null>(null);

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editWeight, setEditWeight] = useState('');
  const [editReps, setEditReps] = useState('');

  function handleDeleteExercise(index: number) {
    Alert.alert(
      'Delete Exercise',
      `Delete "${exercises[index].name}" and all its sets?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeExercise(index);
            if (selectedExercise === index) setSelectedExercise(null);
            else if (selectedExercise !== null && selectedExercise > index)
              setSelectedExercise(selectedExercise - 1);
          },
        },
      ]
    );
  }

  function handleStartWorkout() {
    startSession(nameInput.trim());
  }

  function handleAddExercise() {
    if (!exerciseName.trim()) {
      Alert.alert('Enter an exercise name first');
      return;
    }
    addExercise(exerciseName.trim());
    setSelectedExercise(exercises.length);
    setExerciseName('');
  }

  function handleAddSet() {
    // If the exercise name field has text, auto-add that exercise first
    let targetExercise = selectedExercise;
    if (exerciseName.trim()) {
      addExercise(exerciseName.trim());
      targetExercise = exercises.length; // new exercise will be at this index
      setSelectedExercise(exercises.length);
      setExerciseName('');
    }

    if (targetExercise === null) {
      Alert.alert('Select an exercise first');
      return;
    }
    if (!reps || !weight) {
      Alert.alert('Enter both reps and weight');
      return;
    }
    addSet(targetExercise, parseInt(reps), parseFloat(weight));
    setReps('');
    setWeight('');
  }

  function handleFinishPress() {
    if (exercises.length === 0) {
      Alert.alert(
        'Empty Workout',
        'You have not added any exercises. Discard this session?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              endSession();
              router.replace('/');
            }
          }
        ]
      );
      return;
    }
    // Pre-fill modal with whatever notes exist so far
    setFinalNotes(notes);
    setFinishModalVisible(true);
  }

  function handleSave() {
    const workoutId = createWorkout(workoutName, finalNotes.trim());
    exercises.forEach((exercise) => {
      const exerciseId = createExercise(workoutId, exercise.name);
      exercise.sets.forEach((s) => {
        createSet(exerciseId, s.reps, s.weight);
      });
    });
    endSession();
    setFinishModalVisible(false);
    router.replace('/');
  }

  // Opens the action sheet when a set row is long-pressed
  function handleSetLongPress(exerciseIdx: number, setIdx: number) {
    setActionExerciseIdx(exerciseIdx);
    setActionSetIdx(setIdx);
    setSetActionVisible(true);
  }

  // Opens the edit modal pre-filled with current values
  function openEditModal() {
    if (actionExerciseIdx === null || actionSetIdx === null) return;
    const s = exercises[actionExerciseIdx].sets[actionSetIdx];
    setEditWeight(String(s.weight));
    setEditReps(String(s.reps));
    setSetActionVisible(false);
    setEditModalVisible(true);
  }

  // Confirms the edit
  function handleConfirmEdit() {
    if (actionExerciseIdx === null || actionSetIdx === null) return;
    if (!editReps || !editWeight) {
      Alert.alert('Enter both reps and weight');
      return;
    }
    updateSet(actionExerciseIdx, actionSetIdx, parseInt(editReps), parseFloat(editWeight));
    setEditModalVisible(false);
  }

  // Deletes the set after confirmation
  function handleDeleteSet() {
    if (actionExerciseIdx === null || actionSetIdx === null) return;
    setSetActionVisible(false);
    Alert.alert(
      'Remove Set',
      `Remove Set ${actionSetIdx + 1}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSet(actionExerciseIdx!, actionSetIdx!),
        },
      ]
    );
  }

  if (!isActive) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Workout</Text>

        <Text style={styles.label}>Workout name (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Push Day, Upper, Legs..."
          placeholderTextColor="#555"
          value={nameInput}
          onChangeText={setNameInput}
        />

        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>Begin Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        {workoutName ? workoutName : 'Current Workout'}
      </Text>

      {/* Exercises */}
      {exercises.map((exercise, index) => (
      <TouchableOpacity
          key={index}
          style={[styles.exerciseCard, selectedExercise === index && styles.exerciseCardActive]}
          onPress={() => setSelectedExercise(index)}
        >
          <View style={styles.exerciseCardHeader}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TouchableOpacity
              style={styles.deleteExerciseButton}
              onPress={() => handleDeleteExercise(index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.deleteExerciseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.setCount}>{exercise.sets.length} sets</Text>
          {exercise.sets.map((s, si) => (
            <TouchableOpacity
              key={si}
              style={styles.setRowContainer}
              onLongPress={() => handleSetLongPress(index, si)}
              delayLongPress={350}
            >
              <Text style={styles.setRow}>
                Set {si + 1}: {s.weight}kg × {s.reps} reps
              </Text>
              <Text style={styles.setRowHint}>hold to edit</Text>
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
      ))}

      {/* Add exercise */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Add Exercise</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Bench Press"
          placeholderTextColor="#555"
          value={exerciseName}
          onChangeText={setExerciseName}
        />
        <TouchableOpacity style={styles.secondaryButton} onPress={handleAddExercise}>
          <Text style={styles.secondaryButtonText}>+ Add Exercise</Text>
        </TouchableOpacity>
      </View>

      {/* Add set */}
      {selectedExercise !== null && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Log Set for: {exercises[selectedExercise]?.name}
          </Text>
          <View style={styles.row}>
             <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Weight (kg)"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Reps"
              placeholderTextColor="#555"
              keyboardType="numeric"
              value={reps}
              onChangeText={setReps}
            />
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleAddSet}>
            <Text style={styles.secondaryButtonText}>+ Log Set</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Session notes */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Session notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="How are you feeling? Any PRs today?"
          placeholderTextColor="#555"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={handleFinishPress}>
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />

      {/* Finish modal — final notes edit */}
      <Modal
        visible={finishModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFinishModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Finish Workout</Text>
            <Text style={styles.modalSubtitle}>
              {workoutName ? workoutName : 'Untitled Workout'} · {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </Text>

            <Text style={styles.label}>Final notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Any last thoughts on this session?"
              placeholderTextColor="#555"
              value={finalNotes}
              onChangeText={setFinalNotes}
              multiline
              autoFocus
            />

            <TouchableOpacity style={styles.startButton} onPress={handleSave}>
              <Text style={styles.startButtonText}>Save Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setFinishModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Keep Training</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Set action sheet — shown on long-press of a set row */}
      <Modal
        visible={setActionVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSetActionVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {actionExerciseIdx !== null && actionSetIdx !== null
                ? `Set ${actionSetIdx + 1} — ${exercises[actionExerciseIdx]?.name}`
                : ''}
            </Text>
            {actionExerciseIdx !== null && actionSetIdx !== null && (
              <Text style={styles.modalSubtitle}>
                {exercises[actionExerciseIdx]?.sets[actionSetIdx]?.weight}kg ×{' '}
                {exercises[actionExerciseIdx]?.sets[actionSetIdx]?.reps} reps
              </Text>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={openEditModal}>
              <Text style={styles.actionButtonText}>✏️  Edit Set</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.actionButtonDanger]} onPress={handleDeleteSet}>
              <Text style={styles.actionButtonTextDanger}>🗑️  Remove Set</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSetActionVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit set modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Set</Text>
            {actionExerciseIdx !== null && actionSetIdx !== null && (
              <Text style={styles.modalSubtitle}>
                {exercises[actionExerciseIdx]?.name} · Set {(actionSetIdx ?? 0) + 1}
              </Text>
            )}

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Weight (kg)"
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={editWeight}
                onChangeText={setEditWeight}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Reps"
                placeholderTextColor="#555"
                keyboardType="numeric"
                value={editReps}
                onChangeText={setEditReps}
              />
            </View>

            <TouchableOpacity style={styles.startButton} onPress={handleConfirmEdit}>
              <Text style={styles.startButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  startButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  exerciseCardActive: {
    borderColor: '#6C63FF',
  },
  exerciseName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  deleteExerciseButton: {
    padding: 4,
  },
  deleteExerciseText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '700',
  },
  setCount: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 8,
  },
  setRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 4,
    marginTop: 2,
    borderRadius: 6,
    backgroundColor: '#222',
    marginBottom: 4,
  },
  setRow: {
    color: '#aaaaaa',
    fontSize: 13,
  },
  setRowHint: {
    color: '#444',
    fontSize: 10,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginTop: 24,
  },
  label: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 14,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 10,
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  secondaryButtonText: {
    color: '#6C63FF',
    fontSize: 15,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 48,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonDanger: {
    borderColor: '#ff4d4d33',
    backgroundColor: '#1a0f0f',
  },
  actionButtonTextDanger: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
});