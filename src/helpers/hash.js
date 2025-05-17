import bcrypt from "bcryptjs";

const bcryptSalt = Number(process.env.BCRYPT_SALT || 10);
export default async function hash(value) {
  const hashedValue = await bcrypt.hash(value, bcryptSalt);
  return hashedValue;
}
