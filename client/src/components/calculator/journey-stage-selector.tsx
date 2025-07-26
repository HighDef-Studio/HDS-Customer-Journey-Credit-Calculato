import { Route } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { type JourneyStage, type MessageType } from '@shared/schema';

interface JourneyStageSelectorProps {
  journeyStages: JourneyStage[];
  messageTypes: MessageType[];
  onStageToggle: (stageId: string) => void;
}

export function JourneyStageSelector({ journeyStages, messageTypes, onStageToggle }: JourneyStageSelectorProps) {
  const getStageMessageCount = (stageId: string) => {
    return messageTypes.filter(mt => mt.journeyStageId === stageId && mt.selected).length;
  };

  const getAvailableMessageTypesCount = (stageId: string) => {
    const stageData = {
      'new-member-activation': 8,
      'habituation-repeat-visits': 8,
      'churn-risk-reengagement': 6,
      'high-value-customer-recognition': 7,
      'evergreen-loyalty-value-add': 7
    };
    return stageData[stageId as keyof typeof stageData] || 0;
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Route className="text-primary-500 h-5 w-5 mr-2" />
        Journey Stage Selection
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {journeyStages.map((stage) => {
          const selectedCount = getStageMessageCount(stage.id);
          const availableCount = getAvailableMessageTypesCount(stage.id);
          
          return (
            <div
              key={stage.id}
              className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                stage.selected 
                  ? 'border-primary-300 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              onClick={() => onStageToggle(stage.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{stage.name}</h3>
                <Checkbox
                  checked={stage.selected}
                  onChange={() => {}} // Handled by parent onClick
                  className="h-4 w-4"
                />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {availableCount} message types available
              </p>
              <div className="mt-2">
                <Badge 
                  variant={selectedCount > 0 ? "default" : "secondary"}
                  className={selectedCount > 0 ? "bg-primary-50 text-primary-700" : ""}
                >
                  {selectedCount} selected
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
