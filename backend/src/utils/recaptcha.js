const SITEVERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export async function verifyRecaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    return {
      ok: false,
      error: "CAPTCHA is not configured on the server",
    };
  }

  if (!token || !String(token).trim()) {
    return {
      ok: false,
      error: "Please complete the CAPTCHA",
    };
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: String(token).trim(),
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        ok: false,
        error: "CAPTCHA verification failed. Please try again.",
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error.message);
    return {
      ok: false,
      error: "CAPTCHA verification failed. Please try again.",
    };
  }
}
