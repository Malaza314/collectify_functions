import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// ✅ Ensure Firebase is initialized only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// ✅ Export common Firebase services
 const db = admin.firestore();
 const auth = admin.auth();
//  const rtdb = admin.database();
 const storage = admin.storage();
//  const messaging = admin.messaging();
const HttpsError = functions.https.HttpsError;

export {
    admin, 
    auth, 
    functions, 
    HttpsError,
    db, 
    storage
}
