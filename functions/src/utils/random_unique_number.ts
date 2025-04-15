import { db } from "./firebase";

/**
 * Generates a random 12-digit unique customer number and ensures it is unique in the Firestore database.
 * Used for unique customer numbers (UCN)🔥
 * @returns {Promise<string>} A unique 12-digit customer number as a string.
 * @throws {Error} If an error occurs while checking uniqueness in Firestore.
 */

export async function getRandomUniqueCustomerNumber(collectionName: string): Promise<string> {
  const minNumber = Math.pow(10, 11);
  const maxNumber = Math.pow(10, 12) - 1;
  let customerNumber =
    Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;

  while (!(await isCustomerNumberUnique(collectionName, customerNumber.toString()))) {
    customerNumber =
      Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
  }

  return String(customerNumber);
}

async function isCustomerNumberUnique(collectionName: string, value: string): Promise<boolean> {
  const querySnapshot = await db
    .collection(collectionName)
    .where("unique_customer_number", "==", value)
    .limit(1)
    .get();
  return querySnapshot.empty;
}
