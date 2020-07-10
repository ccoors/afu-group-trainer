let config = {};

config.websocketPort = 63605;
config.tlsConfig = {
    useTLS: false,
    cert: "",
    key: "",
};
config.users = [
    {
        username: "root",
        password: "root",
    },
];
config.pingTest = 20000;
config.debug = false;
config.questions = [
    "assets/Fragenkatalog.json"
];
config.influx = {
    enabled: false,
    field_prefix: 'agt_',
    interval: 30,
    config: {
        host: 'localhost',
        port: 8086,
        database: 'default',
        username: '',
        password: '',
    }
}

module.exports = config;
