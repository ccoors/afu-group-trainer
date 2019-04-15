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
config.debug = true;
config.questions = [
    "assets/TechnikE.json",
    "assets/BetriebstechnikVorschriften.json"
];

module.exports = config;
