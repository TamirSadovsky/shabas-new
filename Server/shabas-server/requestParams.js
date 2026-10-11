function getPositiveInteger(value, fallback = null) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : null;
}

const SAFE_HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function sanitizeCssColor(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const color = value.trim();
    return SAFE_HEX_COLOR.test(color) ? color : null;
}

module.exports = { getPositiveInteger, sanitizeCssColor };
