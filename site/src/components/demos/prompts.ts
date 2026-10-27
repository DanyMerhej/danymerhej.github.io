import type { DemoId } from '../../data/site';

export const demoPrompt: Record<DemoId, string> = {
  split: 'Scan a receipt and split it',
  event: 'Switch event type and language',
  salon: 'Drag the bookings around',
  rent: 'Mark the car, then return it',
  home: 'Light up the house',
  stack: 'Tap to build an empire',
};
