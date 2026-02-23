import type { Metadata } from 'next';
import { Heart, Shield, Truck, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Divya Bhakti Store - your trusted destination for authentic devotional products.',
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">About Divya Bhakti Store</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your trusted destination for authentic devotional products, bringing divine blessings to homes across India.
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <div className="bg-white rounded-xl p-8 shadow-sm border mb-8">
            <h2 className="text-2xl font-display font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Founded with a deep reverence for Indian spiritual traditions, Divya Bhakti Store was born
              from the desire to make authentic devotional products accessible to every household. We believe
              that quality spiritual items should be available to everyone, regardless of where they live.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From handcrafted brass idols sourced from Moradabad to premium rudraksha malas from Nepal,
              every product in our collection is carefully curated to ensure authenticity and quality.
              We work directly with artisans and trusted suppliers to bring you the finest devotional products.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-display font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To preserve and promote India&apos;s rich spiritual heritage by providing authentic,
                high-quality devotional products that enhance the worship experience for devotees across the country.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-display font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become India&apos;s most trusted online destination for devotional products, known for
                authenticity, quality, and exceptional customer service.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Heart, title: 'Authentic Products', desc: '100% genuine items sourced from trusted artisans' },
              { icon: Shield, title: 'Secure Payments', desc: 'Safe and encrypted payment processing' },
              { icon: Truck, title: 'Pan-India Delivery', desc: 'Fast shipping to every corner of India' },
              { icon: Star, title: '5000+ Happy Customers', desc: 'Trusted by devotees across India' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border text-center">
                <div className="h-10 w-10 rounded-full bg-saffron-50 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-5 w-5 text-saffron-600" />
                </div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
