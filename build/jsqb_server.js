/**
 * Created by daivd on 2017/9/3.
 */
"use strict";
var ws_1 = require("ws");
var request = require('request');
//这个要放到最上面
var Order = (function () {
    function Order(id, order_from, doi, status, an, dbid, title, requestip, create_time) {
        this.id = id;
        this.order_from = order_from;
        this.doi = doi;
        this.status = status;
        this.an = an;
        this.dbid = dbid;
        this.title = title;
        this.requestip = requestip;
        this.create_time = create_time;
    }
    return Order;
}());
exports.Order = Order;
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
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on('connection', function (websocket) {
    websocket.on('message', function (message) {
        //console.log('接收到消息:'+message)
        var messageObj = JSON.parse(message);
        subscription.set(websocket, messageObj.token); //原来的所有商品id加上现在的商品的id
    });
    //clients.push(websocket);
});
//定时向客户端推送消息
setInterval(function () {
    var orders = [];
    //循环所有的客户端
    if (subscription) {
        subscription.forEach(function (token, ws) {
            //循环集合时有两个参数第一个参数为value 第二个参数为key
            if (ws.readyState == 1) {
                //let token='';
                //token=subscription.get(ws);
                request({
                    url: 'http://localhost/after/jsqb/jsqbapi/public/api/v1/order/new',
                    headers: {
                        'token': token ? token : ''
                    }
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if (JSON.parse(body).data.data) {
                            orders = JSON.parse(body).data.data;
                        }
                        console.log(orders);
                        ws.send(JSON.stringify(orders));
                    }
                });
            }
            else {
                subscription.delete(ws);
            }
        });
    }
}, 2000);
