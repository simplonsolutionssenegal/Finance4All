import {
  ABOUT_MISSION_BULLETS,
  ABOUT_STATS,
  ABOUT_TIMELINE,
  ABOUT_VALUES,
} from '@/types/utils/about-data';

describe('about-data', () => {
  it('contains expected number of items', () => {
    expect(ABOUT_STATS).toHaveLength(4);
    expect(ABOUT_MISSION_BULLETS).toHaveLength(3);
    expect(ABOUT_VALUES).toHaveLength(4);
    expect(ABOUT_TIMELINE).toHaveLength(3);
  });

  it('contains required fields', () => {
    expect(ABOUT_STATS[0]).toHaveProperty('value');
    expect(ABOUT_MISSION_BULLETS[0]).toHaveProperty('title');
    expect(ABOUT_VALUES[0]).toHaveProperty('icon');
    expect(ABOUT_TIMELINE[0]).toHaveProperty('side');
  });
});
