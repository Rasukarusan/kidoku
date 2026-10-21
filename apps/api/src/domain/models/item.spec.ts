import {
  ItemTypeDefinition,
  validateAttributes,
  validateLog,
  validateTitle,
} from './item';

const movie: ItemTypeDefinition = {
  fields: [
    { key: 'directors', label: '監督', type: 'textList' },
    {
      key: 'runtimeMinutes',
      label: '上映時間',
      type: 'number',
      min: 1,
      max: 10000,
    },
  ],
  logKinds: [{ key: 'watched', label: '鑑賞', dateLabel: '鑑賞日' }],
  itemUnit: '作品',
};

describe('type-defined items', () => {
  it('stores directors without treating them as authors', () => {
    expect(
      validateAttributes(movie, {
        directors: ['監督A', '監督B'],
        runtimeMinutes: 120,
      }),
    ).toEqual({ directors: ['監督A', '監督B'], runtimeMinutes: 120 });
    expect(() => validateAttributes(movie, { authors: ['著者'] })).toThrow();
  });
  it.each([0, -1, 1.5, NaN, Infinity, '120', 10001])(
    'rejects invalid runtime %p',
    (runtimeMinutes) => {
      expect(() =>
        validateAttributes(movie, { runtimeMinutes } as never),
      ).toThrow();
    },
  );
  it('supports a third type solely through its definition', () => {
    const exhibition: ItemTypeDefinition = {
      fields: [
        { key: 'venue', label: '会場', type: 'text', required: true },
        { key: 'ticketOwned', label: 'チケット', type: 'boolean' },
      ],
      logKinds: [{ key: 'visited', label: '訪問', dateLabel: '訪問日' }],
      itemUnit: '展',
    };
    expect(
      validateAttributes(exhibition, { venue: '美術館', ticketOwned: false }),
    ).toEqual({ venue: '美術館', ticketOwned: false });
    expect(() => validateAttributes(exhibition, {})).toThrow('会場は必須です');
    expect(() =>
      validateLog(exhibition, {
        kind: 'watched',
        occurredAt: null,
        memo: '',
        rating: null,
      }),
    ).toThrow();
  });
  it('allows undated logs without inventing the current date', () => {
    const input = {
      kind: 'watched',
      occurredAt: null,
      memo: '昔観た作品',
      rating: null,
    };
    expect(() => validateLog(movie, input)).not.toThrow();
    expect(input.occurredAt).toBeNull();
  });
  it('rejects invalid dates, unknown log kinds and unknown ratings', () => {
    expect(() =>
      validateLog(movie, {
        kind: 'watched',
        occurredAt: new Date('bad'),
        memo: '',
        rating: null,
      }),
    ).toThrow();
    expect(() =>
      validateLog(movie, {
        kind: 'read',
        occurredAt: null,
        memo: '',
        rating: null,
      }),
    ).toThrow();
    expect(() =>
      validateLog(movie, {
        kind: 'watched',
        occurredAt: null,
        memo: '',
        rating: 'invalid',
      }),
    ).toThrow();
  });
  it('requires a real title within the database limit', () => {
    expect(validateTitle('  タイトル  ')).toBe('タイトル');
    expect(() => validateTitle(' ')).toThrow();
    expect(() => validateTitle('あ'.repeat(101))).toThrow();
  });
});
