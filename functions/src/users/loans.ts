import { onCall } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';
import { admin } from '../utils/firebase';
import { getDateAndTime } from '../utils/get_date_and_time';
import { getRandomUniqueCustomerNumber } from '../utils/random_unique_number';



interface CreateLoanData {
customer_id: string;
// initial_loan: string;
// interest_rate: string;
// total_to_pay: string;
amount_to_pay: string;
scheduled_date: string;
unique_customer_number: string;
}

export const createLoan = onCall(async (request, context) => {
  // Ensure the user is authenticated.
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  // Destructure and validate required fields.
  const { unique_customer_number, customer_id,  amount_to_pay, scheduled_date } = request.data as CreateLoanData;
  if (!unique_customer_number || !customer_id || !amount_to_pay || !scheduled_date) {
    throw new HttpsError('invalid-argument', 'Missing required fields.');
  }

  console.log("*********Customer ID:", customer_id);
//   console.log("*********Loan Amount:", initial_loan);
//   console.log("*********Interest Rate:", interest_rate);
//   console.log("*********Total to Pay:", total_to_pay);
  console.log("*********Amount to Pay:", amount_to_pay);
  console.log("*********Scheduled Date:", scheduled_date);
  console.log("*********UCN:", unique_customer_number);

  const now = getDateAndTime();
  const uln = await getRandomUniqueCustomerNumber("loans");

  try {
    // Prepare the loan data. Convert numeric fields from strings to numbers.
    const loanData = {
        unique_customer_number,
      customer_id,
    //   initial_loan: parseFloat(initial_loan),
    //   interest_rate: parseFloat(interest_rate),
    //   total_to_pay: parseFloat(total_to_pay),
      amount_to_pay: parseFloat(amount_to_pay),
      scheduled_date,
      created_at: now.iso_string_date,
      unique_loan_number: uln,
      created_by: request.auth.uid,
      timestamp: now.timestamp,
      status: "pending",
    };

    // Create a new loan document in the 'loans' collection.
    const docRef = await admin.firestore().collection('loans').add(loanData);
    return { success: true, loanId: docRef.id };
  } catch (error: any) {
    throw new HttpsError('unknown', error.message, error);
  }
});