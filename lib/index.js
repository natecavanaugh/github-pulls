var util = require('util');
var EventEmitter = require('events').EventEmitter;

function GithubPullsDispatcher() {
	EventEmitter.call(this);
}

util.inherits(GithubPullsDispatcher, EventEmitter);

module.exports = new GithubPullsDispatcher();