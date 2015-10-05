const Slack = require('slack-client');
const Backbone = require('backbone');
const  _ = require('underscore');
const rx = require('rx');
const JiraApi = require('jira').JiraApi;
const UserInteraction = require('./UserInteraction');
const JiraHelper = require('./JiraHelper');

class Bot{
    /**
     * @param token
     * @param jiraHost
     * @param jiraPort
     * @param jiraUser
     * @param jiraPassword
     * @param jiraApiVersion
     */
    constructor(token, jiraHost, jiraPort, jiraUser, jiraPassword, jiraApiVersion) {
        this.slack = new Slack(token, true, true);
        this.jira = new JiraApi('http', jiraHost, jiraPort, jiraUser, jiraPassword, jiraApiVersion);
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
        let messages = rx.Observable.fromEvent(this.slack, 'message').where(e => ( e.type === 'message' && e.subtype !='bot_message' ));
        let mentionMessages = messages.where(e =>e.text.toLowerCase().match(/(\w+\-\d+)/i));

        return mentionMessages.subscribe((e)=>this.doMessages(e));
    }

    /**
     * Do the messages with issue mention.
     * @param message
     */
    doMessages(message){
        let issueKeyMatches = message.text.match(/(\w+\-\d+)/i);
        if(issueKeyMatches){
            let issueKey = issueKeyMatches[1];
            let regex = new RegExp('^(comment)(.*)(?:issue)? (\w+\-\d+) (?:that)?(?:\:)?(.+)+');
            let matches = regex.exec(message.text);
            if(matches){
                let command = matches[1];
                let comment = matches[3];
                switch (command){
                    case 'comment':
                        this.onCommentIssue(issueKey, comment, message);
                        break;
                }
            }
            else{
                this.onGetIssueInfo(issueKey, message);
            }
        }
    }
    onCommentIssue(issueKey, comment, message){
        "use strict";
        let channel = this.slack.getChannelGroupOrDMByID(message.channel);
        let user = this.slack.getUserByID( message.user );
        let formatedComment = `[${user.name}|https://enginethemes.slack.com/messages/@${user.name}] : ${comment}`;
        this.jira.addComment(issueKey, formatedComment, function(error, response){
            if(error === null){
                channel.send('Comment added');
            }
            else{
                channel.send('Can no addcomment ' + error);
            }
        });
    }
    onGetIssueInfo(issueKey, message){
        let channel = this.slack.getChannelGroupOrDMByID(message.channel);
        this.jira.findIssue('GM-345', function(error, issue){
            if(error){
                console.log(error);
                channel.send(error);
                return rx.Observable.return(null);
            }
            channel.postMessage({
                as_user:false,
                username:'Jira',
                icon_emoji:':tiger:',
                attachments: [
                    {
                        "fallback": "Required plain-text summary of the attachment.",
                        "color": JiraHelper.getPriorityColor(issue.fields.priority.id),
                        "title": issue.fields.summary,
                        "title_link": `http://agile.youngworld.vn/browse/${issueKey}`,
                        "text": issue.fields.description,
                        "fields": [
                            {
                                "title": "status",
                                "value": issue.fields.status.name,
                                "short": true
                            },
                            {
                                "title": "assignee",
                                "value": issue.fields.assignee.displayName,
                                "short": true
                            },
                            {
                                "title": "priority",
                                "value": issue.fields.priority.name,
                                "short": true
                            },

                            {
                                "title": "creator",
                                "value": issue.fields.creator.displayName,
                                "short": true
                            }
                        ]
                    }
                ]
            });
        });
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