'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AnnouncementProps {
    announcement: {
        id: string;
        message: string;
        messageMarathi: string | null;
        link: string | null;
        bgColor: string;
        textColor: string;
    };
}

export function AnnouncementBar({ announcement }: AnnouncementProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Try to use translations, fallback safely
    let currentLocale = 'en';
    try {
        const t = useTranslations();
        // Getting locale is tricky without useLocale hook, but we can guess it via the DOM language if needed
        // The closest reliable way is just to render and let CSS/React handle it, but for text content:
        currentLocale = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
    } catch (e) {
        // Ignore error if useTranslations is used outside IntlProvider context
    }

    useEffect(() => {
        // Check if dismissed
        const dismissedId = localStorage.getItem('dismissedAnnouncement');
        if (dismissedId !== announcement.id) {
            setIsVisible(true);
        }
    }, [announcement.id]);

    if (!isVisible) return null;

    const handleDismiss = () => {
        localStorage.setItem('dismissedAnnouncement', announcement.id);
        setIsVisible(false);
    };

    const displayMessage = currentLocale === 'mr' && announcement.messageMarathi
        ? announcement.messageMarathi
        : announcement.message;

    const Content = () => (
        <div className="flex items-center justify-center text-center text-sm font-medium w-full px-8">
            <span>{displayMessage}</span>
        </div>
    );

    return (
        <div
            className="relative z-50 w-full py-2 px-4 shadow-sm"
            style={{ backgroundColor: announcement.bgColor, color: announcement.textColor }}
        >
            <div className="container mx-auto flex items-center justify-center relative min-h-[24px]">
                {announcement.link ? (
                    <Link href={announcement.link} className="hover:opacity-90 transition-opacity w-full">
                        <Content />
                    </Link>
                ) : (
                    <Content />
                )}

                <button
                    onClick={handleDismiss}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
                    aria-label="Dismiss announcement"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
