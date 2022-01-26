const express = require("express");
const app = express();
const expressLayout = require("express-ejs-layouts");
const port = process.env.PORT || 5000;
const { loadPath, findContact, addContact, checkDuplikasi, deleteContact, updateContact } = require("./utility/contacts");
const { body, validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

// setup
app.set("view engine", "ejs");
app.use(expressLayout);
app.use(express.static("public"));
// untuk parse data json
app.use(express.urlencoded({ extended: true }));
// setup session
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
// root dan routing
app.get("/", (req, res) => {
  res.render("home", {
    tittle: "Home Page",
    layout: "layouts/main-layout",
  });
});
app.get("/about", (req, res) => {
  res.render("about", {
    tittle: "About Page",
    layout: "layouts/main-layout",
  });
});
app.get("/contact", (req, res) => {
  const contacts = loadPath();
  res.render("contact", {
    tittle: "Contact Page",
    layout: "layouts/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
});
app.get("/contact/add", (req, res) => {
  res.render("add", {
    tittle: "Add New Contact",
    layout: "layouts/main-layout",
  });
});
app.post(
  "/contact",
  [
    body("nama").custom((value) => {
      const duplikasi = checkDuplikasi(value);
      if (duplikasi) {
        throw new Error("Nama sudah Terdaftar");
      }
      return true;
    }),
    check("email", "email tidak valid!!").isEmail(),
    check("ponsel", "nomor ponsel tidak valid!!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      // return res.status(400).json({ error: error.array() });
      res.render("add", {
        tittle: "Add New Contact",
        layout: "layouts/main-layout",
        error: error.array(),
      });
    } else {
      addContact(req.body);
      req.flash("msg", "Contact Berhasil Di Tambahkan");
      res.redirect("/contact");
    }
  }
);
app.get("/contact/delete/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  if (!contact) {
    res.status(404).send("HALAMAN TIDAK DI TEMUKAN");
  } else {
    req.flash("msg", "Contact Berhasil Di Hapus");
    deleteContact(req.params.nama);
    res.redirect("/contact");
  }
});
app.get("/contact/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  res.render("edit", {
    tittle: "Ubah data contact",
    layout: "layouts/main-layout",
    contact,
  });
});
app.post(
  "/contact/update",
  [
    body("nama").custom((value, { req }) => {
      const duplikasi = checkDuplikasi(value);
      if (value !== req.body.oldNama && duplikasi) {
        throw new Error("Nama sudah Terdaftar");
      }
      return true;
    }),
    check("email", "email tidak valid!!").isEmail(),
    check("ponsel", "nomor ponsel tidak valid!!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      // return res.status(400).json({ error: error.array() });
      res.render("edit", {
        tittle: "Add New Contact",
        layout: "layouts/main-layout",
        error: error.array(),
        contact: req.body,
      });
    } else {
      updateContact(req.body);
      req.flash("msg", "Contact Berhasil Di Update");
      res.redirect("/contact");
    }
  }
);
app.get("/contact/:nama", (req, res) => {
  const find = findContact(req.params.nama);
  res.render("detail", {
    tittle: "contact detail page",
    layout: "layouts/main-layout",
    find,
  });
});

app.use("/", (req, res, next) => {
  res.status(404).end("HALAMAN TIDAK DI TEMUKAN");
  next();
});

app.listen(port, () => {
  console.log(`Server Running On http://localhost:${port}`);
});
