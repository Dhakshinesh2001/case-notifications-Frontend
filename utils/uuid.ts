// import * as Crypto from 'expo-crypto';

// export const generateId = async () => {
//   return Crypto.randomUUID();
// };


import uuid from 'react-native-uuid';

export const generateId = () => {
  return uuid.v4() as string;
};