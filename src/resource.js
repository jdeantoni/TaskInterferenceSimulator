import "../node_modules/js-simulator/src/jssim.js"


class Resource extends jssim.SimEvent {
    constructor(uid, priority, maxUsers, sim){
        super(priority)
        this.id=uid
        this.state = "idle"
        this.maxUsers = maxUsers
        this.sim = sim
        this.scheduler = sim.scheduler
        this.currentUsers = []
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
                if(this.currentUsers.length < this.maxUsers){
                    this.sendMsg(sender_id,{
                        content: "OK",
                        sender:this.guid()
                    })
                    this.currentUsers.push(this.getUser(sender_id))
                }else{
                    this.state = "inUse"
                    this.sendMsg(sender_id,{
                        content: "KO",
                        sender:this.guid()
                    })
                    this.waitingUsers.push(this.getUser(sender_id))
                }
            }
            else if(content == "free"){
                if(this.currentUsers.length > 0){
                    this.freeUser(sender_id)
                    if(this.waitingUsers.length > 0){ //optimize and avoid to ask every 1
                        this.giveAccessToWaitingUser()
                    }   
                }
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
                this.freeUser(sender_id)
                if(this.waitingUsers.length > 0){ //optimize and avoid to ask every 1
                    this.giveAccessToWaitingUser()
                }else{
                    this.state = "idle"
                }
            }
        }
        if (this.currentUsers.length > this.maxUsers){
            console.error("@" + this.time + " resource " + this.guid() + ": too much users")
        }
    }

    giveAccessToWaitingUser() {
        this.waitingUsers = this.waitingUsers.reverse()
        var nextUser = this.waitingUsers.pop()
        this.waitingUsers = this.waitingUsers.reverse()
        this.sendMsg(nextUser.guid(), {
            content: "OK",
            sender: this.guid()
        })
        this.currentUsers.push(nextUser)
        console.log("@" + this.time + " resource " + this.guid() + " is " + this.state +" with "+this.currentUsers.length+" users")
        this.scheduler.scheduleOnceIn(nextUser, 0)
        return nextUser
    }

    freeUser(sender_id) {
        var userToRemove = this.getUser(sender_id)
        var indexOfUser = this.currentUsers.indexOf(userToRemove)
        if (indexOfUser != -1) {
            this.currentUsers.splice(indexOfUser, 1)
        } else {
            console.error("resource: a non accessing user if freeing")
        }
        return
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
                console.log("@"+this.time+" resource "+this.guid()+" is "+this.state+" with "+this.currentUsers.length+" users")
        }

    }

}

export {Resource};