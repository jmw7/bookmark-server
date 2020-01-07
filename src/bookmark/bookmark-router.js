const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger')
const bookmarks = require('../store')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
  .route('/bookmarks')
  .get((req, res) => {
    res.status(200).json(bookmarks)
  })
  .post(bodyParser, (req, res) => {
    const { title, url, rating, desc = "" } = req.body;

    if (!title) {
      logger.error('Title is required')
      return res.status(400).send('Invalid data')
    }
    if (!url) {
      logger.error('Url is required')
      return res.status(400).send('Invalid data')
    }
    if (!rating) {
      logger.error('Rating is required')
      return res.status(400).send('Invalid data')
    }

    const id = uuid();
    const bookmark = { id, title, url, rating, desc };

    bookmarks.push(bookmark)

    logger.info(`Created bookmark with id ${id}`)

    return res.status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  })

bookmarkRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(b => b.id == id)

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found`)
      res.status(404).send('Not found')
    }

    res.json(bookmark)
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.id == id)

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark not found with id ${id}`)
      return res.status(404).send('Bookmark not found')
    }

    bookmarks.splice(bookmarkIndex, 1);
    logger.info(`Deleted bookmark with id ${id}`);
    res.status(204).end()
  })

module.exports = bookmarkRouter