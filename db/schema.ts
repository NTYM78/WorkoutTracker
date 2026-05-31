import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('workouttracker.db');

export function initDB() {
    db.execSync(`
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            name TEXT,
            notes TEXT
        );

        CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workout_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY (workout_id) REFERENCES workouts(id)
        );

        CREATE TABLE IF NOT EXISTS sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exercise_id INTEGER NOT NULL,
            reps INTEGER NOT NULL,
            weight REAL NOT NULL,
            FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        );
    `);

    try {
        db.execSync('ALTER TABLE workouts ADD COLUMN name TEXT;');
    } catch {
        // column exists, ignore
    }
}

export default db;