import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Shipping Policy for Divya Bhakti Store - Delivery information and shipping rates.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Shipping Policy</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm border prose prose-gray max-w-none">
          <p className="text-muted-foreground">Last updated: February 2026</p>

          <h2>1. Shipping Rates</h2>
          <ul>
            <li><strong>Free Shipping:</strong> On all orders above ₹499</li>
            <li><strong>Standard Shipping:</strong> ₹49 for orders below ₹499</li>
          </ul>

          <h2>2. Delivery Time</h2>
          <ul>
            <li><strong>Metro Cities:</strong> 3-5 business days</li>
            <li><strong>Other Cities:</strong> 5-7 business days</li>
            <li><strong>Remote Areas:</strong> 7-10 business days</li>
          </ul>

          <h2>3. Delivery Partners</h2>
          <p>We ship through trusted logistics partners including Shiprocket&apos;s network of courier services to ensure safe and timely delivery of your orders.</p>

          <h2>4. Order Tracking</h2>
          <p>Once your order is shipped, you will receive a tracking number via email. You can track your order status on our website or the courier partner&apos;s website.</p>

          <h2>5. Packaging</h2>
          <p>All items are carefully packed to ensure safe delivery. Fragile items like idols and murtis receive extra protection with bubble wrap and sturdy packaging.</p>

          <h2>6. Delivery Attempt</h2>
          <p>Our delivery partners will make up to 3 delivery attempts. If the package cannot be delivered after 3 attempts, it will be returned to our warehouse.</p>

          <h2>7. Delivery Areas</h2>
          <p>We currently deliver across India. For international shipping, please contact our support team.</p>

          <h2>8. Contact</h2>
          <p>For shipping queries, contact us at{' '}
            <a href="mailto:support@divyabhaktistore.com" className="text-saffron-600">support@divyabhaktistore.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
