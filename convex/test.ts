import { query } from "./_generated/server";

export const test = query({
  handler: async () => {
    return { message: "Working!" };
  },
});