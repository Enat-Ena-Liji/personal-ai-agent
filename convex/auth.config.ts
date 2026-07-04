// convex/auth.config.ts
export default {
  providers: [
    {
      // This must match your Clerk Frontend API URL exactly
      domain: "https://amusing-moray-1.clerk.accounts.dev",
      // This is the application ID from Clerk
      applicationID: "https://amusing-moray-1.clerk.accounts.dev",
      // This tells Convex to use Clerk's JWKS endpoint
      jwksUri: "https://amusing-moray-1.clerk.accounts.dev/.well-known/jwks.json",
    },
  ],
};