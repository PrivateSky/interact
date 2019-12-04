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
  doSomething: function() {
    console.log('Do something interactSwarm');
    this.return(true);
  }
});
$$.swarm.describe('interactSwarm2', {
  doSomething: function() {
    console.log('Do something interactSwarm2');
    this.return(true);
  }
});

assert.callback(
  'Starting undefined swarms and defined swarms',
  finished => {
    const iSpace = interact.createInteractionSpace();
    iSpace.startSwarm('interactSwarm33', 'doSomething');
    iSpace.startSwarm('interactSwarm44', 'doSomething');
    iSpace.startSwarm('interactSwarm55', 'doSomething');
    iSpace.startSwarm('interactSwarm2', 'doSomething').onReturn(res => {
      counter += 1;
    });
    iSpace.startSwarm('interactSwarm3', 'doSomething');
    iSpace.startSwarm('interactSwarm4', 'doSomething');
    iSpace.startSwarm('interactSwarm5', 'doSomething');
    iSpace.startSwarm('interactSwarm', 'doSomething').onReturn(res => {
      counter += 1;
    });
    let counter = 0;
    setTimeout(() => {
      assert.true(counter == 2, `Calling a defined swarm after an undefined one doesn't work`);
      finished();
      process.exit(0);
    }, 2000);
  },
  2000
);
