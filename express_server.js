const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

app.use(cookieSession({
    name: 'session',
    keys: ['kindom hearts 3'],
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

// middleware
app.set("view engine", "ejs");


let urlDatabase = {
    "b2xVn2": {
      shortURL: "b2xVn2",
      longURL: "http://www.lighthouselabs.ca",
      userID: "batman",
    
    },
    "9sm5xK": {
      shortURL: "9sm5xK",
      longURL: "http://www.google.com",
      userID: "batman",
    }
};

const users = { 
    "batman": {
      id: "batman", 
      email: "batman@example.com", 
      password: bcrypt.hashSync("gotham", 10)
    },
   "superman": {
      id: "superman", 
      email: "superman@example.com", 
      password: bcrypt.hashSync("metropolis", 10)
    }
  }

// GET
app.get("/register", (req, res) => {
    const user = users[req.session.user_id];
    if (!user) {
        res.render('register');
    } else {
    res.redirect('/urls');
    }
});
app.get("/", (req, res) => {
    const user = users[req.session.user_id];
    if (!user) {
      res.redirect('/login');
    } else {
    res.redirect("/urls");
    }
  });

app.get("/urls", (req, res) => {
    let userId = req.session.user_id;
    let user = users[userId];
    // console.log(userId)
    if(userId) {
        let templateVars = {
            urls: urlsForUser(userId),
            user: user
        };
    res.render("urls_index", templateVars);
   } else {
    res.status(400).send('<h2>Please <a href="/login">Login</a> or <a href="/register">Register</a></h2>');
   }
});

app.get("/urls/new", (req, res) => {
    let templateVars = {
        user: users[req.session.user_id]
    };
    if (templateVars.user === undefined) {
        res.status(403);
        res.redirect("/login");
    } else {
    res.render("urls_new", templateVars);
    }
});

app.get("/urls/:id", (req, res) => {
    const user = users[req.session.user_id];
    if (!user) {
        res.status(401).send('<h2>Please <a href="/login">Log in</a>.</h2>');
    } else if (urlDatabase[req.params.id] === undefined) {
        res.status(404).send('<h2>Url does not exist. Please <a href="/urls/new">create</a> one </h2>');
    } else if (user.id !== urlDatabase[req.params.id].userID) {
        res.send('<h2>You have no access to this Url. <a href="/urls">Go Back</a></h2>');
    } else {
        let templateVars = {
            urlObj: urlDatabase[req.params.id],
            user: user,
        };
        res.render("urls_show", templateVars);
    }
});

// redirect short urls to long urls
app.get("/u/:shortURL", (req, res) => {
    if (urlDatabase[req.params.shortURL] === undefined) {
      res.status(404).send('<h2>Url does not exist. Please <a href="/urls/new">create</a> one </h2>');
    } else {
      let longURL = urlDatabase[req.params.shortURL].longURL; 
      let shortURL = req.params.shortURL;
      urlDatabase[shortURL].counter++
      res.redirect(longURL);
    }
});

app.get("/login", (req, res) => {
    const user = users[req.session.user_id];
    if (!user) {
        res.render('login');
    } else {
    res.redirect('/urls');
    }
});

//POST 
app.post("/urls", (req, res) => {
    let newshortURL = generateRandomString();
    let longURL = req.body.longURL;
    let userId = req.session.user_id;
    let user = users[userId];
    let now = new Date(new Date().getTime() - 0*60*60*1000).toLocaleString('en-US');
    if (userId) {
        urlDatabase[newshortURL] = {
            shortURL: newshortURL,
            longURL: longURL,
            userID: userId,
            counter: 0,
            dateCreate: now,
        };
        res.redirect('/urls/' + newshortURL);
    } else {
        res.status(400).send('<h2>Please <a href="/login">login</a> to access your urls.</h2>');
    }
  });

app.post("/urls/:id", (req, res) => {
    const user = users[req.session.user_id];
    let currentURL = urlDatabase[req.params.id].longURL;
    let newlongURL = req.body.longURL;
    if (!user) {
        res.status(400).send('<h2>Please <a href="/login">login</a> to access your urls.</h2>');
    } else if (user.id !== urlDatabase[req.params.id].userID) {
        res.send('<h2>You have no access to this Url. <a href="/urls">Go Back</a></h2>');
    } else { 
        urlDatabase[req.params.id].longURL = newlongURL;
        res.redirect('/urls');
    }
});

app.post("/urls/:id/delete", (req, res) => {
    const UrlObj = urlDatabase[req.params.id];
    const user = users[req.session.user_id];
    if (!user) {
        res.status(401).send('<h2>Please <a href="/login">login</a> to access your urls.</h2>');
    } else if (user.id !== urlDatabase[req.params.id].userID) {
        res.send('<h2>You have no access to this Url. <a href="/urls">Go Back</a></h2>');
    } else {
        delete urlDatabase[req.params.id];
        res.redirect('/urls');
    }
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let result = findUser(email, password);
    
    if(result){  
    req.session.user_id = result.id;
    res.redirect('/urls');
  } else {
    //user id and password didnt match
    res.status(403).send('Password or email address incorrect. Please try again');
  }
});

app.post("/logout", (req, res) => {
    req.session.user_id = null;
    //res.clearCookie("user_id");
    res.redirect('/urls');
  });

app.post("/register", (req, res) => {
    let userID = generateRandomString();
    const password = req.body.password;
    const encrytPassword = bcrypt.hashSync(password, 10);
    let userVars = {
        id: userID,
        email: req.body.email,
        password: encrytPassword
    };
    //if email or password is blank
    if (!userVars.email || !userVars.password) {
        res.status(400).send('Please enter both an email and password to register.');
    //if email exist
    } else if (checkEmail(req.body.email)) {
        res.status(400).send('Email already exists. Please enter another.');
    } else {
    // insert userVars into database
        users[userID] = userVars;
        req.session.user_id = userID;
        res.redirect('/urls');
    }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//functions

function generateRandomString() {
    let result = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++) result += possible.charAt(Math.floor(Math.random() * possible.length));
    return result;
  };

  //check to see if email already exist
function checkEmail(email) {
    for (var userID in users) {
      if (users[userID].email === email) return true;
    }
    return false;
  };

  // function to authenticate the user
  function findUser(email, password) {
    for (let user in users) {
      if (users[user].email === email && (bcrypt.compareSync(password, users[user].password))) {
        return users[user];
      }
    }
  }

  function urlsForUser(id) {
    const urls = {};
    for (let shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === id) {
        urls[shortURL] = urlDatabase[shortURL];
      }
    }
    return urls;
  }