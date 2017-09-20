/**
 * Created by daivd on 2017/9/3.
 */
import * as http from "http";
const  server=http.createServer((request,respose)=>{
    respose.end("Hello Node !");
})
server.listen(8000);
