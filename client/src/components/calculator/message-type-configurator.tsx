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
  onUpdateMessageType: (id: string, updates: Partial<MessageType>) => void;
  calculateCredits: (messageType: MessageType) => MessageType['credits'];
}

export function MessageTypeConfigurator({
  journeyStages,
  messageTypes,
  onUpdateMessageType,
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
                {/* Message Type Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stageMessageTypes.map((messageType) => (
                    <div key={messageType.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white">
                      <Checkbox
                        checked={messageType.selected}
                        onCheckedChange={(checked) => 
                          onUpdateMessageType(messageType.id, { selected: !!checked })
                        }
                        className="h-4 w-4"
                      />
                      <Label className="text-sm font-medium text-gray-900 flex-1">
                        {messageType.type}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Configuration for Selected Message Types */}
                {stageMessageTypes.filter(mt => mt.selected).map((messageType) => {
                  const credits = calculateCredits(messageType);
                  
                  return (
                    <div key={messageType.id} className="border border-primary-200 rounded-lg p-4 bg-primary-50">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">{messageType.type}</h5>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm text-gray-700">Frequency:</Label>
                            <Select
                              value={messageType.frequency}
                              onValueChange={(value: any) => onUpdateMessageType(messageType.id, { frequency: value })}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="one-time">One-time</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Channel Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* SMS Channel */}
                          <div className="border border-gray-200 rounded-lg p-3 bg-white">
                            <div className="flex items-center mb-2">
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
                          <div className="border border-gray-200 rounded-lg p-3 bg-white">
                            <div className="flex items-center mb-2">
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
                          <div className="border border-gray-200 rounded-lg p-3 bg-white">
                            <div className="flex items-center mb-2">
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

                        {/* Credit Breakdown */}
                        <div className="grid grid-cols-3 gap-4 text-sm pt-3 border-t border-gray-300">
                          <div className="text-center">
                            <div className="text-gray-600">SMS Credits/Month</div>
                            <div className="font-semibold text-gray-900">{Math.round(credits.sms).toLocaleString()}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-600">Email Credits/Month</div>
                            <div className="font-semibold text-gray-900">{Math.round(credits.email).toLocaleString()}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-600">Push Credits/Month</div>
                            <div className="font-semibold text-gray-900">{Math.round(credits.push).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
