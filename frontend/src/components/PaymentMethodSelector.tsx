import React from 'react';
import { PaymentMethod } from '../api/paymentApi';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  availableMethods: PaymentMethod[];
  currency: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  availableMethods,
  currency,
}) => {
  const getMethodInfo = (method: PaymentMethod) => {
    switch (method) {
      case 'mpesa':
        return {
          name: 'M-Pesa',
          icon: '📱',
          description: 'Mobile money payment',
          color: 'bg-green-500',
        };
      case 'card':
        return {
          name: 'Card',
          icon: '💳',
          description: 'Credit or debit card',
          color: 'bg-blue-500',
        };
      case 'stellar':
        return {
          name: 'Stellar',
          icon: '⭐',
          description: 'Fast & low-cost crypto',
          color: 'bg-purple-500',
        };
      case 'bitcoin':
        return {
          name: 'Bitcoin',
          icon: '₿',
          description: 'Bitcoin payment',
          color: 'bg-orange-500',
        };
      case 'ethereum':
        return {
          name: 'Ethereum',
          icon: 'Ξ',
          description: 'Ethereum payment',
          color: 'bg-gray-500',
        };
      default:
        return {
          name: method,
          icon: '💰',
          description: 'Payment method',
          color: 'bg-gray-500',
        };
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Payment Method
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {availableMethods.map((method) => {
          const info = getMethodInfo(method);
          const isSelected = selectedMethod === method;

          return (
            <button
              key={method}
              type="button"
              onClick={() => onSelectMethod(method)}
              className={`relative flex items-center p-4 border-2 rounded-lg transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${info.color} text-white text-2xl`}>
                {info.icon}
              </div>
              <div className="ml-4 text-left">
                <div className="font-medium text-gray-900">{info.name}</div>
                <div className="text-sm text-gray-500">{info.description}</div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {availableMethods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No payment methods available for {currency}
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
