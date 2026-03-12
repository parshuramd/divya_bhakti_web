import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { WhatsAppButton } from '@/components/common/whatsapp-button';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import prisma from '@/lib/prisma';

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeAnnouncement = await prisma.announcement.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex min-h-screen flex-col">
      {activeAnnouncement && (
        <AnnouncementBar announcement={activeAnnouncement} />
      )}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

