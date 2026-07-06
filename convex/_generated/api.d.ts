/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alerts from "../alerts.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as briefings from "../briefings.js";
import type * as emailClassifier from "../emailClassifier.js";
import type * as emailDrafts from "../emailDrafts.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as followups from "../followups.js";
import type * as notifications from "../notifications.js";
import type * as platforms from "../platforms.js";
import type * as priorityInbox from "../priorityInbox.js";
import type * as test from "../test.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  alerts: typeof alerts;
  analytics: typeof analytics;
  auth: typeof auth;
  briefings: typeof briefings;
  emailClassifier: typeof emailClassifier;
  emailDrafts: typeof emailDrafts;
  emailTemplates: typeof emailTemplates;
  followups: typeof followups;
  notifications: typeof notifications;
  platforms: typeof platforms;
  priorityInbox: typeof priorityInbox;
  test: typeof test;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
