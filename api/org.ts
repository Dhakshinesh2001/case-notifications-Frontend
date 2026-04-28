let currentOrgId: string | null = null;

let listeners: ((id: string | null) => void)[] = [];

export const setOrgId = (id: string) => {
  currentOrgId = id;

  console.log("ORG SET:", id);

  listeners.forEach((l) => l(id));
};

export const getOrgId = () => currentOrgId;

export const subscribeOrg = (cb: (id: string | null) => void) => {
  listeners.push(cb);

  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
};