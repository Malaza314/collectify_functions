// import { db } from "./firebase";
// import { getDateAndTime } from "./get_date_and_time";

// /**
//  * Sends an SMS message based on the recipient's country code.
//  *
//  * @param {string} countryCode - The country code of the recipient (e.g., "SA", "MZ", or other).
//  * @param {string} message - The message content to be sent.
//  * @param {string} cellNumber - The recipient's phone number.
//  * @returns {Promise<void>} Resolves when the SMS request is successfully pushed to the database.
//  * @throws {Error} If there are any issues with pushing the request to the database.
//  */
// export async function sendSMS(
//   countryCode: string,
//   message: string,
//   cellNumber: string
// ): Promise<void> {
//   const timeVariable = getDateAndTime();

//   if (countryCode === "SA") {
//     await rtdb.ref("Green").child("MessegingRequests").push({
//       sendTo: cellNumber,
//       message: message,
//       country: "SA",
//     });
//   } else if (countryCode === "MZ") {
//     await rtdb.ref("Green").child("MessegingRequests").push({
//       sendTo: cellNumber,
//       message: message,
//       country: "MZ",
//     });
//   } else {
//     await db.collection("Requests").doc().set({
//       phoneNumber: cellNumber,
//       requestType: "sms",
//       timestamp: timeVariable.timestamp,
//       country: "eSwatini",
//       status: "waiting",
//       message: message,
//     });
//   }
// }
