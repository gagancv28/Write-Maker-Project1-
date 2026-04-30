import { Resend } from "resend";

// Use a placeholder so the constructor doesn't throw when key isn't set yet.
// All send() calls are already guarded by `if (process.env.RESEND_API_KEY)`.
export const resend = new Resend(process.env.RESEND_API_KEY ?? "not_configured");
