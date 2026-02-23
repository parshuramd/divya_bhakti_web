import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@divyabhaktistore.com' },
    update: {},
    create: {
      email: 'admin@divyabhaktistore.com',
      name: 'Admin',
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'idols' },
      update: {},
      create: {
        name: 'Idols & Murtis',
        nameMarathi: 'मूर्ती',
        slug: 'idols',
        description: 'Beautiful handcrafted divine idols for your home temple',
        image: 'https://images.unsplash.com/photo-1567591370504-c8c0e270b00d?w=400',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'mala' },
      update: {},
      create: {
        name: 'Mala & Beads',
        nameMarathi: 'माळा आणि मणी',
        slug: 'mala',
        description: 'Sacred prayer beads and malas for meditation',
        image: 'https://images.unsplash.com/photo-1583948738292-2baf89fd40a1?w=400',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'incense' },
      update: {},
      create: {
        name: 'Incense & Dhoop',
        nameMarathi: 'धूप आणि अगरबत्ती',
        slug: 'incense',
        description: 'Premium incense sticks and dhoop for spiritual ambiance',
        image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'photos' },
      update: {},
      create: {
        name: 'Photos & Frames',
        nameMarathi: 'फोटो आणि फ्रेम्स',
        slug: 'photos',
        description: 'Divine deity photos and decorative frames',
        image: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'puja' },
      update: {},
      create: {
        name: 'Puja Items',
        nameMarathi: 'पूजा साहित्य',
        slug: 'puja',
        description: 'Essential items for your daily puja rituals',
        image: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=400',
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'books' },
      update: {},
      create: {
        name: 'Books & Scriptures',
        nameMarathi: 'पुस्तके आणि ग्रंथ',
        slug: 'books',
        description: 'Sacred texts and spiritual literature',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        sortOrder: 6,
      },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create Products
  const products = [
    // Idols
    {
      name: 'Lord Ganesha Brass Idol - 8 inch',
      nameMarathi: 'श्री गणेश पितळ मूर्ती - ८ इंच',
      slug: 'lord-ganesha-brass-idol-8-inch',
      description: 'Beautifully handcrafted brass idol of Lord Ganesha. This exquisite piece is perfect for your home temple or as a thoughtful gift. The intricate detailing captures the divine essence of the remover of obstacles.',
      descriptionMarathi: 'सुंदर हस्तनिर्मित श्री गणेशाची पितळ मूर्ती. ही अप्रतिम कलाकृती तुमच्या घरच्या देवघरासाठी किंवा भेट म्हणून उत्तम आहे.',
      shortDescription: 'Premium brass Ganesha idol with intricate details',
      sku: 'IDL-GAN-001',
      price: 2499,
      compareAtPrice: 2999,
      stock: 50,
      categorySlug: 'idols',
      isFeatured: true,
      tags: ['ganesha', 'brass', 'handcrafted'],
      images: [
        { url: 'https://images.unsplash.com/photo-1567591370504-c8c0e270b00d?w=800', isPrimary: true },
      ],
    },
    {
      name: 'Marble Lakshmi Statue - 12 inch',
      nameMarathi: 'संगमरवरी लक्ष्मी मूर्ती - १२ इंच',
      slug: 'marble-lakshmi-statue-12-inch',
      description: 'Elegant marble statue of Goddess Lakshmi, the goddess of wealth and prosperity. Hand-carved by skilled artisans, this statue brings divine blessings to your home.',
      sku: 'IDL-LAK-002',
      price: 4999,
      compareAtPrice: 5999,
      stock: 25,
      categorySlug: 'idols',
      isFeatured: true,
      tags: ['lakshmi', 'marble', 'prosperity'],
      images: [
        { url: 'https://images.unsplash.com/photo-1582650625784-23d5ee37d16f?w=800', isPrimary: true },
      ],
    },
    {
      name: 'Krishna Playing Flute - Brass',
      nameMarathi: 'बासरी वाजवणारा कृष्ण - पितळ',
      slug: 'krishna-playing-flute-brass',
      description: 'Mesmerizing brass statue of Lord Krishna playing his divine flute. A symbol of love, peace, and divine music.',
      sku: 'IDL-KRS-003',
      price: 3499,
      stock: 35,
      categorySlug: 'idols',
      isFeatured: true,
      tags: ['krishna', 'brass', 'flute'],
      images: [
        { url: 'https://images.unsplash.com/photo-1609619385076-36a873425636?w=800', isPrimary: true },
      ],
    },
    // Mala
    {
      name: 'Rudraksha Mala - 108 Beads',
      nameMarathi: 'रुद्राक्ष माळा - १०८ मणी',
      slug: 'rudraksha-mala-108-beads',
      description: 'Authentic 5 Mukhi Rudraksha mala with 108 beads for meditation and japa. Sourced from Nepal, each bead is naturally formed and spiritually charged.',
      sku: 'MAL-RUD-001',
      price: 999,
      compareAtPrice: 1299,
      stock: 100,
      categorySlug: 'mala',
      isFeatured: true,
      tags: ['rudraksha', 'meditation', 'japa'],
      images: [
        { url: 'https://images.unsplash.com/photo-1583948738292-2baf89fd40a1?w=800', isPrimary: true },
      ],
    },
    {
      name: 'Tulsi Mala - Premium Quality',
      nameMarathi: 'तुळशी माळा - उत्कृष्ट दर्जा',
      slug: 'tulsi-mala-premium',
      description: 'Sacred Tulsi wood mala for daily worship and meditation. The holy basil beads are known for their spiritual significance and calming properties.',
      sku: 'MAL-TUL-002',
      price: 599,
      stock: 80,
      categorySlug: 'mala',
      tags: ['tulsi', 'basil', 'meditation'],
      images: [
        { url: 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=800', isPrimary: true },
      ],
    },
    {
      name: 'Sandalwood Prayer Beads',
      nameMarathi: 'चंदन माळा',
      slug: 'sandalwood-prayer-beads',
      description: 'Aromatic sandalwood mala with 108 beads. The natural fragrance enhances your meditation experience and brings peace of mind.',
      sku: 'MAL-SAN-003',
      price: 1499,
      stock: 45,
      categorySlug: 'mala',
      isFeatured: true,
      tags: ['sandalwood', 'fragrant', 'meditation'],
      images: [
        { url: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800', isPrimary: true },
      ],
    },
    // Incense
    {
      name: 'Premium Agarbatti Set - Mixed Fragrances',
      nameMarathi: 'प्रीमियम अगरबत्ती सेट - मिश्र सुगंध',
      slug: 'premium-agarbatti-set-mixed',
      description: 'A divine collection of 6 premium incense fragrances including sandalwood, rose, jasmine, mogra, champa, and kesar. Each pack contains 20 sticks.',
      sku: 'INC-SET-001',
      price: 399,
      compareAtPrice: 499,
      stock: 200,
      categorySlug: 'incense',
      isFeatured: true,
      tags: ['agarbatti', 'incense', 'fragrance'],
      images: [
        { url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800', isPrimary: true },
      ],
    },
    {
      name: 'Pure Cow Dung Dhoop - Natural',
      nameMarathi: 'शुद्ध गोमय धूप - नैसर्गिक',
      slug: 'pure-cow-dung-dhoop',
      description: 'Traditional dhoop made from pure cow dung with herbal ingredients. Burns cleanly and purifies the atmosphere naturally.',
      sku: 'INC-DHO-002',
      price: 199,
      stock: 150,
      categorySlug: 'incense',
      tags: ['dhoop', 'natural', 'cow dung'],
      images: [
        { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', isPrimary: true },
      ],
    },
    // Puja Items
    {
      name: 'Brass Puja Thali Set - 7 Pieces',
      nameMarathi: 'पितळ पूजा थाळी संच - ७ तुकडे',
      slug: 'brass-puja-thali-set',
      description: 'Complete puja thali set including thali, diya, bell, incense holder, kumkum box, small vessels, and aarti diya. Perfect for daily worship.',
      sku: 'PUJ-SET-001',
      price: 1899,
      compareAtPrice: 2299,
      stock: 40,
      categorySlug: 'puja',
      isFeatured: true,
      tags: ['puja', 'thali', 'brass'],
      images: [
        { url: 'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=800', isPrimary: true },
      ],
    },
    {
      name: 'Copper Kalash with Coconut',
      nameMarathi: 'तांब्याचा कलश नारळासह',
      slug: 'copper-kalash-coconut',
      description: 'Sacred copper kalash with decorative coconut top. Essential for griha pravesh and auspicious ceremonies.',
      sku: 'PUJ-KAL-002',
      price: 799,
      stock: 60,
      categorySlug: 'puja',
      tags: ['kalash', 'copper', 'ceremony'],
      images: [
        { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', isPrimary: true },
      ],
    },
    // Photos
    {
      name: 'Lord Ganesha Photo Frame - Gold',
      nameMarathi: 'श्री गणेश फोटो फ्रेम - सोनेरी',
      slug: 'ganesha-photo-frame-gold',
      description: 'Elegant gold-finished photo frame with beautiful image of Lord Ganesha. Perfect for home temple or office.',
      sku: 'PHO-GAN-001',
      price: 599,
      stock: 75,
      categorySlug: 'photos',
      tags: ['ganesha', 'frame', 'gold'],
      images: [
        { url: 'https://images.unsplash.com/photo-1567591370504-c8c0e270b00d?w=800', isPrimary: true },
      ],
    },
    {
      name: 'Tirupati Balaji Photo - Large',
      nameMarathi: 'तिरुपती बालाजी फोटो - मोठा',
      slug: 'tirupati-balaji-photo-large',
      description: 'High-quality print of Lord Tirupati Balaji in ornate wooden frame. Size: 16x20 inches.',
      sku: 'PHO-TIR-002',
      price: 999,
      stock: 30,
      categorySlug: 'photos',
      isFeatured: true,
      tags: ['tirupati', 'balaji', 'venkateswara'],
      images: [
        { url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', isPrimary: true },
      ],
    },
    // Books
    {
      name: 'Bhagavad Gita - Hindi/English',
      nameMarathi: 'भगवद्गीता - हिंदी/इंग्रजी',
      slug: 'bhagavad-gita-hindi-english',
      description: 'Complete Bhagavad Gita with Hindi and English translations. Includes commentary and explanations for deeper understanding.',
      sku: 'BOK-GIT-001',
      price: 499,
      compareAtPrice: 599,
      stock: 100,
      categorySlug: 'books',
      isFeatured: true,
      tags: ['gita', 'scripture', 'philosophy'],
      images: [
        { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', isPrimary: true },
      ],
    },
    {
      name: 'Hanuman Chalisa - Illustrated',
      nameMarathi: 'हनुमान चालीसा - सचित्र',
      slug: 'hanuman-chalisa-illustrated',
      description: 'Beautifully illustrated Hanuman Chalisa with Hindi text and English transliteration. Perfect for daily recitation.',
      sku: 'BOK-HAN-002',
      price: 199,
      stock: 150,
      categorySlug: 'books',
      tags: ['hanuman', 'chalisa', 'prayer'],
      images: [
        { url: 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800', isPrimary: true },
      ],
    },
  ];

  // Create products with images
  for (const productData of products) {
    const category = categories.find((c) => c.slug === productData.categorySlug);
    if (!category) continue;

    const existingProduct = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (!existingProduct) {
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          nameMarathi: productData.nameMarathi,
          slug: productData.slug,
          description: productData.description,
          descriptionMarathi: productData.descriptionMarathi,
          shortDescription: productData.shortDescription,
          sku: productData.sku,
          price: productData.price,
          compareAtPrice: productData.compareAtPrice,
          stock: productData.stock,
          categoryId: category.id,
          isFeatured: productData.isFeatured || false,
          tags: productData.tags || [],
          isActive: true,
          images: {
            create: productData.images.map((img, index) => ({
              url: img.url,
              alt: productData.name,
              isPrimary: img.isPrimary || index === 0,
              sortOrder: index,
            })),
          },
        },
      });
      console.log('✅ Product created:', product.name);
    }
  }

  // Create sample banners
  const banners = [
    {
      title: 'Divine Collection for Your Home Temple',
      titleMarathi: 'तुमच्या घरच्या देवघरासाठी दिव्य संग्रह',
      subtitle: 'Explore our handpicked devotional products',
      subtitleMarathi: 'आमची निवडक भक्ती उत्पादने पहा',
      image: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=1600',
      link: '/products',
      linkText: 'Shop Now',
      position: 'HOME_HERO' as const,
      sortOrder: 1,
    },
    {
      title: 'Free Shipping on Orders Above ₹499',
      titleMarathi: '₹४९९ वरील ऑर्डरवर मोफत शिपिंग',
      subtitle: 'Across India',
      image: 'https://images.unsplash.com/photo-1618022325802-7e5e732d97a1?w=1600',
      link: '/products',
      position: 'HOME_SECONDARY' as const,
      sortOrder: 2,
    },
  ];

  for (const bannerData of banners) {
    await prisma.banner.upsert({
      where: { id: `banner-${bannerData.sortOrder}` },
      update: {},
      create: {
        ...bannerData,
        isActive: true,
      },
    });
  }
  console.log('✅ Banners created');

  // Create sample coupons
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Get 10% off on your first order',
      discountType: 'PERCENTAGE' as const,
      discountValue: 10,
      minOrderAmount: 499,
      maxDiscount: 200,
      isActive: true,
    },
    {
      code: 'DIVYA50',
      description: 'Flat ₹50 off on orders above ₹500',
      discountType: 'FIXED' as const,
      discountValue: 50,
      minOrderAmount: 500,
      isActive: true,
    },
    {
      code: 'FESTIVE20',
      description: '20% off on festive collection',
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      minOrderAmount: 1000,
      maxDiscount: 500,
      isActive: true,
    },
  ];

  for (const couponData of coupons) {
    await prisma.coupon.upsert({
      where: { code: couponData.code },
      update: {},
      create: couponData,
    });
  }
  console.log('✅ Coupons created');

  // Create legal pages
  const pages = [
    {
      title: 'About Us',
      titleMarathi: 'आमच्याबद्दल',
      slug: 'about',
      content: `
# About Divya Bhakti Store

Welcome to Divya Bhakti Store, your trusted destination for authentic devotional products in India.

## Our Story

Founded in 2020, we started with a simple mission: to bring genuine, high-quality devotional items to devotees across India. What began as a small family venture has grown into a trusted name in the devotional products industry.

## Our Values

- **Authenticity**: We source only genuine products from trusted artisans and suppliers
- **Quality**: Every product undergoes strict quality checks before reaching you
- **Trust**: Building long-term relationships with our customers through honest dealings
- **Service**: Dedicated customer support to assist you in your spiritual journey

## Why Choose Us?

1. **Genuine Products**: 100% authentic devotional items
2. **Pan-India Delivery**: We deliver across Maharashtra and all of India
3. **Secure Payments**: Multiple payment options including COD
4. **Easy Returns**: Hassle-free 7-day return policy

## Contact Us

Have questions? We're here to help!

- Email: support@divyabhaktistore.com
- Phone: +91 98765 43210
- Address: 123 Devotional Lane, Mumbai, Maharashtra 400001
      `,
      isPublished: true,
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `
# Privacy Policy

Last updated: January 2024

At Divya Bhakti Store, we take your privacy seriously. This policy outlines how we collect, use, and protect your information.

## Information We Collect

- Personal information (name, email, phone, address)
- Payment information (processed securely through Razorpay)
- Browsing data and cookies

## How We Use Your Information

- Process and deliver orders
- Send order updates and notifications
- Improve our services
- Send promotional offers (with your consent)

## Data Security

We implement industry-standard security measures to protect your data.

## Your Rights

You can request access, correction, or deletion of your personal data by contacting us.

## Contact

For privacy concerns: privacy@divyabhaktistore.com
      `,
      isPublished: true,
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms',
      content: `
# Terms & Conditions

By using Divya Bhakti Store, you agree to these terms.

## Orders

- All orders are subject to availability
- We reserve the right to cancel orders in case of pricing errors
- Delivery timelines are estimates and may vary

## Payments

- We accept UPI, Cards, Net Banking, and Cash on Delivery
- COD orders may have an additional handling fee
- All payments are processed securely

## Returns & Refunds

- 7-day return policy for undamaged products
- Refunds processed within 5-7 business days
- Original packaging required for returns

## Disclaimer

Product images are for illustration purposes. Actual products may slightly vary.
      `,
      isPublished: true,
    },
    {
      title: 'Refund & Cancellation Policy',
      slug: 'refund-policy',
      content: `
# Refund & Cancellation Policy

## Cancellation

- Orders can be cancelled before shipping
- Contact us within 24 hours of placing the order

## Returns

- Products can be returned within 7 days of delivery
- Items must be unused and in original packaging
- Custom/personalized items cannot be returned

## Refund Process

- Refunds initiated within 48 hours of return approval
- Amount credited to original payment method
- Bank processing may take 5-7 business days

## Non-Returnable Items

- Incense and dhoop (hygiene products)
- Personalized/custom items
- Items on clearance sale
      `,
      isPublished: true,
    },
  ];

  for (const pageData of pages) {
    await prisma.page.upsert({
      where: { slug: pageData.slug },
      update: {},
      create: pageData,
    });
  }
  console.log('✅ Legal pages created');

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📝 Admin Credentials:');
  console.log('   Email: admin@divyabhaktistore.com');
  console.log('   Password: Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

