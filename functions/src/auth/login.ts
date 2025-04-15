import { onCall } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { db } from '../utils/firebase';


export const login = onCall(async (request) => {
  try {
    const reqAuth = request.auth;
    if (!reqAuth) {
      throw new HttpsError('unauthenticated', 'User is not authenticated.');
    }

    const uid = reqAuth.uid;

    const usersSnap = await db.collection("users").doc(uid).get();
    if (!usersSnap.exists) {
      throw new HttpsError('not-found', 'User not found.');
    }

    const userData = usersSnap.data();
    if (!userData) {
      throw new HttpsError('not-found', 'User data not found.');
    }

    const status = userData.status;
    if (!status) {
      throw new HttpsError('not-found', 'User status not found.');
    }

    if (status == "pending") {
      return { success: false, message: "User is pending approval." };
    }

    return { success: true, message: "User is logged in.", data: userData };
  } catch (error: any) {
    throw new HttpsError('unknown', error.message, error);
  }
});