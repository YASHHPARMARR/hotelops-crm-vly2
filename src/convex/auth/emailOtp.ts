import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  // Replace email send logic to prefer Resend if configured, else fallback
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const appName = process.env.VLY_APP_NAME || "Grand Horizon Hotels";
    const subject = `${appName} login code: ${token}`;
    const text = `Your ${appName} login code is ${token}. It expires in 15 minutes.`;
    const html = `<p>Your ${appName} login code is:</p><p style="font-size:22px"><strong>${token}</strong></p><p>This code expires in 15 minutes.</p>`;

    try {
      const resendKey =
        process.env.RESEND_API_KEY ||
        (process.env as any).VITE_RESEND_API_KEY ||
        (process.env as any).NEXT_PUBLIC_RESEND_API_KEY;

      let res: Response | null = null;

      if (resendKey) {
        res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: `${appName} <onboarding@resend.dev>`,
            to: [email],
            subject,
            html,
            text,
          }),
        });
      } else {
        // Fallback to vly email service
        res = await fetch("https://email.vly.ai/send_otp", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": "vlytothemoon2025",
          },
          body: JSON.stringify({
            to: email,
            otp: token,
            appName,
          }),
        });
      }

      if (!res || !res.ok) {
        const txt = res ? await res.text().catch(() => "") : "no response";
        console.warn(`[Auth] OTP email send failed (${res?.status ?? "no_status"}): ${txt}`);
        // Do NOT throw — allow auth flow to continue. Print OTP for demo/dev:
        console.log(`[Auth] OTP for ${email}: ${token}`);
        return;
      }

      // Success path — still print in logs to aid demo/dev
      console.log(`[Auth] OTP sent to ${email}. Debug code: ${token}`);
    } catch (error: any) {
      console.warn("[Auth] OTP send error (non-fatal):", error?.message || error);
      // Do not throw; continue and log the OTP
      console.log(`[Auth] OTP for ${email}: ${token}`);
    }
  },
});