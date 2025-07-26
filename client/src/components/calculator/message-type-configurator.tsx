import { useState } from 'react';
import { List, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { type JourneyStage, type MessageType } from '@shared/schema';
import { journeyStageData } from '@/lib/journey-data';

interface MessageTypeConfiguratorProps {
  journeyStages: JourneyStage[];
  messageTypes: MessageType[];
  onAddMessageType: (stageId: string) => void;
  onUpdateMessageType: (id: string, updates: Partial<MessageType>) => void;
  onRemoveMessageType: (id: string) => void;
  calculateCredits: (messageType: MessageType) => MessageType['credits'];
}

export function MessageTypeConfigurator({
  journeyStages,
  messageTypes,
  onAddMessageType,
  onUpdateMessageType,
  onRemoveMessageType,
  calculateCredits
}: MessageTypeConfiguratorProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  const selectedStages = journeyStages.filter(stage => stage.selected);

  if (selectedStages.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <List className="text-primary-500 h-5 w-5 mr-2" />
          Message Type Configuration
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Select journey stages above to configure message types</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <List className="text-primary-500 h-5 w-5 mr-2" />
        Message Type Configuration
      </h3>

      {selectedStages.map((stage) => {
        const stageMessageTypes = messageTypes.filter(mt => mt.journeyStageId === stage.id);
        const isExpanded = expandedStages.has(stage.id);
        const stageData = journeyStageData.find(s => s.id === stage.id);

        return (
          <div key={stage.id} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">{stage.name}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStageExpansion(stage.id)}
                className="text-primary-600 hover:text-primary-700"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {isExpanded && (
              <div className="space-y-4">
                {stageMessageTypes.map((messageType) => {
                  const credits = calculateCredits(messageType);
                  
                  return (
                    <div key={messageType.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                        <div className="lg:col-span-3">
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Message Type
                          </Label>
                          <Select
                            value={messageType.type}
                            onValueChange={(value) => onUpdateMessageType(messageType.id, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {stageData?.messageTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="lg:col-span-2">
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Audience Size
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            value={messageType.audienceSize}
                            onChange={(e) => onUpdateMessageType(messageType.id, { 
                              audienceSize: parseInt(e.target.value) || 0 
                            })}
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Frequency
                          </Label>
                          <Select
                            value={messageType.frequency}
                            onValueChange={(value: any) => onUpdateMessageType(messageType.id, { frequency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="one-time">One-time</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="lg:col-span-4">
                          <Label className="block text-sm font-medium text-gray-700 mb-2">
                            Channel Selection
                          </Label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <Checkbox
                                checked={messageType.channels.sms}
                                onCheckedChange={(checked) => 
                                  onUpdateMessageType(messageType.id, {
                                    channels: { ...messageType.channels, sms: !!checked }
                                  })
                                }
                                className="h-4 w-4"
                              />
                              <span className="ml-2 text-sm text-gray-700">SMS</span>
                            </label>
                            <label className="flex items-center">
                              <Checkbox
                                checked={messageType.channels.email}
                                onCheckedChange={(checked) => 
                                  onUpdateMessageType(messageType.id, {
                                    channels: { ...messageType.channels, email: !!checked }
                                  })
                                }
                                className="h-4 w-4"
                              />
                              <span className="ml-2 text-sm text-gray-700">Email</span>
                            </label>
                            <label className="flex items-center">
                              <Checkbox
                                checked={messageType.channels.push}
                                onCheckedChange={(checked) => 
                                  onUpdateMessageType(messageType.id, {
                                    channels: { ...messageType.channels, push: !!checked }
                                  })
                                }
                                className="h-4 w-4"
                              />
                              <span className="ml-2 text-sm text-gray-700">Push</span>
                            </label>
                          </div>
                        </div>

                        <div className="lg:col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveMessageType(messageType.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Credit Breakdown */}
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-gray-600">SMS Credits</div>
                            <div className="font-semibold text-gray-900">{credits.sms.toLocaleString()}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-600">Email Credits</div>
                            <div className="font-semibold text-gray-900">{credits.email.toLocaleString()}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-600">Push Credits</div>
                            <div className="font-semibold text-gray-900">{credits.push.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button
                  variant="outline"
                  onClick={() => onAddMessageType(stage.id)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 hover:border-primary-300 hover:text-primary-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Message Type
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
