import "../node_modules/js-simulator/src/jssim.js"

class Task extends jssim.SimEvent {
    constructor(uid, priority, sim, seg){
        super(priority)
        this.id=uid
        this.state = "waitingAction"
        this.currentAction = 0
        this.sim=sim
        this.scheduler = sim.scheduler
        this.interferenceDuration = 0
        this.iterationInteferenceDuration = 0
        this.startWaitingTime = -1
        this.taskWidth = 0;
        this.nbIteration = 0
        
        this.OriginalSeg=seg
        //split access segments
        var res = []
        for (var i = 0 ; i < seg.length; i++) {
            var type=seg[i][0];
            if (type === "access"){
                console.log("seg:",seg)

                var duration = seg[i][1];
                var resource = seg[i][2];
                for(var n = 0; n < Math.floor(duration/8); n++){ //RSL 100% accessdu au memcpy ?
                    res.push(["access", 5, resource])
                    res.push(["execute", 3])
                }
            }else{
                res.push(seg[i])
            }
        }   
        this.segment = res
        seg= res 

        //initDivElements
        var table = document.getElementById("mainTable")
        const taskView = table.insertRow()
        taskView.className = "taskView";
        taskView.id=this.guid().toString()+"view"

        const taskStaticView = taskView.insertCell();
        taskStaticView.id=this.guid().toString()+"staticView"
        // taskStaticView.className="staticView"
        // const wholeTaskDiv = document.createElement("div");
        // wholeTaskDiv.className = "taskView";

        const taskSimulationView = taskView.insertCell();
        taskSimulationView.id=this.guid().toString()+"simulationView"
        taskSimulationView.className="simulationView"

        //create the div elements
        this.taskWholeView = this.createTask(uid, this.segment, true)
        // add the newly created element and its content into the DOM
        taskStaticView.appendChild(this.taskWholeView);
    }

    createTask(uid, seg, withTitle = false) {
        this.taskWidth = 0
        this.taskDuration = 0
        this.eventQueue = []
        const wholeTask = document.createElement("table");
        wholeTask.className = "simulationTableView";
        wholeTask.id=this.guid().toString()+"simulationTableView"+this.nbIteration.toString()
        const taskWcetRow = wholeTask.insertRow()
        const taskWcetCell = taskWcetRow.insertCell();
        taskWcetCell.className="borderVisible"
        const taskProfilRow = wholeTask.insertRow()
        const taskProfilCell = taskProfilRow.insertCell();
        
   


        // create a new div element
        const taskProfil = document.createElement("div");
        taskProfil.className = "task";
          

        // and give it some content
        
        for (var i in seg) {
            var type=seg[i][0];
            var duration = seg[i][1];
            const action = document.createElement("div");
            if (type === "waitEvent"){
                action.style.width = "20px"; //arbitrarily
                this.taskWidth = this.taskWidth + 20
                action.innerHTML = "<p>"+seg[i][1]+"</p>";
            }else{

                 if (type === "access"){
                        const accessInterference = document.createElement("div");
                        accessInterference.className="interferenceDuration"
                        accessInterference.style.width = "0px";
                        action.appendChild(accessInterference)   
                        const accessInit = document.createElement("div");
                        accessInit.className="initialDuration"
                        accessInit.style.width = Math.floor((duration/10) * this.sim.stepSize).toString() + "px";
                        action.appendChild(accessInit)  
                }

               
                action.style.width = Math.floor(duration * this.sim.stepSize).toString() + "px";
                this.taskDuration = this.taskDuration + Math.floor(duration);
            }
            action.className = type;
            taskProfil.appendChild(action);

        }
        this.taskWidth += this.taskDuration*this.sim.stepSize
        taskProfil.style.width = Math.floor(this.taskWidth).toString() + "px";
        this.taskDiv = taskProfil

        
        taskProfilCell.appendChild(taskProfil)
        

        const taskWcet = document.createElement("div");
        taskWcet.id=this.guid().toString()+"Wcet"+this.nbIteration.toString()
        if (withTitle){
            taskWcet.innerHTML = uid.toString()+" execTime="+(this.taskWidth/this.sim.stepSize).toString()
        }
        
        taskWcet.style.width = Math.floor(this.taskWidth - 2).toString()+"px"
        taskWcetCell.appendChild(taskWcet)


         

        return wholeTask
    }

    //only for record
    TaskStates = ["waitingAction", "running", "waitingResource", "accessingResource", "waitingEvent", "dead"]

    isInQueue(eventName){
        for(var i = 0; i < this.eventQueue.length; ++i){
            if(this.eventQueue[i] == eventName){
                return true
            }
        }
        return false
    }

    removeFromQueue(eventName) {
        var indexOfEvent = this.eventQueue.indexOf(eventName)
        if (indexOfEvent != -1) {
            this.eventQueue.splice(indexOfEvent, 1)
        } else {
            console.error("task: a non popped event cannot be removed")
        }
        return
    }

    react(deltaTime){
        var nextSched = 0
        var messages = this.readInBox();
        for(var i = 0; i < messages.length; ++i){
            if (messages[i].content == "event"){
                this.eventQueue.push(messages[i].eventName)
            }
        }
        
        if(this.state == "waitingAction"){
            if(this.currentAction == 0){
                this.iterationInteferenceDuration = 0
                //create the div elements
                this.nbIteration++
                this.taskWholeView = this.createTask(this.guid(), this.segment)
                // add the newly created element and its content into the DOM
                var simView = document.getElementById(this.guid().toString()+"simulationView")
                simView.style.width = Math.floor(this.time*this.sim.stepSize).toString()+"px"
                simView.appendChild(this.taskWholeView);
                var simTabView = document.getElementById(this.guid().toString()+"simulationTableView"+this.nbIteration.toString())
                simTabView.style.width = Math.floor(this.taskWidth).toString()+"px"
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
            else if (this.segment[this.currentAction][0] == "waitingEvent"){
                var waitedEvent = this.segment[this.currentAction][1]
                if (isInQueue(waitedEvent)){
                    removeFromQueue(waitedEvent)
                    this.currentAction++
                }else{
                    this.state = "waitingEvent"
                }
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
            this.taskWholeView.style.width = Math.floor(this.taskWidth + this.interferenceDuration*this.sim.stepSize).toString()+"px"
            this.taskDiv.style.width = Math.floor(this.taskWidth + this.interferenceDuration*this.sim.stepSize).toString()+"px"
            accessDiv.style.width = Math.floor(this.segment[this.currentAction][1]*this.sim.stepSize + this.interferenceDuration*this.sim.stepSize).toString()+"px" 
            interferDiv.style.width = Math.floor(this.interferenceDuration*this.sim.stepSize).toString()+"px"
            

            if (this.interferenceDuration > 0) {
                this.iterationInteferenceDuration += this.interferenceDuration
                // interferDiv.innerHTML = '<h2 style="position:absolute; font-size:small;">'+(this.interferenceDuration).toString()+"</h2>"
                var wcetDiv = document.getElementById(this.guid().toString()+"Wcet"+this.nbIteration.toString())
                wcetDiv.style.width = Math.floor(this.taskWidth + this.interferenceDuration*this.sim.stepSize - 2).toString()+"px"
                // wcetDiv.innerHTML = "execTime="+((this.taskWidth/this.sim.stepSize)+this.interferenceDuration).toString()
                wcetDiv.innerHTML = "interference="+(this.iterationInteferenceDuration).toString()
            }
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
        else if(this.state == "waitEvent"){
          
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