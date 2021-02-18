const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AuthorModel = require("../authors/schema");
const { authenticate } = require("./index");

passport.use(
  "google",
  new GoogleStrategy(
    {
      //STATES THE THIRD PARTY AS GOOGLE
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:9001/authors/3rdParty/google/Redirect", //SEND THE DATA FROM GOOGLE TO THIS URL, A ROUTE IN OUR BACKEND
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);
        const author = await AuthorModel.findOne({ email: profile.email });
        if (!author) {
          const newAuthor = {
            name: profile.name.givenName,
            img: profile.photos[0].value,
            email: profile.emails[0].value,
            tokenArray: [],
          };
          const createdAuthor = new AuthorModel(newAuthor);
          await createdAuthor.save();
          const tokens = await authenticate(createdAuthor);
          done(null, { author: createdAuthor, tokens }); //NULL IS ERROR RESPONSE, OBJECT IS SUCCESS RESPONSE
        } else {
          const tokens = await authenticate(author);
          done(null, { author, tokens });
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser(function (user, next) {
  next(null, user);
});
