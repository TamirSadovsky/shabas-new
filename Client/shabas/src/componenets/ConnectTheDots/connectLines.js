// PlaceType 0 options are rendered with "element-left-" ids, PlaceType 1 with "element-right-".
export const WORD_PREFIX = 'element-left-';
export const CATEGORY_PREFIX = 'element-right-';

const isWordId = (id) => typeof id === 'string' && id.startsWith(WORD_PREFIX);
const isCategoryId = (id) => typeof id === 'string' && id.startsWith(CATEGORY_PREFIX);

export const makeLine = (a, b) => {
    if (isWordId(a) && isCategoryId(b)) return { start: a, end: b };
    if (isCategoryId(a) && isWordId(b)) return { start: b, end: a };
    return null;
};

export const lineKey = (line) => `${line.start}|${line.end}`;

export const normaliseLines = (lines = []) => {
    const seen = new Set();
    return (lines || []).reduce((acc, line) => {
        const normalised = line && makeLine(line.start, line.end);
        if (normalised && !seen.has(lineKey(normalised))) {
            seen.add(lineKey(normalised));
            acc.push(normalised);
        }
        return acc;
    }, []);
};

export const correctPairsToLines = (correctAnswerId = []) => normaliseLines(
    (correctAnswerId || []).flatMap(answer => Object.entries(answer).map(([line, ans]) => ({
        start: `${WORD_PREFIX}${parseInt(line, 10)}`,
        end: `${CATEGORY_PREFIX}${parseInt(ans, 10)}`
    })))
);

export const toggleLine = (lines, line, oneToOne) => {
    const key = lineKey(line);
    if (lines.some(l => lineKey(l) === key)) {
        return lines.filter(l => lineKey(l) !== key);
    }
    if (oneToOne) {
        return [...lines.filter(l => l.start !== line.start && l.end !== line.end), line];
    }
    return [...lines, line];
};

export const scoreLines = (lines, correctKeys) => {
    const correctLines = lines.filter(line => correctKeys.has(lineKey(line)));
    const wrongCount = lines.length - correctLines.length;
    let status = 'incorrect';
    if (correctLines.length === correctKeys.size && wrongCount === 0) {
        status = 'fully-correct';
    } else if (correctLines.length > 0) {
        status = 'partly-correct';
    }
    return { status, correctLines };
};
