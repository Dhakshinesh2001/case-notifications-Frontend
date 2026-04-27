let currentOrgId: string | null = null;

export const setOrgId = (id: string) => {
  currentOrgId = id;
};

export const getOrgId = () => currentOrgId;