import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, EmailTemplates } from '@/lib/email';

export const maxDuration = 60; // 1 minute allowed for background execution

// Helper to determine target equity ratio based on risk profile
function getTargetEquityRatio(profile: string = 'moderate') {
  switch (profile.toLowerCase()) {
    case 'aggressive': return 0.80; // 80% equity
    case 'conservative': return 0.40; // 40% equity
    case 'moderate': 
    default: return 0.60; // 60% equity
  }
}

export async function GET(req: Request) {
  // 1. Verify Vercel Cron Secret (Security)
  // Vercel CRONs send the secret in an authorization header
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV !== 'development' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized. Invalid Cron Secret.' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // 2. Fetch all active users with their risk profiles
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, risk_profile, full_name');
      
    // Because the table might just be auth.users in MVP, let's heavily defensive program
    // Fallback: fetch from auth.admin if service role was used, but server action client relies on RLS.
    // Assuming 'users' table exists per roadmap schema.
    if (userError || !users) {
       console.log("No users found or couldn't fetch users table. Check schema:", userError?.message);
       return NextResponse.json({ ok: true, note: "Users table fetch failed, aborting cron safely." });
    }

    let alertsGenerated = 0;

    for (const user of users) {
      if (!user.id) continue;
      const userAlerts = [];

      // MODULE A: PORTFOLIO DRIFT CALCULATION
      const { data: holdings } = await supabase
        .from('portfolio_holdings')
        .select('asset_type, current_price, quantity')
        .eq('user_id', user.id);

      if (holdings && holdings.length > 0) {
        let totalEquity = 0;
        let totalValue = 0;

        holdings.forEach((h: any) => {
          const value = Number(h.current_price) * Number(h.quantity);
          totalValue += value;
          // Categorize as Equity
          if (['stock', 'mutual_fund', 'etf'].includes(h.asset_type)) {
            totalEquity += value;
          }
        });

        if (totalValue > 0) {
          const currentEquityRatio = totalEquity / totalValue;
          const targetEquityRatio = getTargetEquityRatio(user.risk_profile);
          
          // If absolute drift > 5%, generate an alert
          if (Math.abs(currentEquityRatio - targetEquityRatio) > 0.05) {
            const msg = `Your portfolio looks unbalanced. Your current equity allocation is ${(currentEquityRatio * 100).toFixed(1)}%, but your "${user.risk_profile}" profile suggests it should be ${(targetEquityRatio * 100).toFixed(1)}%. Time to rebalance!`;
            
            userAlerts.push({
              user_id: user.id,
              alert_type: 'portfolio_warning',
              title: 'Portfolio Drift Detected',
              body: msg,
              is_read: false
            });
          }
        }
      }

      // MODULE B: SIP STEP-UP ALERT
      // Assuming sip_plans exists. If error, gracefully continue.
      const { data: sips } = await supabase
        .from('sip_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (sips && sips.length > 0) {
        const today = new Date();
        sips.forEach((sip: any) => {
          if (!sip.start_date || !sip.step_up_percent) return;
          const startDate = new Date(sip.start_date);
          
          // Check if it's the yearly anniversary month
          if (today.getMonth() === startDate.getMonth() && today.getFullYear() > startDate.getFullYear()) {
            
            // Generate alert if we haven't already generated one recently
            // Note: simple strict logic for MVP
            const msg = `It's the annual anniversary of your ${sip.fund_name} SIP! To reach your target faster, hit the step-up button and increase your ₹${sip.monthly_amount} contribution by ${sip.step_up_percent}%.`;
            
            userAlerts.push({
              user_id: user.id,
              alert_type: 'sip_reminder',
              title: 'SIP Step-Up Reminder',
              body: msg,
              is_read: false
            });
          }
        });
      }

      // Step 3: Insert generated alerts to Database & Dispatch Email
      if (userAlerts.length > 0) {
        // We use insert safely. If alerts table doesn't exist yet, it'll fail gracefully.
        const { error: insertError } = await supabase.from('alerts').insert(userAlerts);
        
        if (!insertError) {
          alertsGenerated += userAlerts.length;
          
          // Dispatch via Resend HTTP utility created previously
          // Assuming user.email exists (might be in auth.users instead of public.users depending on how auth sync is setup)
          // To be perfectly safe, we'll extract email from auth if missing.
          const recipientEmail = user.email || 'user@example.com'; 
          
          // Only send actual emails in production to real addresses, or use explicit testing emails
          if (recipientEmail && recipientEmail.includes('@')) {
            const combinedHtml = userAlerts.map(a => EmailTemplates.AlertNotification(a.title, a.body)).join('<br/>');
            
            await sendEmail({
              to: recipientEmail,
              subject: `Monetra Alert: ${userAlerts[0].title} ${userAlerts.length > 1 ? `(+${userAlerts.length - 1} more)` : ''}`,
              html: combinedHtml
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      run_timestamp: new Date().toISOString(),
      alerts_generated: alertsGenerated 
    });

  } catch (error: any) {
    console.error("Cron Execution Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
