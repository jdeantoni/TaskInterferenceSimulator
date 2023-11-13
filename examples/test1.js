import {TaskInterferenceSimulator, Resource, Task} from "../src/task-interefence-simulator.js";


define(function (require) {
    jssim = require('../node_modules/js-simulator/src/jssim');
    module.exports = jssim;
});

define()


function initSimulation(){
    const stepSize = 1 

    var sim = new TaskInterferenceSimulator(stepSize)
    sim.nbAxisParts = 0
    sim.scheduler.reset();

    elaborateAndRunSystemRSF(sim);
    //elaborateAndRunSystemMyTests(sim);

    document.getElementById("startButton").onclick = () => {sim.startSimulation()}
    document.getElementById("stopButton").onclick = () => {sim.stopSimulation()}
}

document.addEventListener('DOMContentLoaded', initSimulation)

function elaborateAndRunSystemRSF(sim){
    // id, priority (higher is more prior), sceduler, profil for task (type, duration, args)
    var r1 = new Resource(69,3, 1, sim)
 
 
    // essai avec vuisualisation apptern
    // var t1 = new Task("t1", 1, sim, [["access", 2100, r1], ["execute", 2300], ["access", 400, r1], ["execute", 400], ["access", 500, r1], ["execute", 200], ["access", 300, r1],["execute", 1200]])
    // var t2 = new Task("t2", 1, sim, [["access", 2100, r1], ["execute", 2300], ["access", 400, r1], ["execute", 400], ["access", 500, r1], ["execute", 200], ["access", 300, r1],["execute", 1200]])

    //essai avec valeur stable dans csv
    var t1 = new Task("t1", 1, sim, [["access", 550, r1], ["execute", 660], ["access", 670, r1], ["execute", 200], ["access", 1100, r1], ["execute", 200], ["access", 200, r1]])
    var t2 = new Task("t2", 1, sim, [["access", 550, r1], ["execute", 540], ["access", 670, r1], ["execute", 160], ["access", 1100, r1], ["execute", 160], ["access", 200, r1]])



    //var t3 = new Task("t3", 1, sim, [["access", 1580, r1]])//, ["execute", 1000], ["access", 1300, r1]])
    // var t4 = new Task("t4", 1, sim, [["access", 1580, r1], ["execute", 1000], ["access", 1300, r1]])

    // var t3 = new Task("t3", 1, sim, [["access", 992, r1], ["execute", 1000], ["access", 992, r1]])
    // var t4 = new Task("t4", 1, sim, [["access", 992, r1], ["execute", 1000], ["access", 992, r1]])
    r1.setAllTasksInfo([t1, t2/*,t3,t4*/])

    sim.scheduler.schedule(t1, 0);
    sim.scheduler.schedule(t2, 0);
    // sim.addOffset(t2, 0)
    //sim.scheduler.schedule(t3, 0);
    // sim.addOffset(t3, 200)
    // sim.scheduler.schedule(t4, 0);
    // sim.addOffset(t4, 600)
    sim.scheduler.schedule(r1, 0);
}


function elaborateAndRunSystemMyTests(sim){
    // id, priority (higher is more prior), sceduler, profil for task (type, duration, args)
    var r1 = new Resource(69,3, 2, sim)
 
 
    var t1 = new Task("t1", 1, sim, [["access", 460, r1]])
    var t2 = new Task("t2", 1, sim, [["access", 460, r1]])
    var t3 = new Task("t3", 1, sim, [["access", 460, r1]])
    var t4 = new Task("t4", 1, sim, [["access", 460, r1]])
    var t5 = new Task("t5", 1, sim, [["access", 460, r1]])
    var t6 = new Task("t6", 1, sim, [["access", 460, r1]])
    var t7 = new Task("t7", 1, sim, [["access", 460, r1]])

    r1.setAllTasksInfo([t1,t2,t3,t4,t5,t6,t7]) 

    sim.scheduler.schedule(t1, 0);
    sim.scheduler.schedule(t2, 0);
    sim.scheduler.schedule(t3, 0);
    sim.scheduler.schedule(t4, 0);
    sim.scheduler.schedule(t5, 0);
    sim.scheduler.schedule(t6, 0);
    sim.scheduler.schedule(t7, 0);





    sim.scheduler.schedule(r1, 0);
}


function elaborateAndRunSystemTAS(sim){
    // id, priority (higher is more prior), sceduler, profil for task (type, duration, args)
    var r1 = new Resource(69,3, 2, sim)
 
 
    
    var t1 = new Task("t1", 1, sim, [["access", 510, r1], ["execute", 1000]])
    var t2 = new Task("t2", 1, sim, [["access", 510, r1], ["execute", 1000]])
    var t3 = new Task("t3", 1, sim, [["access", 510, r1], ["execute", 1000]])
    var t4 = new Task("t4", 1, sim, [["access", 510, r1], ["execute", 1000]])
    var t5 = new Task("t5", 1, sim, [["access", 510, r1], ["execute", 1000]])
    var t6 = new Task("t6", 1, sim, [["access", 510, r1], ["execute", 1000]])

    // var t2 = new Task("t2", 1, sim, [["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 40, r1],["execute",2]])
    // var t3 = new Task("t3", 1, sim, [["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 40, r1],["execute",2]])
    // var t4 = new Task("t4", 1, sim, [["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 60, r1],["execute",2],["access", 40, r1],["execute",2]])
    // var t5 = new Task("t5", 1, sim, [["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 40, r1]])
    // var t6 = new Task("t6", 1, sim, [["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 60, r1],["access", 40, r1]])


    r1.setAllTasksInfo([t1,t2,t3,t4,t5, t6]) 

    sim.scheduler.schedule(t1, 0);
    sim.scheduler.schedule(t2, 0);
    sim.scheduler.schedule(t3, 0);
    sim.scheduler.schedule(t4, 0);
    sim.scheduler.schedule(t5, 0);
    sim.scheduler.schedule(t6, 0);




    sim.scheduler.schedule(r1, 0);
}