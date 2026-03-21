const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export type EmailTemplateParams = {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend HTTP API.
 * This avoids needing to install the resend npm package just for simple dispatches.
 */
export async function sendEmail({ to, subject, html }: EmailTemplateParams) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Mocking email dispatch to:", to);
    console.log("Subject:", subject);
    console.log("Body:", html);
    return { success: true, mocked: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Monetra <notifications@monetra.in>', // Update this verified domain before production
        to,
        subject,
        html
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Resend API error:", errorData);
      return { success: false, error: errorData };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send email:", error.message);
    return { success: false, error: error.message };
  }
}

// Pre-defined template helpers
export const EmailTemplates = {
  WelcomeUser: (name: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #1a1a1a;">
      <h1 style="color: #bfa15f;">Welcome to Monetra! 🚀</h1>
      <p>Hi ${name || 'there'},</p>
      <p>We're thrilled to have you onboard. Monetra is ready to help you turn your lifestyle into a wealth strategy.</p>
      <p>Your AI-powered dashboard is live. You can start by checking your <strong>Investment Thesis</strong> or logging your first expense.</p>
      <a href="https://monetra.in/planner" style="display:inline-block; padding: 12px 24px; background-color: #bfa15f; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">View My AI Plan</a>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">Need help? Reply to this email and our support team will assist you.</p>
    </div>
  `,
  AlertNotification: (alertType: string, message: string) => `
    <div style="font-family: Arial, sans-serif; padding: 20px; border-left: 4px solid #bfa15f;">
      <h2>New Monetra Alert: ${alertType}</h2>
      <p>${message}</p>
      <a href="https://monetra.in/alerts" style="color: #4f46e5;">Review in Dashboard →</a>
    </div>
  `
};
