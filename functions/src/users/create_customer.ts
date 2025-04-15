import { onCall } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { admin } from '../utils/firebase';
import { getDateAndTime } from '../utils/get_date_and_time';
import { getRandomUniqueCustomerNumber } from '../utils/random_unique_number';


interface CreateCustomerData {
  name: string;
  surname: string;
  phone: string;
  id: string;
//   initialLoan: string;
//   interestRate: string;
//   totalToPay: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
//   amountToPay: string;
//   scheduledDate: string;
  
}

export const createCustomer = onCall(async (request) => {
  // Require authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const uid = request.auth.uid;

  // Validate required fields
  const { name, surname, phone, id, cardNumber, cvv, expiryDate } = request.data as CreateCustomerData;

  if (!name || !surname || !phone || !id ) {
    throw new HttpsError('invalid-argument', 'Missing required fields.');
  }
  const ucn = await getRandomUniqueCustomerNumber("Customers");
        const now = getDateAndTime();

  try {

    
    // Create customer document in Firestore
    const customerData = {
      name,
      surname,
      phone,
      id,
    //   initial_loan: initialLoan,
      loan_shark_uid: uid,
      createdAt: now.iso_string_date,
      unique_customer_number: ucn,
    //   interest_rate: interestRate,
    //   total_to_pay: totalToPay,
      card_number: cardNumber,
      cvv: cvv,
      expiry_date: expiryDate,
    //   amount_to_pay: amountToPay,
    //   scheduled_date: scheduledDate,
    };

    const docRef = await admin.firestore().collection('Customers').add(customerData);

    // Query customers where "loan_shark_uid" equals the authenticated user's uid
    const snapshot = await admin.firestore()
      .collection('Customers')
      .where('loan_shark_uid', '==', uid)
      .get();
      
    const customers: any[] = [];
    snapshot.forEach(doc => {
      customers.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, customerId: docRef.id, customers };
  } catch (error: any) {
    throw new HttpsError('unknown', error.message, error);
  }
});