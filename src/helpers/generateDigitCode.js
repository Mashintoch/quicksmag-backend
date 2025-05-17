function generateDigitCode(length = 8) {
  if (length < 1 || !Number.isInteger(length)) {
    throw new Error("Code length must be a positive integer.");
  }

  if (length > 15) {
    throw new Error("Code length must not exceed 15 digits.");
  }

  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  const code = Math.floor(Math.random() * (max - min + 1) + min);

  return code.toString().padStart(length, "0");
}

export default generateDigitCode;
