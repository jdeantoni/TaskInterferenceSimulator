import {TaskInterferenceSimulator, Resource, Task} from "../src/task-interefence-simulator.js";


define(function (require) {
    jssim = require('../node_modules/js-simulator/src/jssim');
    module.exports = jssim;
});

define()


function initSimulation(){
    const stepSize = 1/20

    var sim = new TaskInterferenceSimulator(stepSize)
    sim.nbAxisParts = 0
    sim.scheduler.reset();

    elaborateAndRunSystem(sim);

    document.getElementById("startButton").onclick = () => {sim.startSimulation()}
    document.getElementById("stopButton").onclick = () => {sim.stopSimulation()}
}

document.addEventListener('DOMContentLoaded', initSimulation)

function elaborateAndRunSystem(sim){
    // id, priority (higher is more prior), sceduler, profil for task (type, duration, args)
    var r1 = new Resource(69,3, 2, sim)
    var t1 = new Task("t1", 1, sim, [["access", 992, r1], ["execute", 1000], ["access", 992, r1]])
    var t2 = new Task("t2", 1, sim, [["access", 992, r1], ["execute", 1000], ["access", 992, r1]])
    var t3 = new Task("t3", 1, sim, [["access", 992, r1], ["execute", 1000], ["access", 992, r1]])
    var t4 = new Task("t4", 1, sim, [["access", 992, r1], ["execute", 1000], ["access", 992, r1]])
    r1.setAllTasksInfo([t1, t2, t3, t4])

    sim.scheduler.schedule(t1, 0);
    sim.scheduler.schedule(t2, 5111);
    sim.addOffset(t2, 5111)
    sim.scheduler.schedule(t3, 10593);
    sim.addOffset(t3, 10593)
    sim.scheduler.schedule(t4, 15887);
    sim.addOffset(t4, 15887)
    sim.scheduler.schedule(r1, 0);
}
