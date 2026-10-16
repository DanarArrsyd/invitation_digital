import assert from "node:assert/strict";
import test from "node:test";

import { redactErrorEvent } from "../src/lib/monitoring/sentry-options.ts";

test("Sentry event redaction removes private message, host, and absolute paths", () => {
  const event = {
    server_name: "owner-laptop.local",
    request: { url: "https://example.test/invite/private-guest?token=secret" },
    user: { email: "guest@example.test" },
    message: "guest@example.test",
    exception: {
      values: [{
        type: "TypeError",
        value: "guest@example.test",
        stacktrace: { frames: [
          { filename: "/Users/owner/project/src/app/page.tsx?token=secret", abs_path: "/Users/owner/project/src/app/page.tsx" },
          { filename: "C:\\Users\\owner\\project\\.next\\server\\app.js#fragment" },
          { filename: "/private/owner/project/[eval1]" },
          { filename: "app:///_next/static/chunk.js?guest=secret" },
        ] },
      }],
    },
  };

  redactErrorEvent(event);

  assert.equal(event.message, "[redacted]");
  assert.equal(event.exception.values[0].value, "[redacted]");
  assert.deepEqual(event.exception.values[0].stacktrace.frames.map((frame) => frame.filename), [
    "src/app/page.tsx",
    ".next/server/app.js",
    "[eval1]",
    "app:///_next/static/chunk.js",
  ]);
  assert.equal(JSON.stringify(event).includes("owner"), false);
  assert.equal(JSON.stringify(event).includes("guest@example.test"), false);
  assert.equal(JSON.stringify(event).includes("token=secret"), false);
});
