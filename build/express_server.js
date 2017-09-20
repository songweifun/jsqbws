"use strict";
/**
 * Created by daivd on 2017/9/3.
 */
var express = require('express');
var path = require('path'); //express框架的一部分
var ws_1 = require("ws");
//这个要放到最上面
var Product = (function () {
    function Product(id, title, price, rating, desc, categroies) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categroies = categroies;
    }
    return Product;
}());
exports.Product = Product;
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
var products = [
    new Product(1, '第一个产品', 2.99, 3.5, '这是第一个产品', ['电子产品', '数码3C']),
    new Product(2, '第二个产品', 1.99, 2.5, '这是第一个产品', ['电子产品', '数码3C']),
    new Product(3, '第三个产品', 1.99, 3.5, '这是第一个产品', ['硬件设备', '数码3C']),
    new Product(4, '第四个产品', 1.99, 4.5, '这是第一个产品', ['电子产品', '数码3C']),
    new Product(5, '第五个产品', 1.99, 3.5, '这是第一个产品', ['电子产品', '数码3C']),
    new Product(6, '第六个产品', 1.99, 1.5, '这是第一个产品', ['电子产品', '数码3C']),
];
var comments = [
    new Comment(1, 1, '2017-08-20 11:38:56', '范松伟', 3, '东西很好'),
    new Comment(1, 1, '2017-08-21 15:38:56', '范松伟', 3, '差劲'),
    new Comment(1, 1, '2017-08-21 11:38:56', '范松伟', 3, '不孬'),
    new Comment(1, 2, '2017-08-23 11:38:56', '范松伟', 3, '很好'),
];
var app = express();
// app.get('/',(req,res)=>{
//     res.send('Hello Express');
// });
app.use('/', express.static(path.join(__dirname, '..', 'client')));
app.get('/api/products', function (req, res) {
    var reslut = products;
    var params = req.query;
    if (params.title) {
        reslut = reslut.filter(function (product) { return product.title.indexOf(params.title) !== -1; });
    }
    if (reslut.length > 0 && params.price) {
        reslut = reslut.filter(function (product) { return product.price <= parseInt(params.price); });
    }
    if (params.category != "-1" && params.category) {
        reslut = reslut.filter(function (product) { return product.categroies.indexOf(params.category) !== -1; });
    }
    res.json(reslut);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(8000, 'localhost', function () {
    console.log("服务器已启动，地址是:http://localhost:8000");
});
var subscription = new Map(); //定义一个集合 key为客户端websocket value是关注的所有商品的数组
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on('connection', function (websocket) {
    //websocket.send("这个消息是服务器主动推送的!");
    //处理客户端发送的消息打印到控制台
    websocket.on('message', function (message) {
        //console.log('接收到消息:'+message)
        var messageObj = JSON.parse(message + '');
        var productIds = subscription.get(websocket) || []; //如果没取到复制为[]
        subscription.set(websocket, productIds.concat([messageObj.productId])); //原来的所有商品id加上现在的商品的id
    });
});
var currentBids = new Map(); //key为商品的id,值为商品最新的价格
//定时向客户端推送消息
setInterval(function () {
    //判断服务器上是否有连接着的客户端
    // if(wsServer.clients){
    //     //向所有的客户端广播消息
    //     wsServer.clients.forEach((client)=>{
    //         client.send("这是定时推送的消息")
    //     })
    //
    // }
    //为所有商生成一个价格
    products.forEach(function (product) {
        var currentBid = currentBids.get(product.id) || product.price;
        var newBid = currentBid + Math.random() * 5;
        currentBids.set(product.id, newBid); //填入最新的出价
    });
    //循环所有的客户端关注的所有商品
    subscription.forEach(function (productIds, ws) {
        //循环集合时有两个参数第一个参数为value 第二个参数为key
        if (ws.readyState == 1) {
            //返回一个数组数组的每一个元素是一个对象有两个元素 一个是{productId,bid}另一个是最新出价
            var newBids = productIds.map(function (pid) { return ({ productId: pid, bid: currentBids.get(pid) }); });
            ws.send(JSON.stringify(newBids)); //把这个数组推送给每一个客户端
            console.log(JSON.stringify(newBids));
        }
        else {
            subscription.delete(ws);
        }
    });
}, 2000);
