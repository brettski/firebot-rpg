import { filterArrayByProperty } from './utils';

describe('filterArrayByProperty', () => {
    describe('scalar fields', () => {
        const items = [
            { id: 1, rarity: 'basic' },
            { id: 11, rarity: 'rare' },
            { id: 41, rarity: 'epic' },
        ];

        it('matches on exact value', () => {
            expect(filterArrayByProperty(items, ['id'], 1)).toEqual([
                { id: 1, rarity: 'basic' },
            ]);
        });

        it('does not match a different value', () => {
            expect(filterArrayByProperty(items, ['id'], 2)).toEqual([]);
        });

        it('does not match when the search value is a substring of the field', () => {
            // Regression test: id 1 must not match id 11 or 41 just because "1" is
            // a substring of "11" and "41".
            const result = filterArrayByProperty(items, ['id'], 1);
            expect(result.map((item) => item.id)).toEqual([1]);
        });

        it('does not match when the field is a substring of the search value', () => {
            // Regression test the other direction: searching for 11 must not match
            // a field of 1.
            const result = filterArrayByProperty(items, ['id'], 11);
            expect(result.map((item) => item.id)).toEqual([11]);
        });

        it('matches string scalar fields exactly', () => {
            expect(filterArrayByProperty(items, ['rarity'], 'rare')).toEqual([
                { id: 11, rarity: 'rare' },
            ]);
        });
    });

    describe('array fields (membership)', () => {
        const items = [
            { name: 'a', difficulty: ['easy'] },
            { name: 'b', difficulty: ['medium'] },
            { name: 'c', difficulty: ['easy', 'medium'] },
        ];

        it('matches when the search value is present in the array field', () => {
            const result = filterArrayByProperty(items, ['difficulty'], 'easy');
            expect(result.map((item) => item.name)).toEqual(['a', 'c']);
        });

        it('does not match when the search value is absent from the array field', () => {
            const result = filterArrayByProperty(items, ['difficulty'], 'hard');
            expect(result).toEqual([]);
        });
    });

    describe('array-vs-array fields (set equality)', () => {
        const items = [
            { name: 'Lava', enchantments: ['earth', 'fire'] },
            { name: 'Scorching', enchantments: ['wind', 'fire'] },
        ];

        it('matches the same two elements regardless of order', () => {
            const result = filterArrayByProperty(
                items,
                ['enchantments'],
                ['fire', 'earth']
            );
            expect(result.map((item) => item.name)).toEqual(['Lava']);
        });

        it('does not match on a partial overlap of only one shared element', () => {
            // Regression test: a naive "some element overlaps" check would wrongly
            // match both Lava and Scorching here since both contain 'fire'. Only an
            // exact set match should succeed.
            const result = filterArrayByProperty(
                items,
                ['enchantments'],
                ['fire', 'wind']
            );
            expect(result.map((item) => item.name)).toEqual(['Scorching']);
        });

        it('does not match when lengths differ', () => {
            const result = filterArrayByProperty(
                items,
                ['enchantments'],
                ['fire']
            );
            expect(result).toEqual([]);
        });
    });

    describe('multiple keys', () => {
        const items = [
            { primary: 'fire', secondary: 'earth' },
            { primary: 'water', secondary: 'wind' },
        ];

        it('matches if any listed key matches, even if others do not', () => {
            const result = filterArrayByProperty(
                items,
                ['primary', 'secondary'],
                'earth'
            );
            expect(result).toEqual([{ primary: 'fire', secondary: 'earth' }]);
        });
    });

    describe('edge cases', () => {
        it('returns an empty array when given an empty array', () => {
            expect(filterArrayByProperty([], ['id'], 1)).toEqual([]);
        });
    });
});
