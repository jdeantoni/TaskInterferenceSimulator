import "../node_modules/js-simulator/src/jssim.js"

class Task extends jssim.SimEvent {
    constructor(uid, priority, sched, seg){
        super(priority)
        this.id=uid
        this.state = "waitingAction"
        this.segment = seg
        this.currentAction = 0
        this.scheduler = sched
        this.interferenceDuration = 0
        this.startWaitingTime = -1
        this.taskWidth = 0;
        
        //initDivElements
        var table = document.getElementById("mainTable")
        const taskView = table.insertRow()
        taskView.className = "taskView";
        taskView.id=this.guid().toString()+"view"

        const taskStaticView = taskView.insertCell();
        taskStaticView.id=this.guid().toString()+"staticView"
        // taskStaticView.className="staticView"


        const taskSimulationView = taskView.insertCell();
        taskSimulationView.id=this.guid().toString()+"simulationView"
        taskSimulationView.className="simulationView"

        //create the div elements
        this.taskDiv = this.createTask(uid, seg, true)
        // add the newly created element and its content into the DOM
        taskStaticView.appendChild(this.taskDiv);
    }

    createTask(uid, seg, withTitle = false) {
        this.taskWidth = 0
        // create a new div element
        const task = document.createElement("div");
        task.className = "task";
        if (withTitle){
            task.innerHTML = uid.toString()
        }
        
        // and give it some content
        
        for (var i in seg) {
            var type=seg[i][0];
            var duration = seg[i][1];
            const action = document.createElement("div");
            if (type === "access"){
                const accessInterference = document.createElement("div");
                accessInterference.className="interferenceDuration"
                accessInterference.style.width = "0px";
                action.appendChild(accessInterference)   
                const accessInit = document.createElement("div");
                accessInit.className="initialDuration"
                accessInit.style.width = (duration * 10).toString() + "px";
                action.appendChild(accessInit) 
            }
            action.className = type;
            action.style.width = (duration * 10).toString() + "px";
            this.taskWidth = this.taskWidth + (duration * 10);
            task.appendChild(action);
        }

        task.style.width = (this.taskWidth * 1.1).toString() + "px";
        return task
    }

    TaskStates = ["waitingAction", "running", "waitingResource", "accessingResource", "dead"]


    react(deltaTime){
        var nextSched = 0
        var messages = this.readInBox();
        if(this.state == "waitingAction"){
            if(this.currentAction == 0){
                //create the div elements
                this.taskDiv = this.createTask(this.guid(), this.segment)
                // add the newly created element and its content into the DOM
                var simView = document.getElementById(this.guid().toString()+"simulationView")
                simView.style.width = (this.time*10).toString()+"px"
                simView.appendChild(this.taskDiv);
            }


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
            if(this.startWaitingTime == -1){
                this.startWaitingTime = this.time
            }
            this.interferenceDuration = this.time - this.startWaitingTime
            var accessDiv = this.taskDiv.childNodes[this.currentAction]
            var interferDiv = accessDiv.childNodes[0]
            this.taskDiv.style.width = (this.taskWidth + this.interferenceDuration*10).toString()+"px"
            accessDiv.style.width = (this.segment[this.currentAction][1]*10 + this.interferenceDuration*10).toString()+"px" 
            interferDiv.style.width = (this.interferenceDuration*10).toString()+"px"
            interferDiv.innerHTML = '<h2 style="position:absolute; ">'+(this.interferenceDuration*1).toString()+"</h2>"
            //'<h2 style="margin-top: 26px;margin-bottom: 0px;height: 30px;">'
            //do not wake up if no messages or KO
            nextSched = -1
            for(var i = 0; i < messages.length; ++i){
                var msg = messages[i];
                var content = msg.content; // for example the "Hello" text from the sendMsg code above
                if (content == "OK"){
                    this.state = "accessingResource"
                    nextSched = this.segment[this.currentAction][1]
                }
                else if (content == "KO"){
                    // this.sendMsg( resource.guid(), {
                    //     content: "get",
                    //     sender:this.guid()
                    // });

                }
            }
        }
        else if(this.state == "accessingResource"){
            this.startWaitingTime = -1
            this.taskWidth = parseInt(this.taskDiv.style.width)
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
        var nextSched = this.react(deltaTime)
        console.log("@"+this.time+" task "+this.guid()+" is "+this.state)
        if (nextSched >= 0){
            this.scheduler.scheduleOnceIn(this,nextSched) 
        }
    }

}


export {Task};