// Configuration
const websocketPort = 63605;
const tlsConfig = {
    useTLS: false,
    cert: "",
    key: "",
};
const users = [
    {
        username: "root",
        password: "root",
    },
];
const pingTest = 20000;
const debug = false;
// End of configuration

console.log("Starting afu-group-trainer server");

const serverManagerModule = require("./serverManager");
let serverManager = new serverManagerModule.ServerManager(websocketPort, tlsConfig, users, pingTest, debug);
serverManager.loadQuestions("assets/TechnikE.json");
serverManager.loadQuestions("assets/BetriebstechnikVorschriften.json");

console.log("Startup complete, loaded " + serverManager.getTotalQuestions() + " questions.");
