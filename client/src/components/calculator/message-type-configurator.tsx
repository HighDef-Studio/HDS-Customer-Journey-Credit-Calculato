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
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
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

                          <div>
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

                          <div className="flex justify-end items-end">
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

                        {/* Channel Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* SMS Channel */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center mb-3">
                              <Checkbox
                                checked={messageType.channels.sms.enabled}
                                onCheckedChange={(checked) => 
                                  onUpdateMessageType(messageType.id, {
                                    channels: { 
                                      ...messageType.channels, 
                                      sms: { ...messageType.channels.sms, enabled: !!checked }
                                    }
                                  })
                                }
                                className="h-4 w-4 mr-2"
                              />
                              <Label className="text-sm font-medium text-gray-900">SMS</Label>
                            </div>
                            {messageType.channels.sms.enabled && (
                              <div>
                                <Label className="block text-xs text-gray-600 mb-1">
                                  Audience Size
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={messageType.channels.sms.audienceSize}
                                  onChange={(e) => onUpdateMessageType(messageType.id, {
                                    channels: { 
                                      ...messageType.channels, 
                                      sms: { 
                                        ...messageType.channels.sms, 
                                        audienceSize: parseInt(e.target.value) || 0 
                                      }
                                    }
                                  })}
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* Email Channel */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center mb-3">
                              <Checkbox
                                checked={messageType.channels.email.enabled}
                                onCheckedChange={(checked) => 
                                  onUpdateMessageType(messageType.id, {
                                    channels: { 
                                      ...messageType.channels, 
                                      email: { ...messageType.channels.email, enabled: !!checked }
                                    }
                                  })
                                }
                                className="h-4 w-4 mr-2"
                              />
                              <Label className="text-sm font-medium text-gray-900">Email</Label>
                            </div>
                            {messageType.channels.email.enabled && (
                              <div>
                                <Label className="block text-xs text-gray-600 mb-1">
                                  Audience Size
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={messageType.channels.email.audienceSize}
                                  onChange={(e) => onUpdateMessageType(messageType.id, {
                                    channels: { 
                                      ...messageType.channels, 
                                      email: { 
                                        ...messageType.channels.email, 
                                        audienceSize: parseInt(e.target.value) || 0 
                                      }
                                    }
                                  })}
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>

                          {/* Push Channel */}
                          <div className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center mb-3">
                              <Checkbox
                                checked={messageType.channels.push.enabled}
                                onCheckedChange={(checked) => 
                                  onUpdateMessageType(messageType.id, {
                                    channels: { 
                                      ...messageType.channels, 
                                      push: { ...messageType.channels.push, enabled: !!checked }
                                    }
                                  })
                                }
                                className="h-4 w-4 mr-2"
                              />
                              <Label className="text-sm font-medium text-gray-900">Push</Label>
                            </div>
                            {messageType.channels.push.enabled && (
                              <div>
                                <Label className="block text-xs text-gray-600 mb-1">
                                  Audience Size
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={messageType.channels.push.audienceSize}
                                  onChange={(e) => onUpdateMessageType(messageType.id, {
                                    channels: { 
                                      ...messageType.channels, 
                                      push: { 
                                        ...messageType.channels.push, 
                                        audienceSize: parseInt(e.target.value) || 0 
                                      }
                                    }
                                  })}
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>
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
