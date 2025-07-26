import { useState } from 'react';
import { Calculator as CalculatorIcon, Download, HelpCircle, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

  // Initialize all message types for all stages so dropdowns are populated
  const [messageTypes, setMessageTypes] = useState<MessageType[]>(() => {
    const allMessageTypes: MessageType[] = [];
    journeyStageData.forEach(stage => {
      const stageMessageTypes = stage.messageTypes.map(messageType => ({
        id: `${stage.id}-${messageType.replace(/[^a-zA-Z0-9]/g, '-')}`,
        journeyStageId: stage.id,
        type: messageType,
        frequency: 'monthly' as const,
        selected: false,
        channels: { 
          sms: { enabled: false, audienceSize: 0 },
          email: { enabled: false, audienceSize: 0 },
          push: { enabled: false, audienceSize: 0 }
        },
        credits: { sms: 0, email: 0, push: 0 }
      }));
      allMessageTypes.push(...stageMessageTypes);
    });
    return allMessageTypes;
  });
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const calculateCredits = (messageType: MessageType): MessageType['credits'] => {
    // Calculate monthly multipliers for billing
    const monthlyMultiplier = {
      'daily': 30.44, // Average days per month (365/12)
      'weekly': 4.33, // Average weeks per month (52/12)
      'monthly': 1,
      'quarterly': 1 / 3 // Quarterly divided over 3 months
    }[messageType.frequency];

    return {
      sms: messageType.channels.sms.audienceSize > 0 ? messageType.channels.sms.audienceSize * creditRates.sms * monthlyMultiplier : 0,
      email: messageType.channels.email.audienceSize > 0 ? messageType.channels.email.audienceSize * creditRates.email * monthlyMultiplier : 0,
      push: messageType.channels.push.audienceSize > 0 ? messageType.channels.push.audienceSize * creditRates.push * monthlyMultiplier : 0,
    };
  };

  const getTotalCredits = () => {
    const totals = messageTypes
      .filter(messageType => messageType.selected)
      .reduce(
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

  // Stages no longer need to be toggled - they just expand to show message types

  const handleMessageTypeToggle = (messageTypeId: string) => {
    setMessageTypes(prev => 
      prev.map(mt => 
        mt.id === messageTypeId 
          ? { ...mt, selected: !mt.selected }
          : mt
      )
    );
  };

  // No longer needed - message types are auto-generated from journey stages

  const handleUpdateMessageType = (id: string, updates: Partial<MessageType>) => {
    setMessageTypes(prev => 
      prev.map(mt => 
        mt.id === id 
          ? { ...mt, ...updates, credits: calculateCredits({ ...mt, ...updates }) }
          : mt
      )
    );
  };

  // Message types are now managed through journey stage selection

  const handleExport = () => {
    const totals = getTotalCredits();
    const selectedStages = journeyStages.filter(stage => stage.selected);
    
    // Create CSV content
    const csvRows = [];
    
    // Header information
    csvRows.push(['Credit Calculator Export']);
    csvRows.push(['Generated:', new Date().toLocaleString()]);
    csvRows.push(['']);
    
    // Credit rates
    csvRows.push(['Credit Rates']);
    csvRows.push(['Channel', 'Credits per Message']);
    csvRows.push(['SMS', creditRates.sms]);
    csvRows.push(['Email', creditRates.email]);
    csvRows.push(['Push', creditRates.push]);
    csvRows.push(['']);
    
    // Monthly totals summary
    csvRows.push(['Monthly Credit Totals Summary']);
    csvRows.push(['Channel', 'Monthly Credits']);
    csvRows.push(['SMS', Math.round(totals.sms)]);
    csvRows.push(['Email', Math.round(totals.email)]);
    csvRows.push(['Push', Math.round(totals.push)]);
    csvRows.push(['Total Monthly Credits', Math.round(totals.grand)]);
    csvRows.push(['']);
    
    // Detailed breakdown by stage
    csvRows.push(['Detailed Breakdown by Journey Stage']);
    csvRows.push(['']);
    
    selectedStages.forEach((stage) => {
      const stageMessageTypes = messageTypes.filter(mt => mt.journeyStageId === stage.id && mt.selected);
      
      if (stageMessageTypes.length > 0) {
        csvRows.push([stage.name]);
        csvRows.push(['Message Type', 'Frequency', 'SMS Audience', 'Email Audience', 'Push Audience', 
                     'SMS Credits/Month', 'Email Credits/Month', 'Push Credits/Month', 'Total Monthly Credits']);
        
        let stageTotal = 0;
        
        stageMessageTypes.forEach((messageType) => {
          const credits = calculateCredits(messageType);
          const messageTotal = credits.sms + credits.email + credits.push;
          stageTotal += messageTotal;
          
          csvRows.push([
            messageType.type,
            messageType.frequency,
            messageType.channels.sms.enabled ? messageType.channels.sms.audienceSize : 'N/A',
            messageType.channels.email.enabled ? messageType.channels.email.audienceSize : 'N/A',
            messageType.channels.push.enabled ? messageType.channels.push.audienceSize : 'N/A',
            Math.round(credits.sms),
            Math.round(credits.email),
            Math.round(credits.push),
            Math.round(messageTotal)
          ]);
        });
        
        csvRows.push(['', '', '', '', '', '', '', 'Stage Total:', Math.round(stageTotal)]);
        csvRows.push(['']);
      }
    });
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(',')
    ).join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-calculation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const totals = getTotalCredits();
    const selectedStages = journeyStages.filter(stage => stage.selected);
    
    // Create Excel-friendly CSV with better formatting
    const csvRows = [];
    
    // Main summary section
    csvRows.push(['MONTHLY CREDIT CALCULATION SUMMARY']);
    csvRows.push(['Generated', new Date().toLocaleString()]);
    csvRows.push(['']);
    
    // Executive summary table
    csvRows.push(['EXECUTIVE SUMMARY']);
    csvRows.push(['Total Monthly SMS Credits', Math.round(totals.sms)]);
    csvRows.push(['Total Monthly Email Credits', Math.round(totals.email)]);
    csvRows.push(['Total Monthly Push Credits', Math.round(totals.push)]);
    csvRows.push(['TOTAL MONTHLY CREDITS REQUIRED', Math.round(totals.grand)]);
    csvRows.push(['']);
    
    // Credit rates reference
    csvRows.push(['CREDIT RATES (per message)']);
    csvRows.push(['SMS Rate', creditRates.sms]);
    csvRows.push(['Email Rate', creditRates.email]);
    csvRows.push(['Push Rate', creditRates.push]);
    csvRows.push(['']);
    
    // Detailed breakdown table
    csvRows.push(['DETAILED BREAKDOWN BY JOURNEY STAGE AND MESSAGE TYPE']);
    csvRows.push(['Journey Stage', 'Message Type', 'Frequency', 'SMS Audience', 'Email Audience', 'Push Audience', 
                 'SMS Monthly Credits', 'Email Monthly Credits', 'Push Monthly Credits', 'Total Monthly Credits']);
    
    selectedStages.forEach((stage) => {
      const stageMessageTypes = messageTypes.filter(mt => mt.journeyStageId === stage.id && mt.selected);
      
      if (stageMessageTypes.length > 0) {
        let isFirstRow = true;
        let stageTotal = 0;
        
        stageMessageTypes.forEach((messageType) => {
          const credits = calculateCredits(messageType);
          const messageTotal = credits.sms + credits.email + credits.push;
          stageTotal += messageTotal;
          
          csvRows.push([
            isFirstRow ? stage.name : '',
            messageType.type,
            messageType.frequency,
            messageType.channels.sms.enabled ? messageType.channels.sms.audienceSize : '',
            messageType.channels.email.enabled ? messageType.channels.email.audienceSize : '',
            messageType.channels.push.enabled ? messageType.channels.push.audienceSize : '',
            messageType.channels.sms.enabled ? Math.round(credits.sms) : '',
            messageType.channels.email.enabled ? Math.round(credits.email) : '',
            messageType.channels.push.enabled ? Math.round(credits.push) : '',
            Math.round(messageTotal)
          ]);
          isFirstRow = false;
        });
        
        // Stage subtotal
        csvRows.push(['', '', '', '', '', '', '', '', `${stage.name} Subtotal:`, Math.round(stageTotal)]);
      }
    });
    
    // Final total
    csvRows.push(['', '', '', '', '', '', '', '', 'GRAND TOTAL:', Math.round(totals.grand)]);
    
    // Convert to CSV
    const csvContent = csvRows.map(row => 
      row.map(cell => {
        const cellStr = String(cell);
        return cellStr.includes(',') || cellStr.includes('"') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
      }).join(',')
    ).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-calculation-detailed-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveTemplate = () => {
    const templateName = prompt('Enter a name for this template:');
    if (!templateName) return;
    
    const template = {
      name: templateName,
      creditRates,
      journeyStages,
      messageTypes,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('creditCalculatorTemplates') || '[]');
    savedTemplates.push(template);
    localStorage.setItem('creditCalculatorTemplates', JSON.stringify(savedTemplates));
    
    alert(`Template "${templateName}" saved successfully!`);
  };

  const handleLoadTemplate = () => {
    const savedTemplates = JSON.parse(localStorage.getItem('creditCalculatorTemplates') || '[]');
    
    if (savedTemplates.length === 0) {
      alert('No saved templates found.');
      return;
    }
    
    const templateNames = savedTemplates.map((t: any, i: number) => `${i + 1}. ${t.name} (${new Date(t.createdAt).toLocaleDateString()})`);
    const selection = prompt(`Select a template to load:\n${templateNames.join('\n')}\n\nEnter the number:`);
    
    if (!selection) return;
    
    const index = parseInt(selection) - 1;
    if (index >= 0 && index < savedTemplates.length) {
      const template = savedTemplates[index];
      setCreditRates(template.creditRates);
      setJourneyStages(template.journeyStages);
      setMessageTypes(template.messageTypes);
      alert(`Template "${template.name}" loaded successfully!`);
    } else {
      alert('Invalid selection.');
    }
  };

  const handleReset = () => {
    setCreditRates({ sms: 1.00, email: 0.10, push: 0.05 });
    setJourneyStages(prev => prev.map(stage => ({ ...stage, selected: false })));
    setExpandedStages(new Set());
    // Reset message types to unselected but keep them initialized
    setMessageTypes(prev => prev.map(mt => ({ 
      ...mt, 
      selected: false,
      frequency: 'monthly',
      channels: {
        sms: { enabled: false, audienceSize: 0 },
        email: { enabled: false, audienceSize: 0 },
        push: { enabled: false, audienceSize: 0 }
      }
    })));
  };

  const totals = getTotalCredits();

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CalculatorIcon className="text-primary-500 h-8 w-8 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Credit Calculator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary-500 hover:bg-primary-600">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Detailed Spreadsheet (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Simple Export (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-full">
          {/* Column 1: Credit Configuration */}
          <div className="xl:col-span-1">
            <ConfigurationPanel
              creditRates={creditRates}
              onCreditRatesChange={setCreditRates}
              totals={totals}
            />
          </div>

          {/* Column 2: Journey Stage Selection */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
              <JourneyStageSelector
                journeyStages={journeyStages}
                messageTypes={messageTypes}
                onMessageTypeToggle={handleMessageTypeToggle}
                onExpandedStagesChange={setExpandedStages}
                expandedStages={expandedStages}
              />
            </div>
          </div>

          {/* Column 3: Message Type Configuration */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-fit">
              <MessageTypeConfigurator
                journeyStages={journeyStages}
                messageTypes={messageTypes}
                onUpdateMessageType={handleUpdateMessageType}
                calculateCredits={calculateCredits}
                expandedStages={expandedStages}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button variant="outline" onClick={handleSaveTemplate}>
                Save Template
              </Button>
              <Button variant="outline" onClick={handleLoadTemplate}>
                Load Template
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
