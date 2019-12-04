/////////////////////////////////////////////////////////////
// Tests if the arguments passed through the interact module
// to the target swarm are received as expected
/////////////////////////////////////////////////////////////
require('../../../../psknode/bundles/pskruntime');
require('../../../../psknode/bundles/psknode');
const assert = require('double-check').assert;
const interact = require('../../index');
const arg1 = { a: 'asd', b: 'eqd' };
const arg2 = 2;

$$.swarm.describe('interactSwarm', {
  doSomething: function(arg1, arg2) {
    console.log('Do something');
    this.localArg1 = arg1;
    this.localArg2 = arg2;
    this.swarm('interaction', 'step1', arg1, arg2);
  },
  step1: 'interaction',
  end2: 'interaction',
  checkArguments: function(arg1, arg2) {
    const argumentsTypeOk =
      typeof arg1 == typeof this.localArg1 && typeof arg2 == typeof this.localArg2;
    console.log(`checked arguments:${argumentsTypeOk}`);
    this.swarm('interaction', 'end2', argumentsTypeOk);
  }
});

assert.callback(
  'In progress',
  finished => {
    let iSpace = interact.createInteractionSpace();
    let swarmCmd = iSpace.startSwarm('interactSwarm', 'doSomething', arg1, arg2);
    swarmCmd.on({
      step1: function(value1, value2) {
        console.log(`Interaction context`);
        this.swarm('checkArguments', value1, value2);
      },
      end2: function(res) {
        console.log(`Finishing`);
        const assert = require('double-check').assert;
        assert.true(res == true, `Argument types not matching`);
        finished();
        process.exit(1);
      }
    });
  },
  2000
);
