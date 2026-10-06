/**
 * One reader of the scroll position for the whole page.
 *
 * Reading window.scrollY makes the browser bring layout up to date, so having
 * several scroll listeners each read it can mean several forced layouts per
 * frame. Here the scroll event only schedules a read; it happens once, at the
 * start of the next frame (when layout is normally clean), and every
 * subscriber gets the same number.
 */
type Subscriber = (y: number, previous: number) => void;

const subscribers = new Set<Subscriber>();
let y = 0;
let previous = 0;
let scheduled = false;

function flush() {
  scheduled = false;
  previous = y;
  y = window.scrollY;
  subscribers.forEach((s) => s(y, previous));
}

function onScroll() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(flush);
}

export function onScrollFrame(subscriber: Subscriber): () => void {
  if (subscribers.size === 0) {
    y = previous = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  subscribers.add(subscriber);
  subscriber(y, previous);
  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) window.removeEventListener('scroll', onScroll);
  };
}
