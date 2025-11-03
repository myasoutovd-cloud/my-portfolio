const request = (config) => {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener("load", function () {

        if (this.status >= 200 && this.status < 300) {
            const response = JSON.parse(this.responseText);
            config.success(response);
        } else {
            config.error(this.status);
        }
    });

    xhr.addEventListener("error", function (e) {
        config.error('Connection error');
    });

    xhr.addEventListener("timeout", function (e) {
        config.error('Request timeout');
    });

    xhr.open(config.method || "GET", config.url);
    xhr.send();
}