export const supabase = {
  auth: {
    signOut: jest.fn().mockResolvedValue({}),
  },
};