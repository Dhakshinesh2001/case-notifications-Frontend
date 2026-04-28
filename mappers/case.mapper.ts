export const CaseMapper = {
  // 🔄 Convert local DB model → API payload
  toApi: (c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    caseNumber: c.caseNumber,
    court: c.court,
    status: c.status,
  }),

  // 🔄 Convert API response → local DB model
  fromApi: (c: any) => ({
    ...c,
    syncStatus: 'SYNCED',
    isSynced: 1,
  }),
};