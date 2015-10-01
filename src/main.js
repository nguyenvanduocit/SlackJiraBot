require('babel/register');
var http = require('http');
const config = require('./config');
try {
    var pathToken = process.env.SLACK_POKER_BOT_TOKEN;
    var token = pathToken || config.token;
} catch (error) {
    console.log("Your API token should be placed in a 'token.txt' file, which is missing.");
    return;
}

var Bot = require('./Bot');
var bot = new Bot(token);
bot.login();

http.createServer(function(req, res) {
    res.end('SLACK_JIRE_BOT');
}).listen(process.env.PORT || config.port || 5000);