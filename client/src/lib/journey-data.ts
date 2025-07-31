export const journeyStageData = [
  {
    id: 'new-member-activation',
    name: 'New Member Activation',
    messageTypes: [
      { type: 'After Join / Welcome', frequency: 'monthly' },
      { type: '2nd Visit Milestone', frequency: 'monthly' },
      { type: '3rd Visit Milestone', frequency: 'monthly' },
      { type: '4th Visit Milestone', frequency: 'monthly' },
      { type: 'Joined, No Purchase', frequency: 'monthly' },
      { type: 'No 2nd Purchase, 30 Days', frequency: 'monthly' },
      { type: 'Referral Program', frequency: 'monthly' }
    ]
  },
  {
    id: 'habituation-repeat-visits',
    name: 'Habituation & Repeat Visits',
    messageTypes: [
      { type: 'Flash Sales / Happy Hours', frequency: 'weekly' },
      { type: 'Standard 2x Week Messaging', frequency: 'weekly' },
      { type: 'Monthly Push Offer', frequency: 'monthly' },
      { type: 'Visit Milestones', frequency: 'monthly' }
    ]
  },
  {
    id: 'churn-risk-reengagement',
    name: 'Churn Risk / Re-engagement',
    messageTypes: [
      { type: 'Win Back (45 Days)', frequency: 'monthly' },
      { type: 'Win Back (90 Days)', frequency: 'monthly' },
      { type: 'Win Back (180+ Days)', frequency: 'monthly' },
      { type: 'Dispensary Closure', frequency: 'monthly' },
      { type: '30 Day Point Expiration', frequency: 'monthly' },
      { type: '90 Day Point Expiration', frequency: 'quarterly' }
    ]
  },
  {
    id: 'high-value-customer-recognition',
    name: 'High-Value Customer Recognition',
    messageTypes: [
      { type: 'VIP Spenders', frequency: 'monthly' },
      { type: 'Frequent Flyer', frequency: 'monthly' },
      { type: 'Big Purchase Milestones', frequency: 'quarterly' }
    ]
  },
  {
    id: 'evergreen-loyalty-value-add',
    name: 'Evergreen Loyalty Value Add',
    messageTypes: [
      { type: 'Category / Brand Campaign', frequency: 'weekly' },
      { type: 'Birthday', frequency: 'monthly' }
    ]
  }
];
