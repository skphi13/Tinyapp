const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');



app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

// middleware
app.set("view engine", "ejs");


let urlDatabase = {
    "b2xVn2": {
      shortURL: "b2xVn2",
      longURL: "http://www.lighthouselabs.ca",
      userID: "userRandomID",
    
    },
    "9sm5xK": {
      shortURL: "9sm5xK",
      longURL: "http://www.google.com",
      userID: "user2RandomID",
    }
};

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }

// GET
app.get("/register", (req, res) => {
    res.render("register");
    
});
app.get("/", (req, res) => {
    const user = users[req.cookies.user_id];
    if (!user) {
      res.redirect(403, "/login");
      return;
    }
    res.redirect("/urls");
  });

app.get("/urls", (req, res) => {
    let userId = req.cookies.user_id;
    let user = users[userId];
    // console.log(userId)
    if(userId) {

        let templateVars = {
            urls: urlsForUser(userId),
            user: user
        };
    res.render("urls_index", templateVars);
   } else {
    res.status(400).send('Please login or register.');
   }
});

app.get("/urls/new", (req, res) => {
    let templateVars = {
        user: users[req.cookies.user_id]
    };
    if (templateVars.user === undefined) {
        res.status(403);
        res.redirect("/login");
    }
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    const user = users[req.cookies.user_id];
    //console.log("uswrid", user)
    if (user.id !== urlDatabase[req.params.id].userID) {
        
        res.send("Not your urls");
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
      res.redirect(404, "/urls/new");
    } else {
      let longURL = urlDatabase[req.params.shortURL].longURL; 
      
      //console.log(longURL)
      res.status(302);
      res.redirect(longURL);
    }
  });

app.get("/login", (req, res) => {

    res.render('login');
    
  });

//POST 
app.post("/urls", (req, res) => {
    let newshortURL = generateRandomString();
    let longURL = req.body.longURL;
    let userId = req.cookies.user_id;
    let user = users[userId];
    if (userId) {
        urlDatabase[newshortURL] = {
        shortURL: newshortURL,
        longURL: longURL,
        userID: userId
        };
        res.redirect('/urls/' + newshortURL);
    } else {
        res.status(400).send('Please login to access your urls.');
    }
  });

app.post("/urls/:id", (req, res) => {
    let currentURL = urlDatabase[req.params.id].longURL;
    //console.log(currentURL)
    let newlongURL = req.body.longURL;
    //console.log(req.body.longURL)
    //console.log(req.params)
    urlDatabase[req.params.id].longURL = newlongURL;
    
    res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
    const UrlObj = urlDatabase[req.params.id];
    if(UrlObj.userID === req.cookies.user_id) {
        delete urlDatabase[req.params.id];
        res.redirect('/urls');
    } else {
        res.status(403).send('You can only delete your own urls.');
  }
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let result = findUser(email, password);
    
    if(result){  
    //user id and password matched
    res.cookie('user_id', result.id);
    //console.log(result);
    res.redirect('/urls');
  } else {
    //user id and password didnt match
    res.status(403).send('Password or email address incorrect. Please try again');
  }
});

app.post("/logout", (req, res) => {
    res.clearCookie("user_id");
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
    res.cookie('user_id', userID);
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