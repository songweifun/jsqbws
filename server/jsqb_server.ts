
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


const wsServer=new Server({port:8085});
wsServer.on('connection',websocket=>{

    websocket.on('message',message=>{
        //console.log('接收到消息:'+message)
        let messageObj=JSON.parse(message);
        subscription.set(websocket,messageObj.token)//原来的所有商品id加上现在的商品的id


    })
    //clients.push(websocket);
})


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
                    url: 'http://101.201.103.106/jsqbapi/public/api/v1/order/new',
                    headers: {
                        'token': token?token:'123'
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






