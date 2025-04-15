import { onCall } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { admin } from '../utils/firebase';

export const fetchCustomerInfo = onCall(async (request, context) => {
  // Require that the user is authenticated.
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }
  
  const id = request.data.id;
  if (!id) {
    throw new HttpsError('invalid-argument', 'Customer id is required.');
  }
  console.log("*********Customer ID:", id);
  
  try {
    // Execute the query to match the 'id'
    const querySnapshot = await admin.firestore()
      .collection('Customers')
      .where('id', '==', id)
      .get();
      
    if (querySnapshot.empty) {
      throw new HttpsError('not-found', 'Customer not found.');
    }
    
    // Return the data from the first matching document
    const customerData = querySnapshot.docs[0].data();
    return customerData || {};
  } catch (error: any) {
    throw new HttpsError('unknown', error.message, error);
  }
});