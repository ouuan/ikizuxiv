import { init, track } from '@plausible-analytics/tracker';
import { DOMAIN } from './constants';

export function initTracking() {
  if (window.location.host === DOMAIN) {
    init({
      domain: DOMAIN,
      endpoint: 'https://plausible.ouuan.moe/api/event',
      hashBasedRouting: true,
    });
  }
}

export function trackEvent(...args: Parameters<typeof track>) {
  if (window.location.host === DOMAIN) {
    track(...args);
  } else {
    // eslint-disable-next-line no-console
    console.log('Not tracking on this host', JSON.stringify(args));
  }
}
