import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let db: admin.firestore.Firestore;

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle newlines in private key which often get escaped in env vars
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    db = admin.firestore();
    console.log('Firebase Admin Initialized');
} catch (error) {
    console.warn('Firebase Initialization Skipped/Failed (Check .env credentials). DB features will be disabled.');
    // Do NOT throw error or exit; allow server to run without DB
    db = undefined as any;
}

export { db };
