'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { toast } from '@/components/ui/use-toast';
import type { Product } from '@/types';

interface AddToCartButtonProps {
  product: any; // Using any to avoid strict type checks on serialized data
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      addToCart({
        ...product,
        id: product.id,
      }, quantity);

      toast({
        title: 'Added to Cart',
        description: `${quantity} x ${product.name} added to your cart.`,
        variant: 'success',
      });
      setIsAdding(false);
    }, 500);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increment = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex items-center border border-gray-200 rounded-full w-fit">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-l-full hover:bg-gray-100 h-12 w-12"
          onClick={decrement}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-medium text-lg">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-r-full hover:bg-gray-100 h-12 w-12"
          onClick={increment}
          disabled={quantity >= product.stock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button
        size="lg"
        className="flex-1 h-12 rounded-full text-base font-bold bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 shadow-lg hover:shadow-saffron-200/50 transition-all"
        onClick={handleAddToCart}
        disabled={isAdding || product.stock === 0}
      >
        {isAdding ? (
          'Adding...'
        ) : product.stock === 0 ? (
          'Out of Stock'
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  );
}

