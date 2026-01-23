import {createClient,RedisClientType} from "redis"

export class PubSubManager {
  private static instance :PubSubManager;
  private redisClient:RedisClientType;
  private Subscriptions:Map<string,string[]>;

  private constructor(){
    this.redisClient=createClient();
    this.redisClient.connect();
    this.Subscriptions=new Map();
  }
  static getInstance(){
    if(!PubSubManager.instance){
      PubSubManager.instance=new PubSubManager();
    }
    return PubSubManager.instance
  }
  addUserToStock(userId:string,stock:string){
    if(!this.Subscriptions.has(stock)){
      this.Subscriptions.set(stock,[])
    }
    this.Subscriptions.get(stock)?.push(userId)
    if(this.Subscriptions.get(stock)?.length===1){
      this.redisClient.subscribe(stock,(message)=>{
         this.handleMessage(stock,message);
      });
     console.log(`Subscribed to redis channel :${stock}`)
    }
  }
  removeUserFromStock(userId:string,stock:string){
    if(!this.Subscriptions.has(stock)){
      console.log(`no active subscriber`)
    }
    this.Subscriptions.set(stock,this.Subscriptions.get(stock)?.filter((user:string)=>user!=userId) || [])
    if(this.Subscriptions.get(stock)?.length===0){
      this.redisClient.unsubscribe(stock);
     console.log(`Unsubscribed to redis channel :${stock}`)
    }
  }
  handleMessage(stock:string,message:string){
    console.log(`Message recieved on channel : ${stock}:${message}`)
    this.Subscriptions.get(stock)?.forEach((sub)=>{
      console.log(`seding messabe to user :${sub}`)

    })
  }
  public async disconnect() {
        await this.redisClient.quit();
    }
}