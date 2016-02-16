import util from 'util';
import EventEmitter from 'events';

function GithubPullsDispatcher() {
	EventEmitter.call(this);
}

util.inherits(GithubPullsDispatcher, EventEmitter);

module.exports = new GithubPullsDispatcher();