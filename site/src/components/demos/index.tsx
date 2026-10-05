import type { DemoId } from '../../data/site';
import { EventDemo } from './EventDemo';
import { RentDemo } from './RentDemo';
import { SalonDemo } from './SalonDemo';
import { SplitDemo } from './SplitDemo';
import { StackDemo } from './StackDemo';

/** One playable toy per product, each a few seconds of what the real thing does. */
export function Demo({ id }: { id: DemoId }) {
  switch (id) {
    case 'split':
      return <SplitDemo />;
    case 'event':
      return <EventDemo />;
    case 'salon':
      return <SalonDemo />;
    case 'rent':
      return <RentDemo />;
    case 'stack':
      return <StackDemo />;
  }
}
