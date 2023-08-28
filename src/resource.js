import "../node_modules/js-simulator/src/jssim.js"


class Resource extends jssim.SimEvent {
    constructor(uid, priority, sched){
        super(priority)
        this.id=uid
        this.state = "idle"
        this.scheduler = sched
        this.currentUser = null
        this.waitingUsers = []
    }

    //for record
    resourceStates = ["idle", "inUse"]
    resourceEvents = ["get", "free"]

    setAllTasksInfo(allTasksInfo){
        this.allTasksInfo = allTasksInfo
    }

    getUser(id){
        for (let i = 0; i < this.allTasksInfo.length; i++){
            if (this.allTasksInfo[i].guid() == id){
                return this.allTasksInfo[i]
            }
        }
        console.error("user not found: "+id+ "in "+this.allTasksInfo)
    }

    //FSM 
    react(content, sender_id){
        if (this.state == "idle"){
            if(content == "get"){
                this.state = "inUse"
                this.sendMsg(sender_id,{
                    content: "OK",
                    sender:this.guid()
                })
                this.currentUser = this.getUser(sender_id)
            }
            else if(content == "free"){
                console.error("cannot free an idle resource")
                this.scheduler.reset()
            }
        }
        else if (this.state == "inUse"){
            if(content == "get"){
                this.sendMsg(sender_id,{
                    content: "KO",
                    sender:this.guid()
                })
                this.waitingUsers.push(this.getUser(sender_id))
            }
            else if(content == "free"){
                this.state = "idle"
                if(this.waitingUsers.length > 0){ //optimize and avoid to ask every 1
                    var nextUser = this.waitingUsers.pop()
                    this.sendMsg(nextUser.guid(),{
                        content: "OK",
                        sender:this.guid()
                    })
                    console.log("@"+this.time+" resource "+this.guid()+" is "+this.state)
                    this.state = "inUse"
                    this.scheduler.scheduleOnceIn(nextUser,0)
                }
            }
        }
    }

    //timed update
    update(deltaTime){
        // console.log('resource [' + this.id + '] is fired at time ' + this.time+ " deltaTime= "+deltaTime);
        var messages = this.readInBox();
            for(var i = 0; i < messages.length; ++i){
                var msg = messages[i];
                var sender_id = msg.sender;
                var recipient_id = msg.recipient; // should equal to this.guid()
                var time = msg.time;
                var rank = msg.rank; // the messages[0] contains the highest ranked message and last messages contains lowest ranked
                var content = msg.content; // for example the "Hello" text from the sendMsg code above
                this.react(content, sender_id)
                console.log("@"+this.time+" resource "+this.guid()+" is "+this.state)
        }

    }

}

export {Resource};