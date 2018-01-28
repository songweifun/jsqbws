/**
 * Created by daivd on 2018/1/28.
 */


/**
 * Created by daivd on 2017/9/3.
 */

import {Server} from "ws";
import * as request  from 'request';







//这个要放到最上面
export class Task{
    constructor(
        public id:number,
        public number:number,
        public title:string,
        public total_count:number,
        public complete_count:number,
        public percent:string,
        public file_path:string,
        public status_code:string,
        public flag:number,
        public remark:string,
        public database_id:number,
        public create_time:string,
        public update_time:string
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


const wsServer=new Server({port:8086});
wsServer.on('connection',websocket=>{

    websocket.on('message',message=>{

        //console.log('接收到消息:'+message)
        let messageObj=JSON.parse(message+'');
        subscription.set(websocket,messageObj.restful_url)//原来的所有商品id加上现在的商品的id
        console.log()


    })
    //clients.push(websocket);
})


//定时向客户端推送消息
setInterval(()=>{
    const tasks:Array<Task>=[];

    //循环所有的客户端
    if(subscription) {

        subscription.forEach((restful_url: string, ws) => {
            //循环集合时有两个参数第一个参数为value 第二个参数为key
            if (ws.readyState==1) {  //说明客户还在 防止奔溃
                //let token='';
                //token=subscription.get(ws);
                console.log(restful_url)

                request({
                    url: restful_url,
                    // headers: {
                    //     'uid': token?token:''
                    // }
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        // if (JSON.parse(body).data.data) {
                        //     tasks = JSON.parse(body).data.data;
                        // }
                        //console.log(body)
                        tasks=body

                        if (ws.readyState==1){
                            ws.send(tasks);
                        }else{
                            subscription.delete(ws)
                        }

                    }



                })

            } else {
                //subscription.delete(ws)
                //delete subscription[ws]
                subscription.delete(ws)
            }


        })
    }
},500)







