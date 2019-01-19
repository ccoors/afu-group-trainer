let config = require("./config");
console.log("Starting afu-group-trainer server");

const serverManagerModule = require("./serverManager");
let serverManager = new serverManagerModule.ServerManager(config);

console.log("Startup complete, loaded " + serverManager.getTotalQuestions() + " questions.");
