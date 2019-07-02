var onReturnCallbacks = {};
var onCallbacks = {};


function dispatchSwarm(swarm) {
    console.log(new Error("Not implemented!!!"));
}

function SwarmCommand(swarmName, phaseName, args) {
    var swarm = {};
    swarm.meta = {};
    swarm.name = swarmName;
    swarm.meta.swarmTypeName = swarmName;
    swarm.meta.phaseName = phaseName;
    swarm.meta.args = args;

    this.onReturn = function (callback) {
        if (typeof callback !== "function") {
            throw new Error("The first parameter should be a string and the second parameter should be a function");
        }
        if (!onReturnCallbacks[swarmName]) {
            onReturnCallbacks[swarmName] = [];
        }
        onReturnCallbacks[swarmName].push(callback);
    };

    this.on = function (phaseName, callback) {

        if (!onCallbacks[swarmName]) {
            onCallbacks[swarmName] = [];
        }

        onCallbacks[swarmName].push({
            callback: callback,
            phaseName: phaseName
        });
    };

    this.continueSwarm = function (swarmSerialisation, phaseName, args) {
        swarm.meta = swarmSerialisation.meta;
        swarm.meta.phaseName = phaseName;
        swarm.args = args;
        dispatchSwarm(swarm);
    };

    this.getSwarmData = function () {
        return swarm;
    };

}


const virtualMQInteractionSpace = function (childMessageQue) {

    this.startSwarm = function (swarmName, ctor, args) {
        const swarmCmd = new SwarmCommand(swarmName, ctor, args);
        childMessageQue.produce(swarmCmd.getSwarmData());
        return swarmCmd;
    };

    this.continueSwarm = function (swarmInstance, swarmSerialisation, phaseName, args) {
        swarmInstance.continueSwarm(swarmSerialisation, phaseName, args);
    };

    const consumerUplets = [];

    childMessageQue.registerConsumer(function (err, result) {
        if (err) {
            console.err(err);
            return;
        }

        for (var i = 0; i < consumerUplets.length; i++) {
            const consumer = consumerUplets[i];
            if ((consumer.phaseName === result.meta.phaseName || consumer.phaseName === "*")
                && consumer.swarmInstance.swarmId === result.meta.swarmId) {
                consumer.callback(result);
            }
        }
    });

    this.on = function (swarmInstance, phaseName, callback) {
        consumerUplets.push({swarmInstance: swarmInstance, phaseName: phaseName, callback: callback});
    };

    this.off = function (swarmInstance, phaseName) {
        for (var i = 0; i < consumerUplets.length; i++) {
            const consumer = consumerUplets[i];
            if ((consumer.phaseName === phaseName || phaseName === "*")
                && consumer.swarmInstance.swarmId === swarmInstance.swarmId) {
                consumerUplets.splice(i, 1);
            }
        }
    };
};

module.exports = virtualMQInteractionSpace;