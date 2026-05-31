import { Stack } from 'expo-router';
import { initDB } from '../db/schema';

initDB();

export default function RootLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}