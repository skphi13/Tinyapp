var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// middleware
app.set("view engine", "ejs");


var urlDatabase = {
    "b2xVn2": {
      shortURL: "b2xVn2",
      longURL: "http://www.lighthouselabs.ca",
    
    },
    "9sm5xK": {
      shortURL: "9sm5xK",
      longURL: "http://www.google.com",
    }
};

app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
    }
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
      };
      res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    let templateVars = { shortURL: req.params.id };
    res.render("urls_show", templateVars);
});

// redirect short urls to long urls
app.get("/u/:shortURL", (req, res) => {
    if (urlDatabase[req.params.shortURL] === undefined) {
      res.redirect(404, "/urls/new");
    } else {
      let longURL = urlDatabase[req.params.shortURL].longURL; 
      
      console.log(longURL)
      res.status(302);
      res.redirect(longURL);
    }
  });
app.post("/urls", (req, res) => {
    console.log(req.body);  // debug statement to see POST parameters
    res.send("Ok");         // Respond with 'Ok' (we will replace this)
  });




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//functions

function generateRandomString() {
    let result = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++) output += possible.charAt(Math.floor(Math.random() * possible.length));
    return result;
  };