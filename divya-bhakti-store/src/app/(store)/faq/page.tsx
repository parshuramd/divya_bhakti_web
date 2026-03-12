import { Metadata } from 'next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to common questions about orders, shipping, payments, returns, and more at Divya Bhakti Store.',
};

const faqs = [
  {
    category: 'Orders & Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major payment methods including UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD). Online payments are processed securely through Razorpay.',
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order is shipped, you will receive a tracking link via email. You can also track your order from the "My Orders" section in your account or visit our Track Order page.',
      },
      {
        q: 'Can I cancel my order?',
        a: 'You can cancel your order before it is shipped. Once shipped, cancellation is not possible, but you can initiate a return after delivery. Contact our support team for assistance.',
      },
      {
        q: 'Is Cash on Delivery (COD) available?',
        a: 'Yes, COD is available across most serviceable pin codes in India. COD charges may apply on certain orders.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Standard delivery takes 5-7 business days. Metro cities may receive orders in 3-5 business days. Delivery times may vary based on your location and product availability.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free shipping on all orders above ₹499. Orders below ₹499 have a flat shipping charge of ₹49.',
      },
      {
        q: 'Do you deliver to my area?',
        a: 'We deliver across India through our trusted shipping partners. Enter your PIN code at checkout to verify if delivery is available in your area.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We offer a 7-day return window from the date of delivery for most products. Items must be unused, in original packaging, and in the same condition as received.',
      },
      {
        q: 'How do I initiate a return?',
        a: 'To initiate a return, contact our support team via email or WhatsApp with your order number and reason for return. We will arrange a pickup from your address.',
      },
      {
        q: 'When will I receive my refund?',
        a: 'Refunds are processed within 5-7 business days after we receive the returned item. The amount will be credited to your original payment method.',
      },
      {
        q: 'Are there any non-returnable items?',
        a: 'Certain items like incense, opened products, customized items, and perishable goods are non-returnable. Please check the product page for specific return eligibility.',
      },
    ],
  },
  {
    category: 'Products & Quality',
    items: [
      {
        q: 'Are your products authentic?',
        a: 'Yes, we guarantee 100% authenticity on all our products. We source directly from trusted artisans and manufacturers across India.',
      },
      {
        q: 'How do I care for brass/copper idols?',
        a: 'Clean with a soft dry cloth regularly. For deeper cleaning, use a mixture of lemon juice and salt, then rinse with water and dry immediately. Avoid harsh chemicals.',
      },
      {
        q: 'Can I request a custom product?',
        a: 'We offer customization on select products. Please contact our support team with your requirements and we will do our best to assist you.',
      },
    ],
  },
  {
    category: 'Account & Privacy',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click on the "Login" button and enter your email address. We use a passwordless OTP-based login system for your convenience and security.',
      },
      {
        q: 'Is my personal information secure?',
        a: 'Absolutely. We use industry-standard encryption and never share your personal information with third parties. Read our Privacy Policy for details.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about shopping at Divya Bhakti Store. 
            Can&apos;t find what you&apos;re looking for? Contact our support team.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pl-1">
                {section.category}
              </h2>
              <div className="bg-white rounded-xl border shadow-sm">
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((faq, i) => (
                    <AccordionItem key={i} value={`${section.category}-${i}`} className="px-6">
                      <AccordionTrigger className="text-left font-medium text-gray-800 hover:text-saffron-600">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-white rounded-xl border p-8">
          <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@divyabhaktistore.com'}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-saffron-600 text-white rounded-lg hover:bg-saffron-700 transition-colors font-medium"
            >
              Email Support
            </a>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
