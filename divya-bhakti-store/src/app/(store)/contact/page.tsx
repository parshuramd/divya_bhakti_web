import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Divya Bhakti Store. We are here to help with your orders and queries.',
};

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            We&apos;d love to hear from you. Reach out to us for any queries or feedback.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-saffron-600" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@divyabhaktistore.com'}`}
                  className="text-saffron-600 hover:underline"
                >
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@divyabhaktistore.com'}
                </a>
                <p className="text-sm text-muted-foreground mt-1">We reply within 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-saffron-600" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`tel:${process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+919876543210'}`}
                  className="text-saffron-600 hover:underline"
                >
                  {process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+91 98765 43210'}
                </a>
                <p className="text-sm text-muted-foreground mt-1">Mon-Sat, 10 AM - 7 PM IST</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-saffron-600" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {process.env.NEXT_PUBLIC_STORE_ADDRESS || '123 Devotional Lane, Mumbai, Maharashtra 400001, India'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-saffron-600" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Monday - Saturday: 10:00 AM - 7:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
