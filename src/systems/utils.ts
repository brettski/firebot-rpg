import { DiceRoll } from '@dice-roller/rpg-dice-roller';

export function getPercentage(a: number, b: number): number {
    return a / b;
}

export function sumOfObjectProperties(obj: { [x: string]: any }) {
    return Object.keys(obj).reduce(
        (sum, key) => sum + parseFloat(obj[key] || 0),
        0
    );
}

export function addOrSubtractRandomPercentage(num: number) {
    if (Number.isNaN(num)) {
        num = 1;
    }
    const posOrNeg = Math.random() < 0.5 ? -1 : 1;

    // We're going to randomly add or subtract 20% from the number.
    let amount = (Math.floor(Math.random() * 20) + 1) / 100;

    // If negative, always make number negative.
    if (posOrNeg === -1) {
        amount = -Math.abs(amount);
    }

    // Add or subtract percentage from our given number.
    const total = num + num * amount;

    // Round to whole number and return.
    return Math.floor(total);
}

/**
 * This is a method used specifically for getting items from their lists.
 * @param array
 * @param key
 * @param value
 */
export function getItemFromItemListById(array: any[], itemId: number) {
    const results = array.filter((x) => {
        return x.id === itemId;
    });

    return results;
}

/**
 * Checks whether a single property value matches a search value, branching on shape
 * rather than type: array fields compared against an array search for set equality
 * (order-independent), array fields compared against a scalar search for membership,
 * and everything else for exact equality.
 * @param propertyValue
 * @param value
 */
function propertyMatches(propertyValue: any, value: any): boolean {
    if (Array.isArray(propertyValue) && Array.isArray(value)) {
        return (
            propertyValue.length === value.length &&
            value.every((v) => propertyValue.includes(v))
        );
    }

    if (Array.isArray(propertyValue)) {
        return propertyValue.includes(value);
    }

    return propertyValue === value;
}

/**
 * A filter for getting a list of matching items from an array.
 * @param array
 * @param keys
 * @param value
 * @returns
 */
export function filterArrayByProperty(
    array: any[],
    keys: string[],
    value: any
) {
    return array.filter((o) => keys.some((k) => propertyMatches(o[k], value)));
}

export function getTopValuesFromObject(
    object: Object,
    numberResults: number
): any[] | null {
    // First, filter out all zero values.
    const newObject = Object.keys(object)
        // @ts-ignore
        .filter((k) => object[k] !== 0)
        // @ts-ignore
        .reduce((a, k) => ({ ...a, [k]: object[k] }), {});

    if (Object.keys(newObject) == null || newObject == null) {
        return null;
    }

    const keys = Object.keys(newObject);
    keys.sort((a, b) => {
        // @ts-ignore
        return newObject[b] - newObject[a];
    });
    return keys.slice(0, numberResults);
}

export const capitalize = (str: string, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(
        /(?:^|\s|["'([{])+\S/g,
        (match: string) => match.toUpperCase()
    );

export function rollDice(dice: string): number {
    const roll = new DiceRoll(dice);
    return roll.total;
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export function formatDate(date: Date) {
    return [
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
        date.getFullYear(),
    ].join('/');
}
