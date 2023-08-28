import {TaskInterferenceSimulator, Resource, Task} from "../src/task-interefence-simulator.js";


define(function (require) {
    jssim = require('../node_modules/js-simulator/src/jssim');
    module.exports = jssim;
});

define()


function initSimulation(){
    var sim = new TaskInterferenceSimulator()
    sim.nbAxisParts = 0
    sim.scheduler.reset();

    elaborateAndRunSystem(sim);

    document.getElementById("startButton").onclick = () => {sim.startSimulation()}
    document.getElementById("stopButton").onclick = () => {sim.stopSimulation()}
}

document.addEventListener('DOMContentLoaded', initSimulation)

function elaborateAndRunSystem(sim){
    // id, priority (higher is more prior), sceduler, profil for task (type, duration, args)
    var r1 = new Resource(69,3, sim.scheduler)
    var t1 = new Task(42, 2, sim.scheduler, [["access", 5, r1], ["execute", 10], ["access", 5, r1]])
    var t2 = new Task(88, 1, sim.scheduler, [["access", 5, r1], ["execute", 10], ["access", 5, r1]])

    r1.setAllTasksInfo([t1, t2])

    sim.scheduler.schedule(t1, 0);
    sim.scheduler.schedule(t2, 5);
    sim.addOffset(t2, 5)
    sim.scheduler.schedule(r1, 0);
}
