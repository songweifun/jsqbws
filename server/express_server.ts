/**
 * Created by daivd on 2017/9/3.
 */
import * as express from 'express';
import * as path from 'path';//express框架的一部分
import {Server} from "ws";
//这个要放到最上面
export class Product{
    constructor(
        public id:number,
        public title:string,
        public price:number,
        public rating:number,
        public desc:string,
        public categroies:Array<string>
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


const products:Array<Product>=[
    new Product(1,'第一个产品',2.99,3.5,'这是第一个产品',['电子产品','数码3C']),
    new Product(2,'第二个产品',1.99,2.5,'这是第一个产品',['电子产品','数码3C']),
    new Product(3,'第三个产品',1.99,3.5,'这是第一个产品',['硬件设备','数码3C']),
    new Product(4,'第四个产品',1.99,4.5,'这是第一个产品',['电子产品','数码3C']),
    new Product(5,'第五个产品',1.99,3.5,'这是第一个产品',['电子产品','数码3C']),
    new Product(6,'第六个产品',1.99,1.5,'这是第一个产品',['电子产品','数码3C']),

];

const comments:Array<Comment>=[
    new Comment(1,1,'2017-08-20 11:38:56','范松伟',3,'东西很好'),
    new Comment(1,1,'2017-08-21 15:38:56','范松伟',3,'差劲'),
    new Comment(1,1,'2017-08-21 11:38:56','范松伟',3,'不孬'),
    new Comment(1,2,'2017-08-23 11:38:56','范松伟',3,'很好'),

];


const app=express();
// app.get('/',(req,res)=>{
//     res.send('Hello Express');
// });
app.use('/',express.static(path.join(__dirname,'..','client')));
app.get('/api/products',(req,res)=>{
    let reslut=products;
    let params=req.query;
    if(params.title){
        reslut=reslut.filter(product=>product.title.indexOf(params.title)!==-1);
    }

    if(reslut.length>0 && params.price){
        reslut=reslut.filter(product=>product.price<=parseInt(params.price));
    }

    if(params.category!="-1" && params.category){
        reslut=reslut.filter(product=>product.categroies.indexOf(params.category)!==-1);
    }
    res.json(reslut);
});

app.get('/api/product/:id',(req,res)=>{
    res.json(products.find((product)=>product.id==req.params.id));
});


app.get('/api/product/:id/comments',(req,res)=>{
    res.json(comments.filter((comment:Comment)=>comment.productId==req.params.id));
});



const  server=app.listen(8000,'localhost',()=>{
    console.log("服务器已启动，地址是:http://localhost:8000")
})


const subscription=new Map<any,number[]>();//定义一个集合 key为客户端websocket value是关注的所有商品的数组


const wsServer=new Server({port:8085});
wsServer.on('connection',websocket=>{
    //websocket.send("这个消息是服务器主动推送的!");
    //处理客户端发送的消息打印到控制台
    websocket.on('message',message=>{
        //console.log('接收到消息:'+message)
        let messageObj=JSON.parse(message+'');
        let productIds=subscription.get(websocket)||[];//如果没取到复制为[]
        subscription.set(websocket,[...productIds,messageObj.productId])//原来的所有商品id加上现在的商品的id

    })
})

const currentBids=new Map<number,number>();//key为商品的id,值为商品最新的价格

//定时向客户端推送消息
setInterval(()=>{
    //判断服务器上是否有连接着的客户端
    // if(wsServer.clients){
    //     //向所有的客户端广播消息
    //     wsServer.clients.forEach((client)=>{
    //         client.send("这是定时推送的消息")
    //     })
    //
    // }
    //为所有商生成一个价格
    products.forEach(product=>{
        let currentBid=currentBids.get(product.id)||product.price
        let newBid=currentBid+Math.random()*5;
        currentBids.set(product.id,newBid) //填入最新的出价
    })

    //循环所有的客户端关注的所有商品
    subscription.forEach((productIds:number[],ws)=>{
        //循环集合时有两个参数第一个参数为value 第二个参数为key
        if(ws.readyState==1){  //说明客户还在 防止奔溃

            //返回一个数组数组的每一个元素是一个对象有两个元素 一个是{productId,bid}另一个是最新出价
            let newBids=productIds.map(pid=>({productId:pid,bid:currentBids.get(pid)}));
            ws.send(JSON.stringify(newBids));//把这个数组推送给每一个客户端
            console.log(JSON.stringify(newBids))

        }else{
            subscription.delete(ws)
        }


    })
},2000)


