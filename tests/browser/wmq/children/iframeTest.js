
$$.swarm.describe("swarmTest", {
    public:{
        collectedValue:"int"
    },
    start:function(value){
        this.value = value;
        console.log("Start");
        var self = this;

        var interact2 = require("interact");
        interact2.enableLocalInteractions();
        var is = require("interact").createInteractionSpace();
        is.startSwarm("swarmTest2", "start", value).on({
            auxiliaryStep :function(){
                console.log("aux step in iframe");
                self.swarm("interaction", "step1", "auxiliary");
            }
        });

    },
    step1:"interaction",
    step2: function(value){
        console.log("Back in step 2");
        this.swarm("interaction","step3", value);
    },
    step3:"interaction",
    end:function(value){
        this.swarm("interaction","step4", value);
        console.log("End..", value);
    }
});

$$.swarm.describe("swarmTest2", {
    start: function (value) {
        this.value = value;
        this.swarm("interaction", "auxiliaryStep", this.value);
    },
});



var interact = require("interact");
interact.enableIframeInteractions();
var interaction = interact.createWindowInteractionSpace("iframe", window);
interaction.init();