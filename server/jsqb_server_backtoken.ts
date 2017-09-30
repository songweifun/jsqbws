
/**
 * Created by daivd on 2017/9/3.
 */
import * as express from 'express';
import * as path from 'path';//express框架的一部分
import {Server} from "ws";


import * as request  from 'request';







//这个要放到最上面
export class Order{
    constructor(
        public id:number,
        public order_from:number,
        public doi:string,
        public status:number,
        public an:string,
        public dbid:string,
        public title:string,
        public requestip:string,
        public create_time:string
    ){

    }
}

export class Comment{
    constructor(
        public id:number,
        public productId:number,
        public timestamp:string,
        public user:string,
        public rating:number,
        public content:string,
    ){

    }
}



// const comments:Array<Comment>=[
//     new Comment(1,1,'2017-08-20 11:38:56','范松伟',3,'东西很好'),
//     new Comment(1,1,'2017-08-21 15:38:56','范松伟',3,'差劲'),
//     new Comment(1,1,'2017-08-21 11:38:56','范松伟',3,'不孬'),
//     new Comment(1,2,'2017-08-23 11:38:56','范松伟',3,'很好'),
//
// ];


// const app=express();
// // app.get('/',(req,res)=>{
// //     res.send('Hello Express');
// // });
// app.use('/',express.static(path.join(__dirname,'..','client')));
// app.get('/api/products',(req,res)=>{
//     let reslut=products;
//     let params=req.query;
//     if(params.title){
//         reslut=reslut.filter(product=>product.title.indexOf(params.title)!==-1);
//     }
//
//     if(reslut.length>0 && params.price){
//         reslut=reslut.filter(product=>product.price<=parseInt(params.price));
//     }
//
//     if(params.category!="-1" && params.category){
//         reslut=reslut.filter(product=>product.categroies.indexOf(params.category)!==-1);
//     }
//     res.json(reslut);
// });
//
// app.get('/api/product/:id',(req,res)=>{
//     res.json(products.find((product)=>product.id==req.params.id));
// });
//
//
// app.get('/api/product/:id/comments',(req,res)=>{
//     res.json(comments.filter((comment:Comment)=>comment.productId==req.params.id));
// });
//
//
//
// const  server=app.listen(8000,'localhost',()=>{
//     console.log("服务器已启动，地址是:http://localhost:8000")
// })


const subscription=new Map<any,string>();//定义一个集合 key为客户端websocket value是关注的所有商品的数组
//const clients:Array<any>=[];


const wsServer=new Server({port:8085});
wsServer.on('connection',websocket=>{
    //websocket.send("这个消息是服务器主动推送的!");
    //处理客户端发送的消息打印到控制台
    // websocket.on('message',message=>{
    //     //console.log('接收到消息:'+message)
    //     let messageObj=JSON.parse(message+'');
    //     let productIds=subscription.get(websocket)||[];//如果没取到复制为[]
    //     subscription.set(websocket,[...productIds,messageObj.productId])//原来的所有商品id加上现在的商品的id
    //
    // })
    websocket.on('message',message=>{
        //console.log('接收到消息:'+message)
        let messageObj=JSON.parse(message);
        subscription.set(websocket,messageObj.token)//原来的所有商品id加上现在的商品的id


    })
    //clients.push(websocket);
})

//const currentBids=new Map<number,number>();//key为商品的id,值为商品最新的价格

//定时向客户端推送消息
// setInterval(()=>{
//
//     request('http://localhost/after/jsqb/jsqbapi/public/api/v1/order/new', function (error, response, body) {
//         const orders:Array<Order>=[];
//
//         // if (!error && response.statusCode == 200) {
//         //     console.log(body) // 打印google首页
//         if(JSON.parse(body).data.data){
//             orders=JSON.parse(body).data.data;
//         }
//
//
//         for (var k = 0, length = clients.length; k < length; k++) {
//             if(clients[k] && clients[k].readyState==1){
//                 console.log(JSON.stringify(orders))
//                 clients[k].send(JSON.stringify(orders));
//
//
//             }else{
//                 clients.splice(k,1)
//             }
//
//         }
//
//
//
//     })

    //判断服务器上是否有连接着的客户端
    // if(wsServer.clients){
    //     //向所有的客户端广播消息
    //     wsServer.clients.forEach((client)=>{
    //         client.send("这是定时推送的消息")
    //     })
    //
    // }
    //为所有商生成一个价格
    // products.forEach(product=>{
    //     let currentBid=currentBids.get(product.id)||product.price
    //     let newBid=currentBid+Math.random()*5;
    //     currentBids.set(product.id,newBid) //填入最新的出价
    // })

    //循环所有的客户端关注的所有商品
    // clients.forEach((ws)=>{
    //     //循环集合时有两个参数第一个参数为value 第二个参数为key
    //     if(ws.readyState==1){  //说明客户还在 防止奔溃
    //
    //         //返回一个数组数组的每一个元素是一个对象有两个元素 一个是{productId,bid}另一个是最新出价
    //         //let newBids=productIds.map(pid=>({productId:pid,bid:currentBids.get(pid)}));
    //         ws.send(JSON.stringify(orders));//把这个数组推送给每一个客户端
    //         //console.log(JSON.stringify(newBids))
    //
    //     }else{
    //         clients.(ws)
    //     }
    //
    //
    // })


// },3000)

//定时向客户端推送消息
setInterval(()=>{
    const orders:Array<Order>=[];

    //循环所有的客户端
    if(subscription) {

        subscription.forEach((token: string, ws) => {
            //循环集合时有两个参数第一个参数为value 第二个参数为key
            if (ws.readyState == 1) {  //说明客户还在 防止奔溃
                //let token='';
                //token=subscription.get(ws);

                request({
                    url: 'http://localhost/after/jsqb/jsqbapi/public/api/v1/order/new',
                    headers: {
                        'token': token?token:''
                    }
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        if (JSON.parse(body).data.data) {
                            orders = JSON.parse(body).data.data;
                        }
                        console.log(orders)
                        ws.send(JSON.stringify(orders));

                    }



                })

            } else {
                subscription.delete(ws)
            }


        })
    }
},2000)






