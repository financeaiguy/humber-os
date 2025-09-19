/**
 * Browser-safe stub for R2 Storage Client
 * This is used in client-side code to prevent crypto import errors
 */

export const r2Client = {
  setTenant: () => {},
  uploadDocument: async () => ({ success: false, message: 'R2 storage not available in browser' }),
  getDocument: async () => null,
  deleteDocument: async () => ({ success: false }),
  listDocuments: async () => [],
}