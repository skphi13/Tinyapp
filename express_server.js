const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

// GET

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
    let shortURL = req.params.id;
    let templateVars = {
      urlObj: urlDatabase[req.params.id]
    }
    //console.log(shortURL)
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