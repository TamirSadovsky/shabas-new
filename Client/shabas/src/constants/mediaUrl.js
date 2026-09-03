import axiosInstance from './axios.config';

const apiBaseUrl = String(axiosInstance.defaults.baseURL || '')
    .replace(/\/+$/, '');

const isWindowsPath = (value) => (
    /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\')
);

export const resolveMediaUrl = (value) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return undefined;
    }

    const normalizedValue = value.trim();
    if (/^(https?:|data:|blob:)/i.test(normalizedValue)) {
        return normalizedValue;
    }

    if (isWindowsPath(normalizedValue) || !apiBaseUrl) {
        return undefined;
    }

    return normalizedValue.startsWith('/')
        ? `${apiBaseUrl}${normalizedValue}`
        : `${apiBaseUrl}/${normalizedValue}`;
};

export default resolveMediaUrl;
