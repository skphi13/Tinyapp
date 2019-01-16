const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");



app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

// middleware
app.set("view engine", "ejs");


let urlDatabase = {
    "b2xVn2": {
      shortURL: "b2xVn2",
      longURL: "http://www.lighthouselabs.ca",
    
    },
    "9sm5xK": {
      shortURL: "9sm5xK",
      longURL: "http://www.google.com",
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
    // if(userId) {
        let templateVars = {
        urls: urlDatabase,
        user: user
    };
    
    res.render("urls_index", templateVars);
//   } else {
//     res.status(400).send('Please login or register to view your urls.');
//   }
});

app.get("/urls/new", (req, res) => {
    let userId = req.cookies.user_id;
    let user = users[userId];
    let templateVars = {
        urls: urlDatabase,
        user: user
      };
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    let userId = req.cookies.user_id;
    let user = users[userId];
    let templateVars = {
      urlObj: urlDatabase[req.params.id],
      user: user,
    };
    //console.log(urls);
    res.render("urls_show", templateVars);
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
    console.log(longURL)
    
    urlDatabase[newshortURL]= {
    shortURL: newshortURL,
    longURL: longURL
    };
    console.log(urlDatabase[newshortURL])
    res.redirect('/urls/' + newshortURL);
  });

app.post("/urls/:id", (req, res) => {
    let currentURL = urlDatabase[req.params.id].longURL;
    console.log(currentURL)
    let newlongURL = req.body.longURL;
    console.log(req.body.longURL)
    console.log(req.params)
    urlDatabase[req.params.id].longURL = newlongURL;
    
    res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
    const UrlObj = req.params.id;
    console.log(UrlObj)
    delete urlDatabase[UrlObj];
    res.redirect('/urls');
  });

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let result = findUser(email, password);
    
    if(result){  
    //user id and password matched
    res.cookie('user_id', result.id);
    console.log(result);
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
  
  let userVars = {
    id: userID,
    email: req.body.email,
    password: password
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
      if (users[user].email === email && users[user].password === password) {
        return users[user];
      }
    }
  }