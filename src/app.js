require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const passport = require("passport");
const helmet = require("helmet");
const compression = require("compression");
const minifyHTML = require("express-minify-html");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
require("./config/passport"); // Initialize Passport configuration
const assignVersion = require("./middlewares/assignVersion"); // Assign Version to response

// Import main router
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Database connection
connectDB();

// 2) Global middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(assignVersion);
app.use(
  minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true,
      minifyJS: true,
    },
  })
);

// 3) Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      // In production, set to true when behind HTTPS
      // secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
    store: MongoStore.create({
      mongoUrl: process.env.DB_URI,
      dbName: process.env.DB_NAME,
      stringify: false,
    }),
  })
);

// 4) Flash messages
app.use(flash());

// 5) Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// 6) View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 7) Static files
app.use(express.static(path.join(__dirname, "public")));

// 8) Routes
app.use("/", routes);

// 9) Error handling - 404
app.use((req, res, next) => {
  res.status(404).render("error", { message: "Page not found." });
});

// 10) Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
