var jssim = require('js-simulator');


class Resource extends jssim.SimEvent {
    constructor(uid, priority, sched){
        super(priority)
        this.id=uid
        this.state = "idle"
        this.scheduler = sched
    }

    //for record
    resourceStates = ["idle", "inUse"]
    resourceEvents = ["get", "free"]

    //todo add current user id


    //FSM 
    react(content, sender_id){
        if (this.state == "idle"){
            if(content == "get"){
                this.state = "inUse"
                this.sendMsg(sender_id,{
                    content: "OK",
                    sender:this.guid()
                })
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
            }
            else if(content == "free"){
                this.state = "idle"
                this.sendMsg(sender_id,{
                    content: "OK",
                    sender:this.guid()
                })
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



class Task extends jssim.SimEvent {
    constructor(uid, priority, sched, seg){
        super(priority)
        this.id=uid
        this.state = "waitingAction"
        this.segment = seg
        this.currentAction = 0
        this.scheduler = sched



//        this.initializeDOM(uid, seg);

    }

    TaskStates = ["waitingAction", "running", "waitingResource", "accessingResource", "dead"]


    initializeDOM(uid, seg) {
        // create a new div element
        const task = document.createElement("div");
        task.id = "Task";
        const title = document.createElement("h1");
        title.appendChild(document.createTextNode(uid.toString()));
        task.appendChild(title);
        // and give it some content
        var taskWidth = 0;
        for (var i in seg) {
            const action = document.createElement("div");
            action.id = seg[i][0];
            action.style.width = (seg[i][1] * 10).toString() + "px";
            taskWidth = taskWidth + (seg[i][1] * 10);
            task.appendChild(action);
        }

        task.style.width = (taskWidth * 1.1).toString() + "px";

        // add the newly created element and its content into the DOM
        document.body.appendChild(task);
    }

    react(){
        var nextSched = 0
        var messages = this.readInBox();
        if(this.state == "waitingAction"){
            if (this.segment[this.currentAction][0] == "execute"){
                this.state = "executing"
                nextSched = this.segment[this.currentAction][1]
            }
            else if (this.segment[this.currentAction][0] == "access"){
                this.state = "waitingResource"
                var resource = this.segment[this.currentAction][2]
                this.sendMsg( resource.guid(), {
                    content: "get",
                    sender:this.guid()
                });
                this.scheduler.scheduleOnceIn(resource,0)
            }
        }
        else if(this.state == "executing"){
            this.currentAction = (this.currentAction+1)%this.segment.length
            this.state = "waitingAction"
        }
        else if(this.state == "waitingResource"){
            //wait at least one here
            nextSched = 1
            for(var i = 0; i < messages.length; ++i){
                var msg = messages[i];
                var content = msg.content; // for example the "Hello" text from the sendMsg code above
                if (content == "OK"){
                    this.state = "accessingResource"
                    nextSched = this.segment[this.currentAction][1]
                }
                else if (content == "KO"){
                    var resource = this.segment[this.currentAction][2]
                    this.sendMsg( resource, {
                        content: "get",
                        sender:this.guid()
                    });
                    this.scheduler.scheduleOnceIn(resource,0)
                }
            }
        }
        else if(this.state == "accessingResource"){
            var resource = this.segment[this.currentAction][2]
            this.sendMsg(resource.guid(), {
                content: "free",
                sender:this.guid()
            });
            this.scheduler.scheduleOnceIn(resource,0)
            this.currentAction = (this.currentAction+1)%this.segment.length
            this.state = "waitingAction"
        }

    return nextSched
    }


    update(deltaTime){
        // console.log('task ' + this.id + '[' + this.rank + ' ] @' + this.time+ " deltaTime= "+deltaTime);
        var nextSched = this.react()
        console.log("@"+this.time+" task "+this.guid()+" is "+this.state)
        this.scheduler.scheduleOnceIn(this,nextSched) 
    }

}

function myFunction() {

    var scheduler = new jssim.Scheduler();
    scheduler.reset();
    var r1 = new Resource(69,3, scheduler)

    var t1 = new Task(42, 2, scheduler, [["access", 5, r1], ["execute", 10], ["access", 5, r1]])
    var t2 = new Task(88, 2, scheduler, [["access", 5, r1], ["execute", 10], ["access", 5, r1]])
    
    scheduler.schedule(t1, 0);
    scheduler.schedule(t2, 0);
    scheduler.scheduleRepeatingAt(r1, 0, 1);

    while(scheduler.current_time < 50) {
        scheduler.update();
    }
}

myFunction()