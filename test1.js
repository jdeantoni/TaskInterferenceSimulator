// var jssim = require('js-simulator');


// class Resource extends jssim.SimEvent {
//     constructor(uid, priority){
//         super(priority)
//         this.id=uid
//         this.state = "idle"
//     }

//     //for record
//     resourceStates = ["idle", "inUse"]
//     resourceEvents = ["get", "free"]

//     //todo add current user id


//     //FSM 
//     react(content, sender_id){
//         if (this.state == "idle"){
//             if(content == "get"){
//                 this.state = "inUse"
//                 this.sendMsg(sender_id,{
//                     content: "OK",
//                     sender:this.guid()
//                 })
//             }
//             else if(content == "free"){
//                 console.error("cannot free an idle resource")
//                 scheduler.reset()
//             }
//         }
//         else if (this.state == "inUse"){
//             if(content == "get"){
//                 this.sendMsg(sender_id,{
//                     content: "KO",
//                     sender:this.guid()
//                 })
//             }
//             else if(content == "free"){
//                 this.state = "idle"
//                 this.sendMsg(sender_id,{
//                     content: "OK",
//                     sender:this.guid()
//                 })
//             }
//         }
//     }

//     //timed update
//     update(deltaTime){
//         // console.log('resource [' + this.id + '] is fired at time ' + this.time+ " deltaTime= "+deltaTime);
//         var messages = this.readInBox();
//             for(var i = 0; i < messages.length; ++i){
//                 var msg = messages[i];
//                 var sender_id = msg.sender;
//                 var recipient_id = msg.recipient; // should equal to this.guid()
//                 var time = msg.time;
//                 var rank = msg.rank; // the messages[0] contains the highest ranked message and last messages contains lowest ranked
//                 var content = msg.content; // for example the "Hello" text from the sendMsg code above
//                 this.react(content, sender_id)
//                 console.log("@"+this.time+" resource "+this.guid()+" is "+this.state)
//         }

//     }

// }



// class Task extends jssim.SimEvent {
//     constructor(uid, priority, seg){
//         super(priority)
//         this.id=uid
//         this.state = "waitingAction"
//         this.segment = seg
//         this.currentAction = 0
//     }

//     TaskStates = ["waitingAction", "running", "waitingResource", "accessingResource", "dead"]


//     react(){
//         var nextSched = 0
//         var messages = this.readInBox();
//         if(this.state == "waitingAction"){
//             if (this.segment[this.currentAction][0] == "execute"){
//                 this.state = "executing"
//                 nextSched = this.segment[this.currentAction][1]
//             }
//             else if (this.segment[this.currentAction][0] == "access"){
//                 this.state = "waitingResource"
//                 this.sendMsg( this.segment[this.currentAction][1], {
//                     content: "get",
//                     sender:this.guid()
//                 });
//                 scheduler.scheduleOnceIn(r1,0)
//             }
//         }
//         else if(this.state == "executing"){
//             this.currentAction = (this.currentAction+1)%this.segment.length
//             this.state = "waitingAction"
//         }
//         else if(this.state == "waitingResource"){
//             for(var i = 0; i < messages.length; ++i){
//                 var msg = messages[i];
//                 var content = msg.content; // for example the "Hello" text from the sendMsg code above
//                 if (content == "OK"){
//                     this.state = "accessingResource"
//                     nextSched = this.segment[this.currentAction][2]
//                 }
//                 else if (content == "KO"){
//                     this.sendMsg( this.segment[this.currentAction][1], {
//                         content: "get",
//                         sender:this.guid()
//                     });
//                     scheduler.scheduleOnceIn(r1,0)
//                     nextSched = 1
//                 }
//             }
//         }
//         else if(this.state == "accessingResource"){
//             this.sendMsg(this.segment[this.currentAction][1], {
//                 content: "free",
//                 sender:this.guid()
//             });
//             scheduler.scheduleOnceIn(r1,0)
//             this.currentAction = (this.currentAction+1)%this.segment.length
//             this.state = "waitingAction"
//         }

//     return nextSched
//     }


//     update(deltaTime){
//         // console.log('task ' + this.id + '[' + this.rank + ' ] @' + this.time+ " deltaTime= "+deltaTime);
//         var nextSched = this.react()
//         console.log("@"+this.time+" task "+this.guid()+" is "+this.state)
//         scheduler.scheduleOnceIn(this,nextSched) 
//     }

// }



// // var rank = 1; // the higher the rank, the higher the priority assigned and the higher-rank event will be fired first for all events occurring at the same time interval
// // var evt = new jssim.SimEvent(rank);
// // evt.id = 20; 
// // evt.update = function(deltaTime) {
// //     console.log('event [' + this.id + '] with rank ' + this.rank + ' is fired at time ' + this.time);
    
// //     // the code below allows the evt to send message to another agent (i.e., the agent referred by receiver variable)
// //     /*
// //     var receiver_id = receiver.guid()
// //     this.sendMsg(receiver_id, {
// //         content: "Hello"
// //     });
// //     */
    
// //     // the code below allows the evt to process messages sent from another agent
// //     /*
// //     var messages = this.readInbox();
// //     for(var i = 0; i < messages.length; ++i){
// //         var msg = messages[i];
// //         var sender_id = msg.sender;
// //         var recipient_id = msg.recipient; // should equal to this.guid()
// //         var time = msg.time;
// //         var rank = msg.rank; // the messages[0] contains the highest ranked message and last messages contains lowest ranked
// //         var content = msg.content; // for example the "Hello" text from the sendMsg code above
// //     }
// //     */
// // };

// var t1 = new Task(42,2, [["access", 69, 5], ["execute", 10], ["access", 69, 5]])
// var t2 = new Task(88,2, [["access", 69, 5], ["execute", 10], ["access", 69, 5]])
// var r1 = new Resource(69,3)
// var scheduler = new jssim.Scheduler();
// scheduler.reset();
// scheduler.schedule(t1, 0);
// scheduler.schedule(t2, 0);
// scheduler.scheduleRepeatingAt(r1, 0, 1);


// // var space = new jssim.Space2D();
// // for(var i = 0; i < 15; ++i) {
// //     var is_predator = i > 12;
// //     var boid = new Boid(i, 0, 0, space, is_predator);
// //     scheduler.scheduleRepeatingIn(boid, 1);
// // }

//  while(scheduler.current_time < 50) {
//   scheduler.update();
//  }

