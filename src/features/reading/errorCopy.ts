import type { TFunction } from 'i18next';

import type { InterpretationError } from './useInterpretation';

/** Burst limits reset within a minute; a longer wait means a daily cap was reached. */
const DAILY_LIMIT_AFTER_S = 5 * 60;

export function isDailyLimit(error: InterpretationError): boolean {
  return error.code === 'rate_limited' && (error.retryAfter ?? 0) > DAILY_LIMIT_AFTER_S;
}

/** Maps an API error to the shared, human copy in common.errors.*. */
export function errorMessage(t: TFunction, error: InterpretationError): string {
  switch (error.code) {
    case 'rate_limited':
      return isDailyLimit(error) ? t('common.errors.rateLimitedDay') : t('common.errors.rateLimited');
    case 'not_configured':
      return t('common.errors.notConfigured');
    case 'unauthorized':
      return t('common.errors.unauthorized');
    case 'network':
      return t('common.errors.network');
    default:
      return t('common.errors.generic');
  }
}
