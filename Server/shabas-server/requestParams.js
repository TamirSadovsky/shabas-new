function getPositiveInteger(value, fallback = null) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : null;
}

module.exports = { getPositiveInteger };
