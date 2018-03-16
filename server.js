
/***************************************************************
                      NODE MODULES
****************************************************************/
var express = require('express');
var app = express();
var nodemailer = require('nodemailer');
var mysql = require('./dbcon.js');
var handlebars = require('express-handlebars');
var bodyParser = require("body-parser");
var moment = require('moment');


/*******************************************************
 NODEMAILER - for verification email on account creation
******************************************************/
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

/***************************************************************
                      Set up module usage
****************************************************************/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('port', 50113);
app.use(express.static("public"));
//app.engine('handlebars', handlebars.engine);
app.set("view engine", "handlebars");
app.set('mysql', mysql);
app.engine('handlebars', handlebars({
    defaultLayout: 'main',
// Use helper functions if needed
//helpers: require(__dirname + "/public/js/helpers.js").helpers,      
    partialsDir: __dirname + '/views/partials'
}));

/***************************************************************
                      ROUTES
****************************************************************/


/*************************
        STATIC ROUTES
**************************/

//default landing page
app.get('/',function(req,res){
  res.render("homepage");
});

//resource links
app.get('/resources',function(req,res){
  res.render("resources");
});

//registration page
app.get('/register',function(req,res){
  res.render("registerForm");
});

//login page
app.get('/userLogin', function(req,res){
  res.render("login")
});

//password reset
app.get('/forgotPassword', function(req,res){
  res.render("forgotPass")
})

//homepage for employees
app.get('/employee-home', function(req, res){
  res.render("employeePage");
})

//homepage for HR
app.get('/hr-home', function(req, res){
  res.render("hrPage");
})

//file an incident report for employee
app.get('/report', function(req, res){
  res.render("report");
})

//FAQs page
app.get('/faqs', function(req, res){
  res.render("faqs");
})

/*****************************************
              DYNAMIC ROUTES
*****************************************/


/**********************
    Account Creation  
************************/

app.get('/userregister',function(req,res){
  console.log("got param:" + req.query.userName);
  res.redirect("/");
});

//validates user upon registration
app.post('/register/validate',function(req,res){
  //console.log(req.body);
  
  //insert form values into table
  mysql.pool.query("INSERT INTO employee (`username`, `email`, `pword`, " +
    "`isValidated`, `failedAttempts`) VALUES (?,?,?,?,?)", 
    [req.body.userName, req.body.email, req.body.password, 0, 0], 
    function(err, result){
    if(err){
      next(err);
      return;
    }
  });
    
  let HelperOptions = {
    from: '"Group9" <noreply.group9@gmail.com',
    to: req.body.email,
    subject: 'Verfication Email',                                                                                         //identifier
    text: 'Hello,\n\n' + 'Please verify your account by ' +
          'clicking the link: \nhttp:\/\/' + req.headers.host + '\/userregister' 
          + '?userName=' + req.body.userName + '.\n'
  };

  transporter.sendMail(HelperOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
  });
  res.render("validate");
});

/**********************
      Login Route 
************************/
app.post('/login', function(req,res){
  var context = {}; 
  var msg = {};
  //console.log(req.body);
  var username = req.body.userName;
  var password = req.body.password;
  
  // query database for username
  mysql.pool.query('SELECT * FROM employee WHERE username=?', 
    [req.body.userName], function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context = rows[0];

    // if username DNE, error
    if (context == undefined) {
    // error - username does not exist
      console.log("error: username does not exist");
      msg.status = "Invalid username or password. Please try again.";
      res.render('login', msg);
    }

    // if username exists, query the password
    else {
      // Check if user failed to login 5 times already
      if (rows[0].failedAttempts >= 5) {
        msg.status = "The referenced account is now locked. " +
                      "Please contact your administrator.";
        res.render('login', msg);
      }
      // if password matches, print success
      else if (password === rows[0].pword)
      {
        // print success - reset failedAttempts
        console.log("login success!");
        mysql.pool.query('UPDATE employee SET failedAttempts=? ' + 
                         'WHERE username=?', 
          [0, rows[0].username], function(err, rows, fields){
          if(err){
            next(err);
            return;
          }

          //console.log(context);
          res.render('profile', context);
        })
      }

      else {
        // login failed - increment failedAttempts
        console.log("login failed");
        mysql.pool.query('UPDATE employee SET failedAttempts=?' + 
                         'WHERE username=?', 
          [rows[0].failedAttempts + 1, rows[0].username], function(err){
          if(err){
            next(err);
            return;
          }
          // If too many failed attempts, send message that account is now locked
          if (rows[0].failedAttempts >= 4) {
            msg.status = "The referenced account is now locked. " +
                         "Please contact your administrator.";
            res.render('login', msg);
          }
          else  {
          msg.status = "Invalid username or password. Please try again.";
          res.render('login', msg);
          }
        })  
      }
    }
  });
});

app.post('/forgotPass/reset',function(req,res){
  //console.log(req.body);
   var newPassword = req.body.password;
   
  // query database for username
  mysql.pool.query('SELECT * FROM employee WHERE username=? AND email=?', 
    [req.body.userName, req.body.email], 
    function(err, rows, fields){
      if(err){
        next(err);
        return;
      }

    context = rows[0];
    console.log(rows[0]);

  // if username DNE, error
    if (!rows) {
       // error - username/email combo does not exist
       console.log("error: username/email combination not found");
    }

    // if username/email is found 
    else {
      mysql.pool.query("UPDATE employee SET pword=? WHERE username=? AND email=?", 
        [newPassword, rows[0].username, rows[0].email], 
        function(err, rows, fields){
          if(err){
            next(err);
            return;
          }
      })
    }

    res.redirect("/userLogin");

    });
});

/************************
    Incident Report  
************************/
//generates preview of incident report
app.post('/submitReport', function(req, res){
  context = req.body;
  context.reportDate = moment().format("YYYY-MM-DD");
  console.log(context);

  res.render('reviewForm', context);
})

//submits incident report
app.post('/submitted', function(req, res){
  context = req.body;
  console.log(context);
  mysql.pool.query("INSERT INTO report " +
                  "(`reportDate`, `incidentDate`, `anonymous`, `accused`, `description`) "+
                  "VALUES (?,?,?,?,?)", 
    [moment().format('YYYY-MM-DD'), 
    context.incidentDate, context.anonymous, context.accused, context.description], 
    function(err, result){
      if(err){
        next(err);
        return;
      }
    console.log(result.insertId);
    mysql.pool.query('SELECT * FROM report WHERE id=?', result.insertId, 
      function(err, rows, fields){
        if(err){
        next(err);
        return;
        };
      console.log(rows[0]);
      res.render('formSent');
    })
  })
})


/************************
    Employee Pages  
************************/

app.post('/profileEdit',function(req,res){
   var context = {};
	
   mysql.pool.query("SELECT * FROM employee WHERE id=?", [req.body.id], 
    function(err, result){
      if(err){
        next(err);
        return;
      }
      if(result.length == 1){
        var curVals = result[0];
        console.log(curVals);
        mysql.pool.query("UPDATE employee SET username=?, email=?, pword=? WHERE id=? ",
          [req.body.userName || curVals.username, req.body.email || curVals.email, req.body.password || curVals.pword, curVals.id],
          function(err, result){
          if(err){
            next(err);
            return;
          }
          mysql.pool.query("SELECT * FROM employee WHERE id=?", [req.body.id], 
            function(err, rows, fields){
              if(err){
              next(err);
              return;
              }
          context=rows[0]
          console.log(context);

          //context.results = "Updated " + result.changedRows + " rows.";
          res.render('profile', context);
          });
        });
      }
    });
});

/************************
      Error Handling 
************************/

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
  console.log('Express started on http://localhost:' + app.get('port') + 
    '; press Ctrl-C to terminate.');
});
