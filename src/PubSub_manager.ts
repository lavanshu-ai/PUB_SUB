import {createClient,RedisClientType} from "redis"
import { connectionMap } from ".";
export class PubSubManager {
  private static instance :PubSubManager;
  private SubClient:RedisClientType;
  private PubClient:RedisClientType;
  private Subscriptions:Map<string,string[]>;

  private  constructor(){
    this.SubClient=createClient();
    this.PubClient=createClient();
   
    this.Subscriptions=new Map();
    this.init();
  }
  private async init (){
   await this.PubClient.connect();
   await this.SubClient.connect();
  }
  static getInstance(){
    if(!PubSubManager.instance){
      PubSubManager.instance=new PubSubManager();
    }
    return PubSubManager.instance
  }
  userSubscribe(userId:string,stock:string){
    if(!this.Subscriptions.has(stock)){
      this.Subscriptions.set(stock,[])
    }
    const users = this.Subscriptions.get(stock)!;//non-null assertion operator.
      if (!users.includes(userId)) {
       users.push(userId);
   }

    if(this.Subscriptions.get(stock)?.length===1){
      this.SubClient.subscribe(stock,(message)=>{
         this.handleMessage(stock,message);
      });
     console.log(`Subscribed to redis channel :${stock}`)
    }
  }
  userUnsubscribe(userId:string,stock:string){
    if(!this.Subscriptions.has(stock)){
      console.log(`no active subscriber`)
    }
    this.Subscriptions.set(stock,this.Subscriptions.get(stock)?.filter((user:string)=>user!=userId) || [])
    if(this.Subscriptions.get(stock)?.length===0){
      this.SubClient.unsubscribe(stock);
     console.log(`Unsubscribed to redis channel :${stock}`)
    }
  }
  userPublish(stock:string,payload:string){
    return this.PubClient.publish(stock,payload)
  }
  
  handleMessage(stock:string,message:string){
    console.log(`Message recieved on channel : ${stock}:${message}`)
    this.Subscriptions.get(stock)?.forEach((id)=>{
      const ws=connectionMap.get(id)
      if(ws && ws?.readyState===WebSocket.OPEN){
      console.log(`${message}:${stock}`)
        ws.send(JSON.stringify({
          type: "STOCK_UPDATE",
          stock,
          data: message
        }))
      }

    })
  }
  public async disconnect() {
        await this.SubClient.quit();
    }
}
//***note */
//redisCliemt .subscribe Registers a listener(handel message), it does NOT publish anything.
// Redis
//  └── sees a publish on "AAPL"
//       └── sends message to all subscribers
//              └── your Node app receives it
//                     └── callback fires
//                             └── handleMessage("AAPL", "price updated")