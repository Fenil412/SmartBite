import { Resend } from 'resend';

// Initialize Resend with API key from environment (with validation)
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY environment variable is not set');
    return null;
  }
  
  if (!apiKey.startsWith('re_')) {
    console.error('❌ Invalid RESEND_API_KEY format. It should start with "re_"');
    return null;
  }
  
  return new Resend(apiKey);
};

/**
 * Send an email using Resend API (non-blocking).
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.html] - HTML content
 * @returns {Promise<void>} - Resolves immediately, errors are logged
 */
export const sendMail = async ({ to, subject, text, html }) => {
  // Validate required parameters
  if (!to || !subject) {
    console.error('❌ Email Error: to and subject are required to send mail');
    return;
  }

  // Get Resend client
  const resend = getResendClient();
  if (!resend) {
    console.error('❌ Email Error: Resend client initialization failed');
    return;
  }

  // Handle domain verification restrictions
  const verifiedEmail = process.env.RESEND_VERIFIED_EMAIL || 'chodvadiyafenil@gmail.com';
  const hasVerifiedDomain = process.env.RESEND_VERIFIED_DOMAIN;
  
  // If no verified domain, only send to verified email for testing
  const finalTo = hasVerifiedDomain ? to : verifiedEmail;
  const fromAddress = hasVerifiedDomain 
    ? `SmartBite <no-reply@${process.env.RESEND_VERIFIED_DOMAIN}>`
    : 'SmartBite <onboarding@resend.dev>';

  // Log if email is being redirected due to domain restrictions
  if (!hasVerifiedDomain && to !== verifiedEmail) {
    console.log(`⚠️ Domain not verified: Redirecting email from ${to} to ${verifiedEmail}`);
    console.log(`💡 To send to all users, verify your domain at https://resend.com/domains`);
  }

  // Prepare email data
  const emailData = {
    from: fromAddress,
    to: Array.isArray(finalTo) ? finalTo : [finalTo],
    subject: hasVerifiedDomain ? subject : `[TEST] ${subject} (Original recipient: ${to})`,
    text: text || (html ? undefined : subject),
    html: html || text,
  };

  // Send email asynchronously (non-blocking)
  setImmediate(async () => {
    try {
      const { data, error } = await resend.emails.send(emailData);
      
      if (error) {
        console.error('❌ Resend API Error:', error);
        
        // Provide helpful error message for domain verification
        if (error.message?.includes('verify a domain')) {
          console.error('💡 Solution: Verify your domain at https://resend.com/domains');
          console.error('📖 See server/RESEND_DOMAIN_SETUP.md for detailed instructions');
        }
        return;
      }
      
      console.log('✅ Email sent successfully:', {
        id: data?.id,
        to: emailData.to,
        subject: emailData.subject,
        originalRecipient: to !== finalTo ? to : undefined
      });
      
    } catch (err) {
      console.error('❌ Email sending failed:', {
        error: err.message,
        to: emailData.to,
        subject: emailData.subject
      });
    }
  });

  // Return immediately (non-blocking)
  return;
};

/**
 * Send email synchronously (for testing or when you need to wait for result)
 * 
 * @param {Object} options - Same as sendMail
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const sendMailSync = async ({ to, subject, text, html }) => {
  // Validate required parameters
  if (!to || !subject) {
    return {
      success: false,
      error: 'to and subject are required to send mail'
    };
  }

  // Get Resend client
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false,
      error: 'Resend client initialization failed - check RESEND_API_KEY'
    };
  }

  // Handle domain verification restrictions
  const verifiedEmail = process.env.RESEND_VERIFIED_EMAIL || 'chodvadiyafenil@gmail.com';
  const hasVerifiedDomain = process.env.RESEND_VERIFIED_DOMAIN;
  
  // If no verified domain, only send to verified email for testing
  const finalTo = hasVerifiedDomain ? to : verifiedEmail;
  const fromAddress = hasVerifiedDomain 
    ? `SmartBite <no-reply@${process.env.RESEND_VERIFIED_DOMAIN}>`
    : 'SmartBite <onboarding@resend.dev>';

  // Log if email is being redirected due to domain restrictions
  if (!hasVerifiedDomain && to !== verifiedEmail) {
    console.log(`⚠️ Domain not verified: Redirecting email from ${to} to ${verifiedEmail}`);
  }

  // Prepare email data
  const emailData = {
    from: fromAddress,
    to: Array.isArray(finalTo) ? finalTo : [finalTo],
    subject: hasVerifiedDomain ? subject : `[TEST] ${subject} (Original recipient: ${to})`,
    text: text || (html ? undefined : subject),
    html: html || text,
  };

  try {
    const { data, error } = await resend.emails.send(emailData);
    
    if (error) {
      console.error('❌ Resend API Error:', error);
      
      // Provide helpful error message for domain verification
      if (error.message?.includes('verify a domain')) {
        console.error('💡 Solution: Verify your domain at https://resend.com/domains');
        console.error('📖 See server/RESEND_DOMAIN_SETUP.md for detailed instructions');
      }
      
      return {
        success: false,
        error: error.message || 'Resend API error'
      };
    }
    
    console.log('✅ Email sent successfully:', {
      id: data?.id,
      to: emailData.to,
      subject: emailData.subject,
      originalRecipient: to !== finalTo ? to : undefined
    });
    
    return {
      success: true,
      data: {
        id: data?.id,
        to: emailData.to,
        subject: emailData.subject,
        originalRecipient: to !== finalTo ? to : undefined
      }
    };
    
  } catch (err) {
    console.error('❌ Email sending failed:', {
      error: err.message,
      to: emailData.to,
      subject: emailData.subject
    });
    
    return {
      success: false,
      error: err.message
    };
  }
};
