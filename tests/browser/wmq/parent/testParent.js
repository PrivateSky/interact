setTimeout(function(){
    var childWindow = document.getElementsByTagName("iframe")[0].contentWindow;
    var interact = require("interact");
    interact.enableIframeInteractions();
    var is = interact.createWindowInteractionSpace("iframe",childWindow);

    is.startSwarm("swarmTest", "start", {foo:"foo", bar:"bar"}).on({
        step1:function(value){
            console.log("Interaction step ", value);
            this.collectedValue="Super";
            setTimeout(()=>{
                this.swarm("step2", value);
            }, 1000);
        },
        step3:function(value){
            console.log("Step3",value);
            this.swarm("end", value);
        },
        step4:function (value) {
            console.log("Final step in parent", value)
        }
    });


},1000);








