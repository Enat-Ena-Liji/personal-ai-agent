// convex/auth.config.ts
export default {
  providers: [
    {
      // For OIDC providers, use this format
      domain: "https://amusing-moray-1.clerk.accounts.dev",
      applicationID: "clerk",
      // NO issuer field for OIDC
    },
  ],
};