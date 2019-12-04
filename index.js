/*
Module that offers APIs to interact with PrivateSky web sandboxes
 */

module.exports = {
    createInteractionSpace: function () {
        const powerCordCollection = new Map();
        const swarmutils = require('swarmutils');

        function CordRelay() {
            const storage = {};

            this.switch = function (swarm) {
                const {swarmId, swarmTypeName, phaseName, args} = swarm.meta;

                const regexString = `(${swarmId}|\\*)\\/(${swarmTypeName}|\\*)\\/(${phaseName}|\\*)`;
                const reg = new RegExp(regexString);

                const keys = Object.keys(storage);
                keys.forEach(key => {
                    if (key.match(reg)) {
                        const callbacks = storage[key];
                        callbacks.forEach(cb => {
                            cb(...args);
                        })
                    }
                });

                if (phaseName === '__return__') {
                    Object.keys(storage).forEach(key => {
                        if (key.startsWith(swarmId + "/")) {
                            delete storage[key];
                        }
                    });
                }
            };

            this.on = function (swarmId, swarmTypeName, phaseName, callback) {
                const key = `${swarmId}/${swarmTypeName}/${phaseName}`;
                if (typeof storage[key] === "undefined") {
                    storage[key] = [];
                }
                storage[key].push(callback);
            };

            this.off = function (swarmId, swarmTypeName, phaseName, callback) {

                function escapeIfStar(str) {
                    return str.replace("*", "\\*")
                }

                swarmId = escapeIfStar(swarmId);
                swarmTypeName = escapeIfStar(swarmTypeName);
                phaseName = escapeIfStar(phaseName);

                const regexString = `(${swarmId})\\/(${swarmTypeName})\\/(${phaseName})`;
                const reg = new RegExp(regexString);

                const keys = Object.keys(storage);
                keys.forEach(key => {
                    if (key.match(reg)) {
                        const callbacks = storage[key];

                        storage[key] = callbacks.filter(cb => cb !== callback);
                    }
                });
            }
        }

        const cordRelay = new CordRelay();

        function relay(err, swarmSerialization) {
            if (err) {
                console.error(err);
                return;
            }

            const OwM = swarmutils.OwM;
            const SwarmPacker = swarmutils.SwarmPacker;

            const swarmHeader = SwarmPacker.getHeader(swarmSerialization);
            const swarmIdentity = swarmHeader.swarmTarget;

            const targetPowerCord = powerCordCollection.get(swarmIdentity);

            if (targetPowerCord) {
                targetPowerCord.startSwarm(swarmSerialization);
            } else {
                const swarm = OwM.prototype.convert(SwarmPacker.unpack(swarmSerialization));
                cordRelay.switch(swarm);
            }
        }

        return {
            plug: function (identity, powerCordImpl) {

                powerCordImpl.plug(relay);

                powerCordCollection.set(identity, powerCordImpl);
            },
            unplug: function (identity) {
                const powerCord = powerCordCollection.get(identity);

                if (!powerCord) {
                    return;
                }

                powerCord.unplug();
                powerCordCollection.delete(identity);
            },
            startSwarmAs: function (identity, swarmName, ctor, ...args) {
                const powerCord = powerCordCollection.get(identity);

                if (!powerCord) {
                    throw Error('Missing power cord');
                }

                const swarm = startSwarmHelper(identity, swarmName, ctor, args);
                const swarmId = swarm.getMeta('swarmId');
                swarm.setMeta("homeSecurityContext", 'currentIdentity');

                const SwarmPacker = swarmutils.SwarmPacker;
                const swarmSerialization = SwarmPacker.pack(swarm);

                powerCord.startSwarm(swarmSerialization);

                function listening(method, phaseName, callback){
                    if(typeof phaseName === "string"){
                        cordRelay[method](swarmId, swarmName, phaseName, callback);
                    }

                    if(typeof phaseName === "object"){
                        if(typeof callback !== "undefined"){
                            console.log("Callback argument is ignored");
                        }
                        Object.keys(phaseName).forEach(phase => {
                            cordRelay[method](swarmId, swarmName, phase, phaseName[phase]);
                        });
                    }
                }

                return {
                    on: function (phaseName, callback) {
                        listening("on", phaseName, callback);
                    },
                    onReturn: function (callback) {
                        this.on('__return__', callback);
                    },
                    off: function (phaseName, callback) {
                        listening("off", phaseName, callback)
                    }
                }
            }
        }
    },
    createIsolatePowerCord: function (...args) {
        const PowerCord = require('./powerCordTypes/IsolatePowerCord');

        return MakePluggable(new PowerCord(...args))
    },
    createWirelessPowerCord: function (...args) {
        const PowerCord = require('./powerCordTypes/WirelessPowerCord');

        return MakePluggable(new PowerCord(...args));
    },
    createThreadPowerCord: function (...args) {
        const PowerCord = require('./powerCordTypes/ThreadPowerCord');

        return MakePluggable(new PowerCord(...args));
    }
};

function MakePluggable(powerCord) {
    powerCord.plug = function (powerTransfer) {
        powerCord.transfer = powerTransfer;
    };

    powerCord.unplug = function () {
        powerCord.transfer = null;
    };

    return powerCord;
}

function startSwarmHelper(target, swarmName, ctor, args) {
    const swarmutils = require('swarmutils');
    const OwM = swarmutils.OwM;
    const swarm = new OwM();
    swarm.setMeta("swarmId", $$.uidGenerator.safe_uuid());
    swarm.setMeta("requestId", swarm.getMeta("swarmId"));
    swarm.setMeta("swarmTypeName", swarmName);
    swarm.setMeta("phaseName", ctor);
    swarm.setMeta("args", args);
    swarm.setMeta("command", "executeSwarmPhase");
    swarm.setMeta("target", target);

    return swarm;
}
