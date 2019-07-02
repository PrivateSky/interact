require("../../../builds/devel/pskruntime");
require("../../../builds/devel/consoleTools");
require("callflow");

var is = require("../index").createInteractionSpace();

$$.swarm.describe("swarmTest", {
    start:function(value, secondValue){
        this.value = value;
        console.log("Start");
        this.swarm("interaction", "step1", this.value, secondValue);
    },
    step1:"interaction",
    step2: function(value, secondValue){
      console.log("Back in step 2");
      this.swarm("interaction","step3", value, secondValue);
    },
    end:function(value, secondValue){
        console.log("End..", value, secondValue);
    }
});

is.startSwarm("swarmTest", "start", {foo: "foo", bar: "bar"}, 5).on({
    step1:function(value, secondValue){
        console.log("Interaction step ", value);
        this.swarm("step2", value, secondValue);
    },
    step3:function(value, secondValue){
        console.log("Step3",value);
        this.swarm("end", value, secondValue);
    }
});





