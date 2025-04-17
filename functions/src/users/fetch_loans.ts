import { onCall } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';


interface fetchLoanTransactions {
    ucn: string;
}

export const fetchLoanTransactions = onCall(async (request, context) => {
  // Ensure the function is called while authenticated.
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }


  const { ucn } = request.data as fetchLoanTransactions;
  const uniqueCustomerNumber = ucn;
  if (!uniqueCustomerNumber) {
    throw new HttpsError('invalid-argument', 'Unique customer number is required.');
  }
    console.log("*********UCN:", uniqueCustomerNumber);

  try {
    // Query the 'loans' collection for documents with matching unique_customer_number,
    // order them by creation date descending and limit to 30 results.
    const snapshot = await admin.firestore()
      .collection('loans')
      .where('unique_customer_number', '==', uniqueCustomerNumber)
    //   .orderBy('timestamp', 'desc')
      .limit(100)
      .get();
    
    const transactions: any[] = [];
    console.log("*********Loan Transactions Count:", snapshot.size);
    snapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
      console.log("*********Loan Transaction:", doc.id, doc.data());
    });
    return { transactions };
  } catch (error: any) {
    throw new HttpsError('unknown', error.message, error);
  }
});