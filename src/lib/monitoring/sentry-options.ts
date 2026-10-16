import type { ErrorEvent } from "@sentry/nextjs";
import type * as Sentry from "@sentry/nextjs";

function safeStackFilename(filename: string): string {
  const path = filename.split(/[?#]/, 1)[0].replace(/\\/g, "/");
  const localPath = path.replace(/^file:\/\//, "");
  if (!/^(?:\/|[A-Za-z]:\/)/.test(localPath)) return path;

  const projectPath = localPath.match(/\/(src|\.next|node_modules)\/.+$/);
  return projectPath ? projectPath[0].slice(1) : localPath.slice(localPath.lastIndexOf("/") + 1);
}

/** Keep diagnostic stack frames while removing invitation and guest content. */
export function redactErrorEvent(event: ErrorEvent): ErrorEvent {
  delete event.request;
  delete event.user;
  delete event.breadcrumbs;
  delete event.extra;
  delete event.contexts;
  delete event.tags;
  delete event.transaction;
  delete event.fingerprint;
  delete event.logentry;
  delete event.modules;
  delete event.spans;
  delete event.measurements;
  delete event.sdkProcessingMetadata;
  delete event.threads;
  delete event.transaction_info;
  delete event.server_name;

  if (event.message) event.message = "[redacted]";
  for (const exception of event.exception?.values ?? []) {
    exception.value = "[redacted]";
    if (exception.mechanism) delete exception.mechanism.data;
    for (const frame of exception.stacktrace?.frames ?? []) {
      delete frame.vars;
      delete frame.pre_context;
      delete frame.context_line;
      delete frame.post_context;
      delete frame.abs_path;
      delete frame.module_metadata;
      if (frame.filename) frame.filename = safeStackFilename(frame.filename);
    }
  }

  return event;
}

export function errorMonitoringOptions(dsn: string | undefined): NonNullable<Parameters<typeof Sentry.init>[0]> {
  return {
    dsn,
    enabled: Boolean(dsn) && process.env.NODE_ENV === "production",
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      graphQL: { document: false, variables: false },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
      frameContextLines: 0,
    },
    tracesSampleRate: 0,
    beforeSend: redactErrorEvent,
  };
}
