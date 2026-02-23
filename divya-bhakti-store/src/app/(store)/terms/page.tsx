import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and Conditions for Divya Bhakti Store.',
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm border prose prose-gray max-w-none">
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <h2>1. General</h2>
          <p>By accessing and using Divya Bhakti Store, you agree to comply with these terms and conditions. Please read them carefully before making a purchase.</p>

          <h2>2. Products</h2>
          <p>We strive to display products accurately on our website. However, colors may vary slightly due to monitor settings. All products are subject to availability.</p>

          <h2>3. Pricing</h2>
          <p>All prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We reserve the right to change prices without prior notice.</p>

          <h2>4. Orders</h2>
          <p>An order is confirmed when you receive a confirmation email. We reserve the right to refuse or cancel orders at our discretion, including in cases of pricing errors or stock unavailability.</p>

          <h2>5. Payment</h2>
          <p>We accept payments via Razorpay (credit/debit cards, UPI, net banking) and Cash on Delivery (COD). All online payments are processed through secure, PCI-compliant gateways.</p>

          <h2>6. Shipping</h2>
          <ul>
            <li>Free shipping on orders above ₹499</li>
            <li>Standard shipping charge of ₹49 for orders below ₹499</li>
            <li>Delivery within 5-7 business days across India</li>
          </ul>

          <h2>7. Returns & Refunds</h2>
          <p>Please refer to our <a href="/refund-policy" className="text-saffron-600">Refund Policy</a> for detailed information about returns and refunds.</p>

          <h2>8. Intellectual Property</h2>
          <p>All content on this website, including text, images, logos, and designs, is the property of Divya Bhakti Store and is protected by copyright laws.</p>

          <h2>9. Limitation of Liability</h2>
          <p>Divya Bhakti Store shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>

          <h2>10. Contact</h2>
          <p>For any questions regarding these terms, please contact us at{' '}
            <a href="mailto:support@divyabhaktistore.com" className="text-saffron-600">support@divyabhaktistore.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
