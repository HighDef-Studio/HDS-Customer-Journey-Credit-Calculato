import { Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type CreditRates } from '@shared/schema';

interface ConfigurationPanelProps {
  creditRates: CreditRates;
  onCreditRatesChange: (rates: CreditRates) => void;
  totals: {
    sms: number;
    email: number;
    push: number;
    grand: number;
  };
}

export function ConfigurationPanel({ creditRates, onCreditRatesChange, totals }: ConfigurationPanelProps) {
  const handleRateChange = (channel: keyof CreditRates, value: string) => {
    const numValue = parseFloat(value) || 0;
    onCreditRatesChange({
      ...creditRates,
      [channel]: numValue
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Settings className="text-primary-500 h-5 w-5 mr-2" />
        Credit Configuration
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="sms-rate" className="block text-sm font-medium text-gray-700 mb-2">
            SMS Credits per Message
          </Label>
          <div className="relative">
            <Input
              id="sms-rate"
              type="number"
              step="0.01"
              min="0"
              value={creditRates.sms}
              onChange={(e) => handleRateChange('sms', e.target.value)}
              className="pr-16"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">credits</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="email-rate" className="block text-sm font-medium text-gray-700 mb-2">
            Email Credits per Message
          </Label>
          <div className="relative">
            <Input
              id="email-rate"
              type="number"
              step="0.01"
              min="0"
              value={creditRates.email}
              onChange={(e) => handleRateChange('email', e.target.value)}
              className="pr-16"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">credits</span>
          </div>
        </div>
        
        <div>
          <Label htmlFor="push-rate" className="block text-sm font-medium text-gray-700 mb-2">
            Push Credits per Message
          </Label>
          <div className="relative">
            <Input
              id="push-rate"
              type="number"
              step="0.01"
              min="0"
              value={creditRates.push}
              onChange={(e) => handleRateChange('push', e.target.value)}
              className="pr-16"
            />
            <span className="absolute right-3 top-2 text-gray-500 text-sm">credits</span>
          </div>
        </div>
      </div>

      {/* Total Summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Monthly Credits Required</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">SMS</span>
            <span className="font-semibold text-gray-900">{Math.round(totals.sms).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email</span>
            <span className="font-semibold text-gray-900">{Math.round(totals.email).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Push</span>
            <span className="font-semibold text-gray-900">{Math.round(totals.push).toLocaleString()}</span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Monthly</span>
              <span className="text-lg font-bold text-primary-600">{Math.round(totals.grand).toLocaleString()}</span>
            </div>
          </div>
          <div className="pt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Total Annual</span>
              <span className="text-lg font-bold text-green-600">{Math.round(totals.grand * 12).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            All calculations are shown as monthly totals for billing purposes
          </p>
        </div>
      </div>
    </div>
  );
}
