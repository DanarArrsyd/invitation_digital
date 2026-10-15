import assert from "node:assert/strict";
import { test } from "node:test";

import { errorMonitoringOptions, redactErrorEvent } from "../src/lib/monitoring/sentry-options.ts";

test("monitoring stays off without a DSN and disables private data collection", () => {
  const options = errorMonitoringOptions(undefined);
  assert.equal(options.enabled, false);
  assert.equal(options.tracesSampleRate, 0);
  assert.equal(options.dataCollection.userInfo, false);
  assert.equal(options.dataCollection.cookies, false);
  assert.equal(options.dataCollection.urlQueryParams, false);
  assert.deepEqual(options.dataCollection.httpBodies, []);
  assert.equal(options.dataCollection.stackFrameVariables, false);
});

test("error monitoring removes invitation and guest data but keeps stack frames", () => {
  const event = {
    message: "Guest Ayu failed to open /invite?to=Ayu",
    request: { url: "https://example.com/invite?to=Ayu", data: "guest message" },
    user: { email: "ayu@example.com" },
    breadcrumbs: [{ message: "guest message" }],
    extra: { guestName: "Ayu" },
    contexts: { form: { guestName: "Ayu" } },
    tags: { invitationSlug: "ayu-and-budi" },
    transaction: "/ayu-and-budi",
    fingerprint: ["ayu-and-budi"],
    logentry: { message: "Ayu" },
    modules: { Ayu: "1" },
    spans: [{ description: "Ayu" }],
    measurements: { Ayu: { value: 1 } },
    sdkProcessingMetadata: { Ayu: "secret" },
    threads: { values: [] },
    transaction_info: { source: "custom" },
    exception: {
      values: [{ type: "TypeError", value: "Ayu is undefined", mechanism: { type: "onerror", data: { target: "Ayu" } }, stacktrace: { frames: [{ filename: "page.tsx?to=Ayu", lineno: 21, abs_path: "https://example.com/?to=Ayu", module_metadata: { guest: "Ayu" }, vars: { guest: "Ayu" }, context_line: "Ayu", pre_context: ["Ayu"], post_context: ["Ayu"] }] } }],
    },
  };

  const result = redactErrorEvent(event);

  assert.equal(result.message, "[redacted]");
  assert.equal(result.exception.values[0].value, "[redacted]");
  assert.equal(result.exception.values[0].type, "TypeError");
  assert.equal(result.exception.values[0].stacktrace.frames[0].filename, "page.tsx");
  assert.equal(Object.hasOwn(result.exception.values[0].mechanism, "data"), false);
  for (const field of ["vars", "context_line", "pre_context", "post_context", "abs_path", "module_metadata"]) {
    assert.equal(Object.hasOwn(result.exception.values[0].stacktrace.frames[0], field), false, field);
  }
  for (const field of ["request", "user", "breadcrumbs", "extra", "contexts", "tags", "transaction", "fingerprint", "logentry", "modules", "spans", "measurements", "sdkProcessingMetadata", "threads", "transaction_info"]) {
    assert.equal(Object.hasOwn(result, field), false, field);
  }
});
