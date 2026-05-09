import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("finora.db");

export { db };
