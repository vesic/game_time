import { returnInt } from '../App';

const JACK = 'JACK';
const QUEEN = 'QUEEN';
const KING = 'KING';
const ACE = 'ACE';

test('if integer is passed do nothing', () => {
    expect(returnInt(1)).toBe(1);
    expect(returnInt(3)).toBe(3);
    expect(returnInt(10)).toBe(10);
})

test('if text is passed return integer', () => {
    expect(returnInt(ACE)).toBe(14);
    expect(returnInt(KING)).toBe(13);
    expect(returnInt(QUEEN)).toBe(12);
    expect(returnInt(JACK)).toBe(11);
})