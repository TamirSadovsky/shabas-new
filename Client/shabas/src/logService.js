import LoggerWorker from '../loggerWorker?worker';
import axiosInstance from './constants/axios.config';

class LogService {
    constructor() {
        this.worker = new LoggerWorker();
        this.bookId = 1;
    }

    setBookId(bookId) {
        const parsedBookId = Number(bookId);
        this.bookId = Number.isInteger(parsedBookId) && parsedBookId > 0
            ? parsedBookId
            : 1;
    }

    withBookContext(data) {
        return {
            ...data,
            bookId: data.bookId || this.bookId,
        };
    }

    log(data) {
        this.worker.postMessage({
            url: '/log/insert_to_log',
            data: this.withBookContext(data),
        });
    }

    logfinal(data) {
        this.worker.postMessage({
            url: '/log/insert_to_log_final',
            data: this.withBookContext(data),
        });
    }

    saveFinal(data) {
        return axiosInstance.post(
            '/log/insert_to_log_final',
            this.withBookContext(data)
        );
    }

    // Optional: If you need to terminate the worker
    terminate() {
        this.worker.terminate();
    }
}

// Create a singleton instance of the LogService
const logServiceInstance = new LogService();
export default logServiceInstance;