// firebase-admin.ts
import admin from "firebase-admin";
import serviceAccount from "./serviceAccount.json"; // Ensure tsconfig.json has "resolveJsonModule": true

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });

  // Optional: prevent errors on undefined Firestore properties
  admin.firestore().settings({ ignoreUndefinedProperties: true });
}

// Firestore DB instance
export const db = admin.firestore();

// Reference to 'users' collection
export const usersCollection = db.collection("users");

// Export admin for further usage (auth, messaging, etc)
export { admin };
