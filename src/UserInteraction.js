const rx = require('rx');
const _ = require('underscore');
class UserInteraction{
    // Private: Posts a message to the channel with some timeout, that edits
    // itself each second to provide a countdown.
    //
    // channel - The channel to post in
    // formatMessage - A function that will be invoked once per second with the
    //                 remaining time, and returns the formatted message content
    // scheduler - The scheduler to use for timing events
    // timeout - The duration of the message, in seconds
    //
    // Returns an object with two keys: `timeExpired`, an {Observable} sequence
    // that fires when the message expires, and `message`, the message posted to
    // the channel.
    static postMessageWithTimeout(channel, formatMessage, scheduler, timeout) {
        let timeoutMessage = channel.send(formatMessage(timeout));

        let timeExpired = rx.Observable.timer(0, 1000, scheduler)
            .take(timeout + 1)
            .do((x) => timeoutMessage.updateMessage(formatMessage(`${timeout - x}`)))
            .publishLast();

        return {timeExpired: timeExpired, message: timeoutMessage};
    }
}
module.exports = UserInteraction;