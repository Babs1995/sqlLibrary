const express = require("express");
const router = express.Router();
const Book = require("../models").Book;
const limit = 5;
const { Op } = require("sequelize");

/* Async handler from Treehouse. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}







router.get(
  "/books",
  asyncHandler(async (req, res) => {
    const allBooks = await Book.findAll({
      order: [["createdAt", "DESC"]],
    });

    const pages = Math.ceil(allBooks.length / limit);
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    let search = false;
    const books = allBooks.slice((page - 1) * limit, limit * page);
    res.render("index", { books, pages, page });
  })
);




router.post(
  "/books",
  asyncHandler(async (req, res) => {
    const { search } = req.body;
    const allBooks = await Book.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            author: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            genre: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            year: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
      order: [["createdAt", "DESC"]],
    });
    
    const pages = Math.ceil(allBooks.length / limit);
    let page = 1;
    console.log(req.query.page);
    if (req.query.page) {
      page = req.query.page;
    }
   
    const books = allBooks.slice((page - 1) * limit, limit * page);
    res.render("index", { books, pages, page, search });
  })
);

router.get(
  "/books/new",
  asyncHandler(async (req, res) => {
    res.render("new-book", { book: {} });
  })
);

/* Posts a new book to the database */
router.post(
  "/books/new",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect("/books/");
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        res.render("new-book", { book: book.dataValues, errors: error.errors });
      } else {
        throw error;
      }
    }
  })
);

router.get(
  "/books/:id",
  asyncHandler(async (req, res, next) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render("update-book", { book });
    } else {
      res.render("page-not-found", { title: "Page Not Found" });
    }
  })
);

router.post(
  "/books/:id",
  asyncHandler(async (req, res, next) => {
    let book;
    try {
      book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect("/books/");
      } else {
        res.render("page-not-found");
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", { book, errors: error.errors });
      } else {
        throw error;
      }
    }
  })
);

router.post(
  "/books/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

module.exports = router;