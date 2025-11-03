const request = (config) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function () {

        if (this.status >= 200 && this.status < 300) {
            const response = JSON.parse(this.responseText);
            config.success(response);
        } else {
            throw new Error(`${this.status}`);
        }

    });

    xhr.addEventListener("error", function (e) {
        throw new Error('Connection error');
    });

    xhr.addEventListener("timeout", function (e) {
        throw new Error('Request timeout');
    });


    xhr.open(config.method || "GET", config.url);
    xhr.send();
};