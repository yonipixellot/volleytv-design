import { Pipe, PipeTransform } from '@angular/core';
import { t, type Key } from './i18n';

/**
 * `{{ 'home.live' | t }}` / `{{ 'you.clips' | t: { n: 3 } }}`.
 * Pure on purpose: the language is constant per page load (see i18n.ts), so
 * Angular can cache each lookup.
 */
@Pipe({ name: 't', standalone: true })
export class TPipe implements PipeTransform {
  transform(key: Key, params?: Record<string, string | number>): string {
    return t(key, params);
  }
}
