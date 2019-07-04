var express                 = require('express');
var mongoose                = require("mongoose");
var User                    = require("./models/user");
var passport                = require("passport");
var bodyParser              = require("body-parser");
var LocalStrategy           = require("passport-local");
var passportLocalMongoose   = require("passport-local-mongoose");
mongoose.connect('mongodb+srv://abc:123@cluster0-0k8eh.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true}, function(err) {
    if (!err) {
        console.log("Connecting to database...");
    }
    else {
        console.log("No database...")
    }
});

var app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(require("express-session")({
    secret: "abcdefg",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res) {
    res.render("home");
});

//SECRET
app.get("/secret",isLoggedIn,isUser, function(req, res) {
    User.find({}, function(err, user) {
        if (err) throw err;
        res.render("secret", {"Userdata":user})
    });
});

function isUser(req, res , next) {
    User.findOne({"role": "User"}, (err, user) => {
        if(user) {
            res.render("userpage");
        }
    });
};

app.get("/register", function(req, res) {
    res.render("register");
});

//REGISTER ROUTES
app.post("/register", function(req, res) {
    req.body.username
    req.body.firstname
    req.body.lastname
    req.body.password
    User.register(new User({username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname, role: req.body.role}), req.body.password, function(err, user) {
        if(err) {   
            console.log(err);
            return res.render('register');
        } 
        passport.authenticate("local")(req,res,function() {
            res.redirect("/secret");
        });  
    });
});
//EDIT
app.get("/edit/:id", (req, res) => {
    User.findById(req.params.id, (err, doc) => {
       if(err) throw err;
       res.render("edit", {
           data: doc
       }) 
    });
});

app.post("/edit/:id",(req, res) => {
   User.updateOne({_id: req.params.id},{username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname}, (err, user) => {
       if (err) throw err;
       res.redirect("/secret");
   });
   
});
//DELETE
app.get("/delete/:id", (req, res) => {
   User.findByIdAndDelete(req.params.id, (err, doc) => {
        if(err) throw err;
        res.redirect("/secret");
   });
});

//LOGIN ROUTES

app.get("/login",LoggedIn, function(req, res) {
   res.render("login")
});

app.post("/login",passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res) { 
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};

function LoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect("/secret");
    }
    else {
        res.render("login");
    }
};
//USERLIST  
// app.get("/list", function(req, res) {
//     User.find({}).exec(function(err, users) {
//         if(err) throw err;
//         res.render("list", {Userdata:users});
//     });
// });

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is starting.....");
});