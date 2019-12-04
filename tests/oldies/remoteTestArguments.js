/////////////////////////////////////////////////////////////
// Tests if the arguments passed through the interact module
// to the target swarm are received as expected
/////////////////////////////////////////////////////////////
require('../../../../psknode/bundles/pskruntime');
require("../../../../psknode/bundles/psknode");
require("../../../../psknode/bundles/httpinteract");
const assert = require('double-check').assert;
const interact = require('interact');
const VirtualMQ = require('../../../virtualmq');
const removeDir = require('../Utils/virtualMQUtils').deleteFolder;
const channel = 'local/agent/test';
var endpoint = '';
const alias  = 'virtualMQLocal';
const folder = './tmp';

const args = [1,'2',{3: "val"}, [1,2]]

function createServer(callback) {
    let port = 8080;
    var server = VirtualMQ.createVirtualMQ(port, folder, undefined, (err, res) => {
        if (err) {
            console.log("Failed to create VirtualMQ server on port ", port);
            console.log("Trying again...");
            if (port > 1025 && port < 50000) {
                port++;
                createServer(callback);
            } else {
                console.log("There is no available port to start VirtualMQ instance needed for test!");
            }
        } else {
            console.log("Server ready and available on port ", port);
            endpoint = `http://127.0.0.1:${port}` 
            callback(server);
        }
    });
}
assert.callback('Argument test' ,(finished) => {
    createServer(() => {
        let iSpace = interact.createRemoteInteractionSpace(alias, endpoint, channel);
        iSpace.startSwarm('interactSwarm', 'doSomething', ...args);
        $$.remote.newEndPoint(alias, endpoint, channel);
        $$.remote[alias].on('interactSwarm', 'doSomething', (err, res)=>{
            console.log(res);
            assert.equal(err, null, 'Got error!');
            assert.equal(res.meta.args.length, args.length, "Number of args don't match!");
            for (arg in args){
                if( typeof res.meta.args[arg] === 'object') {
                    assert.arraysMatch(res.meta.args[arg], args[arg]);
                }
                else {
                    assert.equal(res.meta.args[arg], args[arg], "Args don't match!");      
                }
            }
            finished();
            removeDir(folder); //cleanup
            process.exit(0);
        });
    });
},2000);