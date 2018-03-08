var express = require('express');
var app = express();
var nodemailer = require('nodemailer');
var mysql = require('./dbcon.js');
var handlebars = require('express-handlebars');
var bodyParser = require("body-parser");

let transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  port: 25,
  auth: {
    user: 'noreply.group9@gmail.com',
    pass: 'wethebest'
  },
  tls: {
    rejectUnauthorized: false
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('port', 50111);
app.use(express.static("public"));
//app.engine('handlebars', handlebars.engine);
app.set("view engine", "handlebars");
app.set('mysql', mysql);
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
  //helpers: require(__dirname + "/public/js/helpers.js").helpers,        // Use helper functions if needed
    partialsDir: __dirname + '/views/partials'
}));

app.get('/',function(req,res){
  res.render("homepage");
});

app.get('/register',function(req,res){
  res.render("registerForm");
});


app.post('/login', function(req,res){
  
   var username = req.body.userName;
   var password = req.body.password;
  
  
   // query database for username
   mysql.pool.query('SELECT * FROM employee WHERE username ?', [req.body.userName], function(err, rows, fields){
                    if(err){
                      next(err);
                      return;
                    }
   });

   // if username DNE, error
   if (!rows) {
     // error - username does not exist
  }

  // if username exists, query the password
  else {
      
        // if password matches, print success
        if (password === rows[0].pword)
        {
           // print success 
        }
  }

});



app.get('/register/validate',function(req,res){
  //console.log(req.query);
  
    // insert form values into table
    mysql.pool.query("INSERT INTO employees (`username`, `email`, `pword`, `isValidated`, `failedAttempts`)
           VALUES (?,?,?,?,?)", [req.body.userName, req.body.email, req.body.password, 0, 0], function(err, result){
              if(err){
                next(err);
                  return;
              }
          });
    

      let HelperOptions = {
        from: '"John" <noreply.group9@gmail.com',
        to: 'noreply.group9@gmail.com',
        subject: 'Verfication Email',                                                                                         //identifier
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/userregister' + '?userName=' + req.query.userName + '.\n'
    };

    transporter.sendMail(HelperOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        //console.log("The message successfully was sent!");
        // Uncomment to see the email status sent
        //console.log(info);
    });
  res.render("validate");
});

app.get('/userregister',function(req,res){
  console.log("got param:" + req.query.userName);
  res.redirect("/");
});

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
