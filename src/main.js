require('babel/register');
var http = require('http');
try {
    if(!process.env.SLACK_JIRA_BOT_TOKEN || !process.env.SLACK_JIRA_HOST || !process.env.SLACK_JIRA_PORT || !process.env.SLACK_JIRA_USER || !process.env.SLACK_JIRA_PASSWORD || !process.env.SLACK_JIRA_API_VERSION){
        const config = require('../config');
    }
    var token = process.env.SLACK_JIRA_BOT_TOKEN || config.token;
    var jiraHost = process.env.SLACK_JIRA_HOST || config.jira.host;
    var jiraPort = process.env.SLACK_JIRA_PORT || config.jira.port;
    var jiraUser = process.env.SLACK_JIRA_USER || config.jira.user;
    var jiraPassword = process.env.SLACK_JIRA_PASSWORD || config.jira.password;
    var jiraApiVersion = process.env.SLACK_JIRA_API_VERSION || config.jira.ApiVersion;
} catch (error) {
    console.log("Your API token should be placed in a 'token.txt' file, which is missing.");
    return;
}

var Bot = require('./Bot');
var bot = new Bot(token, jiraHost, jiraPort, jiraUser, jiraPassword, jiraApiVersion);
bot.login();

http.createServer(function(req, response) {
    response.end();
}).listen(process.env.PORT || config.port || 5000);