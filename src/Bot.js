const Slack = require('slack-client');
const Backbone = require('backbone');
const  _ = require('underscore');
const rx = require('rx');
const JiraApi = require('jira').JiraApi;
const config = require('./config');
const UserInteraction = require('./UserInteraction');
class Bot{
    /**
     * @param token
     */
    constructor(token) {
        this.slack = new Slack(token, true, true);
        this.jira = new JiraApi('http', config.jira.host, config.jira.port, config.jira.user, config.jira.password, config.jira.ApiVersion);
    }

    login(){
        rx.Observable.fromEvent(this.slack, 'open')
            .subscribe(() => this.onClientOpened());

        rx.Observable.fromEvent(this.slack, 'error')
            .subscribe(() => this.onClientError());

        this.slack.login();

        this.handleMessageEvent();

    }
    onClientError(e){
        console.log('Client error : ');
        console.log(e);
    }

    // Returns an {Observable} that signals completion of the game
    handleMessageEvent(){
        let messages = rx.Observable.fromEvent(this.slack, 'message')
            .where(e => e.type === 'message');

        //let mentionMessages = messages.where(e =>e.text.toLowerCase().match(/(\w+\-\d+)/i));
        let mentionMessages = messages.where(e =>e.text.toLowerCase().match(/thuyan/i));

        return mentionMessages
            .map(e => this.slack.getChannelGroupOrDMByID(e.channel))
            .flatMap(channel => this.doMessages(messages, channel))
            .subscribe();
    }
    doMessageError(){

    }
    doMessageCompleted(){
        console.log('doMessageCompleted');
    }
    /**
     * Do the messages with issue mention.
     * @param messages
     * @param channel
     */
    // Returns an {Observable} that signals completion of the game
    doMessages(messages, channel){
        // Listen for messages directed at the bot containing 'quit game.'
        messages.where(e =>e.text.toLowerCase().match(/thuyan/i)).subscribe(e => {
                let player = this.slack.getUserByID(e.user);
                channel.postMessage({
                    as_user:false,
                    username:'Jira Helper',
                    icon_url:':trollface:',
                    text:'huhu',
                    "attachments": [
                        {
                            "fallback": "Required plain-text summary of the attachment.",
                            "color": "#36a64f",
                            "pretext": "Optional text that appears above the attachment block",
                            "author_name": "Bobby Tables",
                            "author_link": "http://flickr.com/bobby/",
                            "author_icon": "http://flickr.com/icons/bobby.jpg",
                            "title": "Slack API Documentation",
                            "title_link": "https://api.slack.com/",
                            "text": "Optional text that appears within the attachment",
                            "fields": [
                                {
                                    "title": "Priority",
                                    "value": "High",
                                    "short": false
                                }
                            ],
                            "image_url": "http://my-website.com/path/to/image.jpg",
                            "thumb_url": "http://example.com/path/to/thumb.png"
                        }
                    ]
                });
            });
        return rx.Observable.return(null);
    }
    onClientOpened(){
        this.channels = _.keys(this.slack.channels)
            .map(k => this.slack.channels[k])
            .filter(c => c.is_member);

        this.groups = _.keys(this.slack.groups)
            .map(k => this.slack.groups[k])
            .filter(g => g.is_open && !g.is_archived);

        this.dms = _.keys(this.slack.dms)
            .map(k => this.slack.dms[k])
            .filter(dm => dm.is_open);

        console.log(`Welcome to Slack. You are ${this.slack.self.name} of ${this.slack.team.name}`);

        if (this.channels.length > 0) {
            console.log(`You are in: ${this.channels.map(c => c.name).join(', ')}`);
        } else {
            console.log('You are not in any channels.');
        }

        if (this.groups.length > 0) {
            console.log(`As well as: ${this.groups.map(g => g.name).join(', ')}`);
        }

        if (this.dms.length > 0) {
            console.log(`Your open DM's: ${this.dms.map(dm => dm.name).join(', ')}`);
        }
    }
}
module.exports = Bot;