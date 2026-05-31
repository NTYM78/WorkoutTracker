import db from './schema';

export function createWorkout(name: string = '', notes: string = ''): number {
    const date = new Date().toISOString();
    const result = db.runSync(
        'INSERT INTO workouts (date, name, notes) VALUES (?, ?, ?)',
        [date, name, notes]
    );
    return result.lastInsertRowId;
}

export function createExercise(workoutId: number, name: string): number {
    const result = db.runSync(
        'INSERT INTO exercises (workout_id, name) VALUES (?, ?)',
        [workoutId, name]
    );
    return result.lastInsertRowId;
}

export function createSet(exerciseId: number, reps: number, weight: number): void {
    db.runSync(
        'INSERT INTO sets (exercise_id, reps, weight) VALUES (?, ?, ?)',
        [exerciseId, reps, weight]
    );
}

export function getAllWorkouts() {
    return db.getAllSync(`
        SELECT
            w.id,
            w.date,
            w.name,
            w.notes,
            COUNT(DISTINCT e.id) as exerciseCount
        FROM workouts w
        LEFT JOIN exercises e ON e.workout_id = w.id
        GROUP BY w.id
        ORDER BY w.date DESC    
    `);
}

export function getWorkoutDetails(workoutId: number) {
    const exercises = db.getAllSync(
        'SELECT * FROM exercises WHERE workout_id = ?',
        [workoutId]
    ) as {id: number; name: string}[];

    return exercises.map(exercise => ({
        ...exercise,
        sets: db.getAllSync(
            'SELECT * FROM sets WHERE exercise_id = ?',
            [exercise.id]
        ),
    }));
}

export function deleteWorkout(workoutId: number): void {
    db.runSync('DELETE FROM sets WHERE exercise_id IN (SELECT id FROM exercises WHERE workout_id = ?)', [workoutId]);
    db.runSync('DELETE FROM exercises WHERE workout_id = ?', [workoutId]);
    db.runSync('DELETE FROM workouts WHERE id = ?', [workoutId]);
}