import { isClipLocked, isPremiumPlay, playOf } from './clip-access';
import { en } from './i18n/en';

/**
 * The paywall is decided by matching play names in clip titles, so a copy
 * change can silently move a clip across the Basic/Premium line. These pin the
 * volleyball split (flags-for-yuval F2): digs and blocks are Premium, kills,
 * set assists and aces are Basic. Titles come from the dictionary so the
 * test breaks the moment the copy and the classifier disagree.
 */
describe('clip-access (volleyball)', () => {
  const premium = ['play.pancakeDig', 'play.divingDig', 'play.digToKill', 'play.pursuitSave',
    'play.soloBlock', 'play.stuffBlock', 'play.blockAssist', 'play.roofBlock', 'play.softBlock', 'play.joustWin'] as const;
  const basic = ['play.lineShot', 'play.crossCourtKill', 'play.setPointKill', 'play.matchPointKill', 'play.overpassKill',
    'play.setterDump', 'play.rallyWin', 'play.tipKill', 'play.jumpServeAce', 'play.floatAce', 'play.aceToSeal',
    'play.noLookSet', 'play.backSetAssist', 'play.oneHandSet'] as const;

  it('classes every seeded play', () => {
    for (const k of [...premium, ...basic]) expect(playOf(en[k])).withContext(en[k]).not.toBeNull();
  });
  it('locks digs and blocks for Basic, unlocks kills, sets and aces', () => {
    for (const k of premium) expect(isClipLocked(en[k], 'basic')).withContext(en[k]).toBeTrue();
    for (const k of basic) expect(isClipLocked(en[k], 'basic')).withContext(en[k]).toBeFalse();
  });
  it('Premium sees everything, Free sees nothing of its own', () => {
    for (const k of [...premium, ...basic]) {
      expect(isClipLocked(en[k], 'premium')).toBeFalse();
      expect(isClipLocked(en[k], 'free')).toBeTrue();
    }
  });
  it('marks the premium plays gold regardless of tier', () => {
    expect(isPremiumPlay(en['play.stuffBlock'])).toBeTrue();
    expect(isPremiumPlay(en['play.lineShot'])).toBeFalse();
  });
  it('resolves the ambiguous titles by the act that made them', () => {
    expect(playOf('Dig to kill')).toBe('dig');
    expect(playOf('Soft block and put away')).toBe('block');
    expect(playOf('Ace to seal the set')).toBe('ace');
    expect(playOf('Set-point kill')).toBe('kill');
    expect(playOf('Block assist')).toBe('block');
  });
});
