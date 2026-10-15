import * as Sentry from "@sentry/nextjs";
import { errorMonitoringOptions } from "./src/lib/monitoring/sentry-options";

Sentry.init(errorMonitoringOptions(process.env.SENTRY_DSN));
