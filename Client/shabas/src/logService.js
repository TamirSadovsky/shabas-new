import LoggerWorker from '../loggerWorker?worker';

class LogService {
    constructor() {
        this.worker = new LoggerWorker();
    }

    log(data) {
        this.worker.postMessage({
            url: '/log/insert_to_log',
            data: data,
        });
    }

    logfinal(data) {
        this.worker.postMessage({
            url: '/log/insert_to_log_final',
            data: data,
        });
    }

    // Optional: If you need to terminate the worker
    terminate() {
        this.worker.terminate();
    }
}

// Create a singleton instance of the LogService
const logServiceInstance = new LogService();
export default logServiceInstance;