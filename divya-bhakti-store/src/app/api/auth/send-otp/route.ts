import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendOTPEmail } from '@/lib/email';
import { generateOTP } from '@/lib/utils';
import { otpRequestSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = otpRequestSchema.parse(body);
    const email = validatedData.email.toLowerCase();

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old unused OTPs for this email
    await prisma.otpToken.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Create new OTP
    await prisma.otpToken.create({
      data: {
        email,
        otp,
        expiresAt,
        userId: existingUser?.id,
      },
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      // For development, log the OTP
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Always return OTP for testing purposes right now
      debugOtp: otp,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

