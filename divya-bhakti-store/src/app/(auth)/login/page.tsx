'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2, ArrowLeft, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { otpRequestSchema, otpVerifySchema, type OtpRequestInput, type OtpVerifyInput } from '@/lib/validations';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<OtpRequestInput>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OtpVerifyInput>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { email: '', otp: '' },
  });

  const handleSendOtp = async (data: OtpRequestInput) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      setEmail(data.email);
      otpForm.setValue('email', data.email);
      setStep('otp');
      toast({
        title: t('auth.otpSent'),
        description: `OTP sent to ${data.email}`,
      });

      // Show OTP in toast for development
      if (result.debugOtp) {
        console.log('DEBUG OTP:', result.debugOtp);
        toast({
          title: "Dev Mode: OTP",
          description: `Your OTP is: ${result.debugOtp}`,
          duration: 10000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpVerifyInput) => {
    setIsLoading(true);
    try {
      const result = await signIn('otp', {
        email: data.email,
        otp: data.otp,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Success',
        description: 'You have been logged in successfully',
        variant: 'success',
      });

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast({
        title: t('auth.invalidOtp'),
        description: 'Please check your OTP and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-devotional flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-saffron-500 to-saffron-600 text-white text-2xl">
              🙏
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-saffron-600">
            {t('common.siteName')}
          </h1>
          <p className="text-sm text-muted-foreground font-marathi">
            दिव्य भक्ती स्टोअर
          </p>
        </div>

        <Card className="shadow-xl border-saffron-100">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">
              {step === 'email' ? t('auth.loginTitle') : t('auth.verifyOtp')}
            </CardTitle>
            <CardDescription>
              {step === 'email'
                ? t('auth.loginSubtitle')
                : `Enter the OTP sent to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      {...emailForm.register('email')}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="saffron"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      {t('auth.sendOtp')}
                      <Mail className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">{t('auth.enterOtp')}</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="pl-10 text-center text-xl tracking-widest"
                      maxLength={6}
                      {...otpForm.register('otp')}
                    />
                  </div>
                  {otpForm.formState.errors.otp && (
                    <p className="text-sm text-destructive">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="saffron"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    t('auth.verifyOtp')
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-saffron-600 flex items-center"
                    onClick={() => setStep('email')}
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Change email
                  </button>
                  <button
                    type="button"
                    className="text-saffron-600 hover:underline"
                    onClick={() => handleSendOtp({ email })}
                  >
                    {t('auth.resendOtp')}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-saffron-600 hover:underline">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-saffron-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-saffron-600">
            ← Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}

