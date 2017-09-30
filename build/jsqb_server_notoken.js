"use strict";
/**
 * Created by daivd on 2017/9/3.
 */
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
var clients = [];
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on('connection', function (websocket) {
    clients.push(websocket);
});
// const orders:Array<Order>=[];
//定时向客户端推送消息
// setInterval(()=>{
//
//
//     //console.log(clients)
//
//
//
//
//
//
//
//
//                 request({
//                     url: 'http://localhost/after/jsqb/jsqbapi/public/api/v1/order/new'
//
//                 }, function (error, response, body) {
//                     if (!error && response.statusCode == 200) {
//
//                         if(clients.length>0) {
//                             for(let i=0;i<clients.length;i++){
//                                 if(clients[i].readyState==1){
//                                     clients[i].send(JSON.stringify(JSON.parse(body).data.data));
//                                     console.log(JSON.stringify(JSON.parse(body).data.data));
//                                 }else{
//
//                                 }
//                             }
//                         }
//
//
//                     }
//
//
//
//                 })
//
//
//
// },2000)
//定时向客户端推送消息
setInterval(function () {
    request('http://localhost/after/jsqb/jsqbapi/public/api/v1/order/new', function (error, response, body) {
        var orders = [];
        if (JSON.parse(body).data.data) {
            orders = JSON.parse(body).data.data;
        }
        for (var k = 0, length = clients.length; k < length; k++) {
            if (clients[k] && clients[k].readyState == 1) {
                console.log(JSON.stringify(orders));
                clients[k].send(JSON.stringify(orders));
            }
            else {
                clients.splice(k, 1);
            }
        }
    });
});
