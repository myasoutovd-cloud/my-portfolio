const request = async (config) => {
    try {
        const response = await fetch(config.url, {
            method: config.method || 'GET'
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const data = await response.json();
        config.success(data);
    } catch (err) {
        config.error(err.message || 'Connection error');
    }
};