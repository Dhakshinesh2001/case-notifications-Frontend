// // api/org.ts
// let currentOrgId: string | null = null;
// let listeners: ((id: string | null) => void)[] = [];

// export const setOrgId = (id: string | null) => {
//   currentOrgId = id;
//   console.log("Global Org ID updated to:", id);
//   listeners.forEach((l) => l(id));
// };

// export const getOrgId = () => currentOrgId;

// export const subscribeOrg = (cb: (id: string | null) => void) => {
//   listeners.push(cb);
//   return () => {
//     listeners = listeners.filter((l) => l !== cb);
//   };
// };