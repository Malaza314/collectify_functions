import { auth, db, functions, HttpsError, storage } from "../utils/firebase";
import { getDateAndTime } from "../utils/get_date_and_time";
import { getRandomUniqueCustomerNumber } from "../utils/random_unique_number";
// import { savePDFs } from "../utils/save_pdfs";

interface CreateUserData {
  username: string;
  surname: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  password: string;
  idFile: string;
  LendingLicenseFile: string;
}

export const createUser = functions.https.onCall(async (request) => {
  const data: CreateUserData = request.data;

  // Validate required fields
  if (
    !data.username ||
    !data.surname ||
    !data.idNumber ||
    !data.phoneNumber ||
    !data.email ||
    !data.password ||
    !data.idFile ||
    !data.LendingLicenseFile
  ) {
    throw new HttpsError('invalid-argument', 'Missing required fields.');
  }

  try {
    // Create a new user in Firebase Auth
    const userRecord = await auth.createUser({
      email: data.email,
      password: data.password,
      displayName: `${data.username} ${data.surname}`,
    });

    // Store additional user details in Firestore
    const ucn = await getRandomUniqueCustomerNumber("users");
    const now = getDateAndTime();

    // await savePDFs(
    //   [data.idFile, data.LendingLicenseFile],
    //   userRecord.uid,
    //   'MerchantDocuments'
    // );

    // File storage paths
    const idFileStoragePath = `Merchant-Documents/${userRecord.uid}/IDFile_${now.timestamp}.pdf`;
    const lendingLicenseFileStoragePath = `Merchant-Documents/${userRecord.uid}/LendingLicenseFile_${now.timestamp}.pdf`;

    // Save the files to Firebase Storage
    const bucket = storage.bucket();
    await bucket.file(idFileStoragePath).save(Buffer.from(data.idFile, 'base64'), {
      contentType: 'application/pdf'
    });
    await bucket.file(lendingLicenseFileStoragePath).save(Buffer.from(data.LendingLicenseFile, 'base64'), {
      contentType: 'application/pdf'
    });

    await db.collection('users').doc(userRecord.uid).set({
      username: data.username,
      surname: data.surname,
      id_number: data.idNumber,
      phone_number: data.phoneNumber,
      email: data.email,
      id_file: idFileStoragePath,
      Lending_license_file: lendingLicenseFileStoragePath,
      created_at: now.iso_string_date,
      unique_customer_number: ucn,
      status: 'pending',
    });

    // Optionally store file paths in Firestore for future retrieval
    await db.collection('MerchantDocuments').doc(userRecord.uid).set({
      id_file: idFileStoragePath,
      lending_license_file: lendingLicenseFileStoragePath,
      unique_customer_number: ucn,
      created_at: now.iso_string_date,
    });

    

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('Error creating user:', error);
    throw new HttpsError('unknown', error.message, error);
  }
});