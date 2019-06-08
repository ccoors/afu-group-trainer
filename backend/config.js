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

module.exports = config;
