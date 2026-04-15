import * as Crypto from 'expo-crypto';

export const generateId = async () => {
  return await Crypto.randomUUID();
};