/**
 * Validates a phone number against the E.164 format.
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {boolean} - Returns true if the phone number is valid, false otherwise.
 */


function phoneE164Validator(phoneNumber) {
    // E.164 format: + followed by 1-15 digits, starting with a digit from 1-9
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }
  
  export default phoneE164Validator;
  