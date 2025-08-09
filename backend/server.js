
import express from "express";
import session from "express-session";

import path from "path";
import { fileURLToPath } from "url";

import pageRoutes from "./routes/pageRoutes.js";
import authRoutes from "./routes/auth.js";
import toolsRoutes from "./routes/tools.js";
import reviewsRoutes from "./routes/reviews.js";

import { errorHandler } from "./middleware/errorHandler.js";
import { xssSanitizer } from "./middleware/xssSanitizer.js";

import exphbs from "express-handlebars";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xssSanitizer);

app.use(
  session({

    secret: "secret-key-that-we-cs546_final_project_credential",
    resave: false,
    saveUninitialized: false,
  })
);

// 设置Handlebars
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "../frontend/public")));

app.use("/", pageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tools", toolsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use(errorHandler);


app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
