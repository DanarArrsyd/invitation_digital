import * as Sentry from "@sentry/nextjs";
import { errorMonitoringOptions } from "./lib/monitoring/sentry-options";

Sentry.init(errorMonitoringOptions(process.env.NEXT_PUBLIC_SENTRY_DSN));

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
