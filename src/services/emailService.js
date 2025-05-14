const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendVerificationEmail = async (user) => {
    try {
        // Create transporter with proper SSL/TLS configuration
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Don't fail on invalid certs
                ciphers: 'SSLv3'
            }
        });

        // Verify transporter configuration
        await transporter.verify();

        const mailOptions = {
            from: process.env.FROM || 'eMove App <noreply@yourapp.com>',
            to: user.email,
            subject: 'Your OTP Code',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Verification Code</h2>
                    <p>Your OTP code is:</p>
                    <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${user.otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error in sending email:', error);
        throw {
            status: 500,
            message: 'Failed to send verification email',
            error: error.message
        };
    }
};

exports.sendConfirmationEmail = async (user) => {
    try {
        // Create transporter with proper SSL/TLS configuration
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Don't fail on invalid certs
                ciphers: 'SSLv3'
            }
        });

        // Verify transporter configuration
        await transporter.verify();

        const mailOptions = {
            from: process.env.FROM || 'Your App <noreply@yourapp.com>',
            to: user.email,
            subject: 'Email Verification Successful',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Email Verified Successfully</h2>
                    <p>Your email has been successfully verified.</p>
                    <p>You can now proceed to use our services.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error in sending confirmation email:', error);
        throw {
            status: 500,
            message: 'Failed to send confirmation email',
            error: error.message
        };
    }
};
