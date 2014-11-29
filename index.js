var server = require("./server");
var router = require("./router");

server.start(router.route,process.argv.slice(2));