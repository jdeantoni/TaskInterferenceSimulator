import { Task } from "./task.js";
import { Resource } from "./resource.js";

class TaskInterferenceSimulator{

    constructor(){
        this.scheduler = new jssim.Scheduler();
        this.nbAxisParts
        this.stepSize = 5
    }

    createAxisPart(theDiv, time, size){
        const hl = document.createElement("div");
        hl.className="hl"
        hl.style.width=size
        const svl = document.createElement("div");
        svl.className="svl"
        const tm = document.createElement("div");
        tm.className="timeMark"
        tm.innerHTML = (time).toString()

        theDiv.appendChild(hl)
        theDiv.appendChild(svl)
        theDiv.appendChild(tm)
    }

    addOffset(task, offsetVal){
        var taskSimulView = document.getElementById(task.guid().toString()+"simulationView")
        var fakeTask = document.createElement("div")
        fakeTask.className="task"
        fakeTask.style.width = (offsetVal*10).toString()+"px"
        var offset = document.createElement("div")
        offset.className="offset"
        offset.style.width = (offsetVal*10).toString()+"px"
        fakeTask.appendChild(offset)
        taskSimulView.appendChild(fakeTask)
    }

    startSimulation() {

        const simulationColumnRect = document.getElementById("simulationColumn").getBoundingClientRect()
        const mainTableRect = document.getElementById("mainTable").getBoundingClientRect()
        const timeLine = document.getElementById("timeLine")
        const hidder = document.getElementById("hidder")

        timeLine.style.top= simulationColumnRect.top.toString()+"px"
        timeLine.style.left= simulationColumnRect.left.toString()+"px"
        timeLine.style.height= mainTableRect.height.toString()+"px"
        timeLine.style.visibility = "visible"


        hidder.style.top = simulationColumnRect.top.toString()+"px"
        hidder.style.left = simulationColumnRect.right.toString()+"px"
        hidder.style.height = mainTableRect.height.toString()+"px"
        hidder.style.width = "500px"

        const timeAxis = document.getElementById("timeAxis")
        timeAxis.style.left = simulationColumnRect.left.toString()+"px"

        var simulationSpeed = document.getElementById("simulationSpeed").value

        this.intervalID = window.setInterval(()=>{this.doStep()}, simulationSpeed);

    }

    doStep(){
        const allSimulationView = document.getElementsByClassName("simulationView")

        timeLine.style.marginLeft = (4+(this.scheduler.current_time*10)).toString()+"px"
        hidder.style.marginLeft = (4+(this.scheduler.current_time*10)).toString()+"px"
        allSimulationView[0].innerHTML = "Simu@"+(this.scheduler.current_time*1).toString()
        for(let i = 0; i < allSimulationView.length; i++){
            allSimulationView[i].style.width = ((this.scheduler.current_time*10)).toString()+"px"
        }
        
        var neededAxisParts = Math.floor(this.scheduler.current_time / this.stepSize)+1
        for(let i = this.nbAxisParts; i < neededAxisParts; i++, this.nbAxisParts++){
            this.createAxisPart(timeAxis, this.nbAxisParts*this.stepSize, this.stepSize*10)
        } 

        document.getElementById("simulationSpeedDiv").style.visibility = "hidden"

        window.scrollTo({ left: document.body.scrollWidth-150, behavior: 'smooth' });
        this.scheduler.update()
    }

    stopSimulation() {
        window.clearInterval(this.intervalID)
        document.getElementById("simulationSpeedDiv").style.visibility = "visible"
    }

}

export {TaskInterferenceSimulator, Task, Resource};