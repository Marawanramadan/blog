//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const lodash = require('lodash');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose"); 



const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static("public"));
app.use(session({                       //1-setting up our app to use sessions
  secret : "secret key",
  resave : false,
  saveUninitialized : false,
}))
app.use(passport.initialize())          //2-telling passpor package to start
app.use(passport.session())             //3-telling passport to use sessions
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();})
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();})
// mongoose.connect('mongodb+srv://Marawan:sonofwar2013@blog-9yy9b.mongodb.net/postDB', {useNewUrlParser: true,useUnifiedTopology: true,  useCreateIndex: true});
mongoose.connect('mongodb://localhost:27017/postDB', {useNewUrlParser: true,useUnifiedTopology: true,  useCreateIndex: true});
mongoose.connect('mongodb://localhost:27017/user2DB', {useNewUrlParser: true,useUnifiedTopology: true,  useCreateIndex: true});

const postSchema = new mongoose.Schema({
  
  title : String,
  post: String
})
const userSchema = new mongoose.Schema({
  username : String,
  email : String,
  password : String,
})

userSchema.plugin(passportLocalMongoose);         //4-to hash and salt passwords and save users to our database

const Post = mongoose.model("Post",postSchema);
const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());               //5-creating a cookie for each user and authenticating them
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


app.get("/",function(req,res){
  Post.find({},function(err,foundList){
    res.render("home",{startingContent:homeStartingContent,post:foundList});
    console.log(req.user);
    console.log(req.isAuthenticated());
  })

})

app.get("/about",function(req,res){
  res.render("about",{aboutContent:aboutContent})
})

app.get("/posts/:postId",function(req,res){
  Post.find({},function(err,foundList){
    foundList.forEach(function(post){
      if(req.params.postId === post.title){
        res.render("post",{
          title:post.title,
          blog:post.post
        });
      }
    })
  })
});

app.get("/contact",function(req,res){
  res.render("contact",{contactContent:contactContent})
})

app.get("/compose",function(req,res){
  res.render("compose");
})

app.get("/login",function(req,res){
  res.render("login");
})

app.get("/register",function(req,res){
  res.render("register");
})

app.get("/logout",function(req,res){
  req.logout();
  req.session.destroy();
  res.redirect("/");
})

app.post("/compose",function(req,res){
      const post = new Post({
        title:req.body.Title,
        post:req.body.blog
    })


  post.save(function(err){
    if(!err){
      res.redirect("/");

    }
  });
})

app.post("/register",function(req,res){
  User.register({email:req.body.email,username:req.body.username},req.body.password,function(err,user){
      if(err){
          console.log(err)
          res.redirect("/register")
      }
      else{
          passport.authenticate("local",{ successRedirect: '/', failureRedirect: '/login', })(req,res,function(){
              res.redirect("/");
          })
      }
  })
  
})

app.post("/login",function(req,res){
  const user = new User({
      email:req.body.email,
      username:req.body.username,
      password:req.body.password
  })

  req.logIn(user,function(err){
      if(err){
          console.log(err)
      }
      console.log(req.user);
      delete req.user.password;
      console.log(req.user);
      console.log(req.isAuthenticated())
      return res.redirect("/");
      
  })
})
  







app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
