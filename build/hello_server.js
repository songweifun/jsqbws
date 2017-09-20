"use strict";
/**
 * Created by daivd on 2017/9/3.
 */
var http = require("http");
var server = http.createServer(function (request, respose) {
    respose.end("Hello Node !");
});
server.listen(8000);
