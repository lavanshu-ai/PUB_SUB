import {WebSocket,WebSocketServer} from "ws";
import { PubSubManager } from "./PubSub_manager";
const wss=new  WebSocketServer({port:8080});

export const connectionMap=new Map<string,WebSocket>();
wss.on("connection",function connection (ws){
  ws.on("error",console.error)
  
  ws.on("message",function message(data){
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      ws.send(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }
    switch (msg.type) {
      case "AUTH":{
        connectionMap.set(msg.userId,ws);
        console.log(connectionMap.keys)
        ws.send("user added")
        break;
      }
      case "SUBSCRIBE":{
        PubSubManager.getInstance().userSubscribe(msg.userId,msg.stock);
        break;
      }
      case "UNSUBSCRIBE":{
        PubSubManager.getInstance().userUnsubscribe(msg.userId,msg.stock)
        break;
      }
      case "PUBLISH":{
        console.log("publishing...")
        PubSubManager.getInstance().userPublish(msg.stock,msg.payload)
        break;
      }
      
       default: {
                 console.warn("Unknown message type:", msg.type);
       }
    }
  })
  ws.send("ping")
})