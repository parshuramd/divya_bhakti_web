import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function checkEmailConfig() {
  console.log('Checking email configuration...');
  
  if (process.env.RESEND_API_KEY) {
    console.log('✅ RESEND_API_KEY is present');
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      // We won't actually send, just check if client initializes
      console.log('✅ Resend client initialized');
    } catch (e) {
      console.error('❌ Failed to initialize Resend client:', e);
    }
  } else {
    console.log('❌ RESEND_API_KEY is missing');
  }

  if (process.env.SMTP_HOST) {
    console.log('✅ SMTP_HOST is present');
    console.log(`SMTP Config: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`SMTP User: ${process.env.SMTP_USER ? 'Set' : 'Missing'}`);
  } else {
    console.log('❌ SMTP_HOST is missing');
  }
}

checkEmailConfig();

