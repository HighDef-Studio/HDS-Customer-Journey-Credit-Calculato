import { useState } from 'react';
import { Calculator as CalculatorIcon, Download, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfigurationPanel } from '@/components/calculator/configuration-panel';
import { JourneyStageSelector } from '@/components/calculator/journey-stage-selector';
import { MessageTypeConfigurator } from '@/components/calculator/message-type-configurator';
import { BreakdownModal } from '@/components/calculator/breakdown-modal';
import { type CreditRates, type JourneyStage, type MessageType } from '@shared/schema';
import { journeyStageData } from '@/lib/journey-data';

export default function Calculator() {
  const [creditRates, setCreditRates] = useState<CreditRates>({
    sms: 1.00,
    email: 0.10,
    push: 0.05
  });

  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>(
    journeyStageData.map(stage => ({
      id: stage.id,
      name: stage.name,
      selected: false
    }))
  );

  const [messageTypes, setMessageTypes] = useState<MessageType[]>([]);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  const calculateCredits = (messageType: MessageType): MessageType['credits'] => {
    const frequencyMultiplier = {
      'one-time': 1,
      'daily': 365,
      'weekly': 52,
      'monthly': 12
    }[messageType.frequency];

    return {
      sms: messageType.channels.sms.enabled ? messageType.channels.sms.audienceSize * creditRates.sms * frequencyMultiplier : 0,
      email: messageType.channels.email.enabled ? messageType.channels.email.audienceSize * creditRates.email * frequencyMultiplier : 0,
      push: messageType.channels.push.enabled ? messageType.channels.push.audienceSize * creditRates.push * frequencyMultiplier : 0,
    };
  };

  const getTotalCredits = () => {
    const totals = messageTypes.reduce(
      (acc, messageType) => {
        const credits = calculateCredits(messageType);
        return {
          sms: acc.sms + credits.sms,
          email: acc.email + credits.email,
          push: acc.push + credits.push,
        };
      },
      { sms: 0, email: 0, push: 0 }
    );

    return {
      ...totals,
      grand: totals.sms + totals.email + totals.push
    };
  };

  const handleStageToggle = (stageId: string) => {
    setJourneyStages(prev => 
      prev.map(stage => 
        stage.id === stageId 
          ? { ...stage, selected: !stage.selected }
          : stage
      )
    );
  };

  const handleAddMessageType = (stageId: string) => {
    const stage = journeyStageData.find(s => s.id === stageId);
    if (!stage) return;

    const newMessageType: MessageType = {
      id: `${stageId}-${Date.now()}`,
      journeyStageId: stageId,
      type: stage.messageTypes[0],
      frequency: 'one-time',
      channels: { 
        sms: { enabled: false, audienceSize: 0 },
        email: { enabled: false, audienceSize: 0 },
        push: { enabled: false, audienceSize: 0 }
      },
      credits: { sms: 0, email: 0, push: 0 }
    };

    setMessageTypes(prev => [...prev, newMessageType]);
  };

  const handleUpdateMessageType = (id: string, updates: Partial<MessageType>) => {
    setMessageTypes(prev => 
      prev.map(mt => 
        mt.id === id 
          ? { ...mt, ...updates, credits: calculateCredits({ ...mt, ...updates }) }
          : mt
      )
    );
  };

  const handleRemoveMessageType = (id: string) => {
    setMessageTypes(prev => prev.filter(mt => mt.id !== id));
  };

  const handleExport = () => {
    const data = {
      creditRates,
      journeyStages,
      messageTypes,
      totals: getTotalCredits(),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-calculation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCreditRates({ sms: 1.00, email: 0.10, push: 0.05 });
    setJourneyStages(prev => prev.map(stage => ({ ...stage, selected: false })));
    setMessageTypes([]);
  };

  const totals = getTotalCredits();

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CalculatorIcon className="text-primary-500 h-8 w-8 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Credit Calculator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button onClick={handleExport} className="bg-primary-500 hover:bg-primary-600">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <ConfigurationPanel
              creditRates={creditRates}
              onCreditRatesChange={setCreditRates}
              totals={totals}
            />
          </div>

          {/* Main Calculator */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Journey Stage Selection */}
              <JourneyStageSelector
                journeyStages={journeyStages}
                messageTypes={messageTypes}
                onStageToggle={handleStageToggle}
              />

              {/* Message Type Configuration */}
              <MessageTypeConfigurator
                journeyStages={journeyStages}
                messageTypes={messageTypes}
                onAddMessageType={handleAddMessageType}
                onUpdateMessageType={handleUpdateMessageType}
                onRemoveMessageType={handleRemoveMessageType}
                calculateCredits={calculateCredits}
              />

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                    <Button variant="outline">
                      Save Template
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="text-primary-600 bg-primary-50 border-primary-200 hover:bg-primary-100"
                      onClick={() => setIsBreakdownModalOpen(true)}
                    >
                      Preview Breakdown
                    </Button>
                    <Button className="bg-primary-500 hover:bg-primary-600">
                      Generate Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Breakdown Modal */}
      <BreakdownModal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        journeyStages={journeyStages}
        messageTypes={messageTypes}
        calculateCredits={calculateCredits}
        totals={totals}
      />
    </div>
  );
}
