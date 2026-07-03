// convex/auth.config.ts
export default {
  providers: [
    {
      type: "clerk",
      // Hardcode your Clerk Frontend API URL (from your Clerk dashboard)
      issuer: "https://amusing-moray-1.clerk.accounts.dev",
      jwksUri: "https://amusing-moray-1.clerk.accounts.dev/.well-known/jwks.json",
      algorithms: ["RS256"],
    },
  ],
};