import { onCall } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { admin } from '../utils/firebase';


export const fetchCustomers = onCall(async (request) => {
  // Ensure the function is called by an authenticated user
  if (!request.auth) {
    throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }
  const uid = request.auth.uid;
  try {
    // Query customers where "loan_shark_uid" equals the authenticated user's uid
    const snapshot = await admin.firestore()
      .collection('Customers')
      .where('loan_shark_uid', '==', uid)
      .get();
      
    const customers: any[] = [];
    snapshot.forEach(doc => {
      customers.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, customers };
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    throw new HttpsError('unknown', error.message, error);
  }
});