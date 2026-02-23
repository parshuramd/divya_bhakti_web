import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Refund and Return Policy for Divya Bhakti Store.',
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Refund & Return Policy</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm border prose prose-gray max-w-none">
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <h2>1. Return Window</h2>
          <p>We offer a 7-day return policy from the date of delivery. Items must be unused, in original packaging, and in the same condition as received.</p>

          <h2>2. Eligible Items</h2>
          <p>The following items are eligible for returns:</p>
          <ul>
            <li>Damaged or defective products</li>
            <li>Wrong items received</li>
            <li>Items not matching the description</li>
          </ul>

          <h2>3. Non-Returnable Items</h2>
          <ul>
            <li>Incense sticks and dhoop (hygiene reasons)</li>
            <li>Customized or personalized items</li>
            <li>Items damaged due to misuse</li>
            <li>Items without original packaging</li>
          </ul>

          <h2>4. Return Process</h2>
          <ol>
            <li>Contact our support team within 7 days of delivery</li>
            <li>Provide your order number and reason for return</li>
            <li>Our team will arrange a pickup or provide return instructions</li>
            <li>Once received and inspected, we will process your refund</li>
          </ol>

          <h2>5. Refund Timeline</h2>
          <ul>
            <li>Refunds are processed within 5-7 business days after receiving the returned item</li>
            <li>Online payments will be refunded to the original payment method</li>
            <li>COD orders will be refunded via bank transfer</li>
          </ul>

          <h2>6. Exchanges</h2>
          <p>We offer free exchanges for damaged or defective items. Contact our support team to initiate an exchange.</p>

          <h2>7. Contact</h2>
          <p>For return or refund queries, contact us at{' '}
            <a href="mailto:support@divyabhaktistore.com" className="text-saffron-600">support@divyabhaktistore.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
