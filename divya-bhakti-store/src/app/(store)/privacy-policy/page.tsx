import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Divya Bhakti Store - Learn how we collect, use, and protect your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm border prose prose-gray max-w-none">
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes:</p>
          <ul>
            <li>Name, email address, and phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely via Razorpay)</li>
            <li>Order history and preferences</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Provide customer support</li>
            <li>Improve our products and services</li>
            <li>Send promotional communications (with your consent)</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We do not sell your personal information. We share your information only with:</p>
          <ul>
            <li>Payment processors (Razorpay) to process transactions</li>
            <li>Shipping partners (Shiprocket) to deliver your orders</li>
            <li>Service providers who assist in our operations</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. Payment data is processed through secure, PCI-compliant payment gateways and is never stored on our servers.</p>

          <h2>5. Cookies</h2>
          <p>We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site traffic.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2>7. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:support@divyabhaktistore.com" className="text-saffron-600">support@divyabhaktistore.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
