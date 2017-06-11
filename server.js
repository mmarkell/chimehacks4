var http = require('http'),
    express = require('express'),
    twilio = require('twilio'),
    bodyParser = require('body-parser');

var app = express();
var client = new twilio(accountSid, authToken);

app.use(bodyParser.urlencoded({ extended: true }));

var test = ["question1", "question2", "question3"];
var correctAnswers = ["answer1", "answer2", "answer3"];
var responses = [];

var idx = 0;
var feedback = "";
var lookingForFeedback = false;
var personal = true;

function testing(req, res) {
    var twiml = new twilio.twiml.MessagingResponse();
    if (lookingForFeedback == true) {
      feedback = req.body.Body;
      twiml.message('thank you for your feedback! it has been recorded. type READY for next question');
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
      lookingForFeedback = false;
      return;
    }

    if (idx >= test.length) {
      twiml.message('you have already finished the quiz!');
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
      return;
    }

    if (req.body.Body == "FEEDBACK") {
      twiml.message('please write your feedback. your response will be anonymous. <3 ');
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
      lookingForFeedback = true;
      return;
    }

    if (req.body.Body == "READY") {
        twiml.message(test[idx]);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
        return;
    }
    if (personal) {
      responses += req.body.Body;
      idx += 1;
      if (idx >= test.length) {
        twiml.message('thank you for your answers. you are finished with the quiz.');
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
        return;
      } else {
        twiml.message('thank you. next question: ' + test[idx]);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
        return;
      }
    } else {
      if (req.body.Body == [idx]) {
          idx += 1;
          if (idx >= test.length) {
            twiml.message('correct. congratulations! you are done the quiz!');
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
          } else {
            twiml.message('correct. next question: ' + test[idx]);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
            return;
          }
      } else {
          twiml.message('wrong, you asshole.');
          res.writeHead(200, {'Content-Type': 'text/xml'});
          res.end(twiml.toString());
          return;
      }
    }
}

app.post('/', testing);

http.createServer(app).listen(1337, function () {
  console.log("Express server listening on port 1337");
});

function runTest() {
  client.messages.create({
      body: 'Running a new test! Text "READY" for the first question. If, at any point, you have feedback, type FEEDBACK.',
      to: '+13022290419',  // Text this number
      from: '+13025015021	' // From a valid Twilio number
  }).then((message) => console.log(message.sid));
}
runTest();
