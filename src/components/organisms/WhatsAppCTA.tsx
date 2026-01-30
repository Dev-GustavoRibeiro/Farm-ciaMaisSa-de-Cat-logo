import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { links } from '@/config/links.config';

interface WhatsAppCTAProps {
  message?: string;
  productName?: string;
  variant?: 'floating' | 'block';
}

export const WhatsAppCTA: React.FC<WhatsAppCTAProps> = ({
  message,
  productName,
  variant = 'block',
}) => {
  const finalMessage = message || links.defaultMessage;
  const encodedMessage = encodeURIComponent(
    productName ? `${finalMessage} Produto: ${productName}` : finalMessage
  );
  const href = `https://wa.me/${links.whatsappNumber}?text=${encodedMessage}`;

  if (variant === 'floating') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="Contact via WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="h-14 w-full gap-2 border-green-600 text-green-700 hover:bg-green-50 text-lg font-bold sm:w-auto"
      onClick={() => window.open(href, '_blank')}
    >
      <MessageCircle size={24} />
      Pedir no WhatsApp
    </Button>
  );
};
