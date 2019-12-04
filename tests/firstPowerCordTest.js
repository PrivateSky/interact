const interact = require('../index');
const {assert} = require('../../double-check');
const path = require('path');

require('../../../psknode/bundles/pskruntime');

const interactionSpace = interact.createInteractionSpace();

const powerSource = [
    path.join(__dirname, '../../../psknode/bundles/sandboxBase.js'),
    path.join(__dirname, '../../../psknode/bundles/pskruntime.js'),
    path.join(__dirname, '../../../psknode/bundles/domain.js')
];

assert.callback('firstPowerCordTest', (callback) => {
    const isolatePowerCord = interact.createIsolatePowerCord(powerSource);

    interactionSpace.plug("agentX", isolatePowerCord);

    const swarmResult = interactionSpace.startSwarmAs('agentX', 'echo', 'say', 'Hello from interact');

    let onReturnCalled = false;
    swarmResult.onReturn((response) => {
        onReturnCalled = true;
        assert.equal(response, 'Echo Hello from interact', `Received wrong response "${response}"`)
    });

    function starReturn() {
        assert.true(false, 'This should not have been called, Off should have removed this callback')
    }

    swarmResult.on('*', starReturn);
    swarmResult.off('*', starReturn);

    function notCalledReturn() {
        assert.true(false, 'This should not have been called, Off should have removed this callback');
    }

    swarmResult.onReturn(notCalledReturn);
    swarmResult.off('__return__', notCalledReturn);

    let onStarCalled = false;
    swarmResult.on('*', (response) => {
        onStarCalled = true;
        assert.equal(response, 'Echo Hello from interact', `Received wrong response "${response}"`)
    });

    let onPhaseNameReturnCalled = false;
    swarmResult.on('__return__', (response) => {
        onPhaseNameReturnCalled = true;
        assert.equal(response, 'Echo Hello from interact', `Received wrong response "${response}"`)
    });

    setTimeout(() => {
        assert.true(onReturnCalled, 'onReturn callback was not called');
        assert.true(onStarCalled, 'on("*") callback was not called');
        assert.true(onPhaseNameReturnCalled, 'on("__return__") was not called');

        callback();

    }, 1000);
}, 2000);

