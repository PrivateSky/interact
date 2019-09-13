/////////////////////////////////////////////////////////////
// Tests if the arguments passed through the interact module
// to the target swarm are received as expected
/////////////////////////////////////////////////////////////
require('../../../psknode/bundles/pskruntime');
require('../../../psknode/bundles/psknode');
const assert = require('double-check').assert;
const interact = require('../../../modules/interact');
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
  checkArguments: function(arg1, arg2) {
    console.log(`checked arguments:${JSON.stringify(arg1)},${arg2}`);
    this.return(arg1.c == 'frt' && typeof arg1.c == 'string');
  }
});

assert.callback(
  'Adding properties to existing object through interactions works.',
  finished => {
    let iSpace = interact.createInteractionSpace();
    let swarmCmd = iSpace.startSwarm('interactSwarm', 'doSomething', arg1, arg2);
    swarmCmd.on({
      step1: function(value1, value2) {
        value1.c = 'frt';
        this.swarm('checkArguments', value1, value2);
      }
    });
    swarmCmd.onReturn(res => {
      assert.true(res == true, 'Campul adaugat obiectului nu este prezent/nu are tipul initial');
      finished();
      process.exit(0);
    });
  },
  2000
);
