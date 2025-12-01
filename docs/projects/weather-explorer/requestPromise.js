const requestPromise = (config) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function () {

            if (this.status >= 200 && this.status < 300) {
                resolve(this.response);
            } else  {
                reject(this.status);
            }

        });
        xhr.addEventListener("error", function (e) {
            reject('Connection error');
        });

        xhr.addEventListener("timeout", function (e) {
            reject('Request timeout');
        });

        xhr.open(config.method || "GET", config.url);
        xhr.send();

    });
};