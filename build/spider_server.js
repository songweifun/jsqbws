/**
 * Created by daivd on 2018/1/28.
 */
"use strict";
/**
 * Created by daivd on 2017/9/3.
 */
var ws_1 = require("ws");
var request = require('request');
//这个要放到最上面
var Task = (function () {
    function Task(id, number, title, total_count, complete_count, percent, file_path, status_code, flag, remark, database_id, create_time, update_time) {
        this.id = id;
        this.number = number;
        this.title = title;
        this.total_count = total_count;
        this.complete_count = complete_count;
        this.percent = percent;
        this.file_path = file_path;
        this.status_code = status_code;
        this.flag = flag;
        this.remark = remark;
        this.database_id = database_id;
        this.create_time = create_time;
        this.update_time = update_time;
    }
    return Task;
}());
exports.Task = Task;
var Comment = (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var subscription = new Map(); //定义一个集合 key为客户端websocket value是关注的所有商品的数组
var wsServer = new ws_1.Server({ port: 8086 });
wsServer.on('connection', function (websocket) {
    websocket.on('message', function (message) {
        //console.log('接收到消息:'+message)
        var messageObj = JSON.parse(message + '');
        subscription.set(websocket, messageObj.restful_url); //原来的所有商品id加上现在的商品的id
        console.log();
    });
    //clients.push(websocket);
});
//定时向客户端推送消息
setInterval(function () {
    var tasks = [];
    //循环所有的客户端
    if (subscription) {
        subscription.forEach(function (restful_url, ws) {
            //循环集合时有两个参数第一个参数为value 第二个参数为key
            if (ws.readyState == 1) {
                //let token='';
                //token=subscription.get(ws);
                console.log(restful_url);
                request({
                    url: restful_url,
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // if (JSON.parse(body).data.data) {
                        //     tasks = JSON.parse(body).data.data;
                        // }
                        //console.log(body)
                        tasks = body;
                        if (ws.readyState == 1) {
                            ws.send(tasks);
                        }
                        else {
                            subscription.delete(ws);
                        }
                    }
                });
            }
            else {
                //subscription.delete(ws)
                //delete subscription[ws]
                subscription.delete(ws);
            }
        });
    }
}, 500);
