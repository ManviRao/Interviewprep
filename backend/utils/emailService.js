const nodemailer = require('nodemailer');

const createTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Gmail production configuration
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Additional Gmail optimizations
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5
    });
  } else {
    // Development - Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal Email for testing:');
    console.log('Email:', testAccount.user);
    console.log('Password:', testAccount.pass);
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
};

const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    const transporter = await createTransporter();
    
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Interview Prep" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address - Interview Prep',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #667eea; margin: 0;">Interview Prep</h1>
          </div>
          
          <h2 style="color: #333; text-align: center;">Welcome to Interview Prep Platform!</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 28px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              Verify Email Address
            </a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #667eea;">
            <code style="word-break: break-all; color: #667eea;">${verificationUrl}</code>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            <strong>⚠️ Important:</strong> This link will expire in 24 hours.
          </p>
          
          <p style="color: #888; font-size: 14px;">
            If you didn't create an account with Interview Prep, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <div style="text-align: center; color: #999; font-size: 12px;">
            <p>Interview Prep Platform<br>
            Master your interview skills with AI-powered practice</p>
            <p>Need help? Contact us at <a href="mailto:support@yourdomain.com" style="color: #667eea;">support@yourdomain.com</a></p>
          </div>
        </div>
      `,
      // Gmail-specific headers for better deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'List-Unsubscribe': `<mailto:unsubscribe@yourdomain.com?subject=Unsubscribe>`
      }
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Development Email Preview:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('✅ Production Email Sent to:', email, 'Message ID:', info.messageId);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    // Handle common Gmail errors
    if (error.code === 'EAUTH') {
      console.error('Gmail Authentication Failed. Check your app password.');
    } else if (error.code === 'EMESSAGE') {
      console.error('Gmail Message Rejected. Check email content.');
    }
    
    return { success: false, error: error.message };
  }
};

module.exports = { sendVerificationEmail };