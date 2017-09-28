
/**
 * Created by daivd on 2017/9/3.
 */
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






const subscription=new Map<any,string>();//定义一个集合 key为客户端websocket value是关注的所有商品的数组
const clients:Array<any>=[];


const wsServer=new Server({port:8085});
wsServer.on('connection',websocket=>{
    clients.push(websocket);
})


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
setInterval(()=>{

    request('http://localhost/after/jsqb/jsqbapi/public/api/v1/order/new', function (error, response, body) {
        const orders:Array<Order>=[];

        if(JSON.parse(body).data.data){
            orders=JSON.parse(body).data.data;
        }


        for (let k = 0, length = clients.length; k < length; k++) {
            if(clients[k] && clients[k].readyState==1){
                console.log(JSON.stringify(orders))
                clients[k].send(JSON.stringify(orders));


            }else{
                clients.splice(k,1)
            }

        }



    })






