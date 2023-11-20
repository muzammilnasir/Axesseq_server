const express = require('express')

const { deleteRepo, createRepo, getRepository, recentlyOpen, getRecently } = require('../controllers/repositoryController')

const router = express.Router()


router.get('/get-repositories', getRepository)
router.get('/get-recently-repos', getRecently)
router.post('/create-repository', createRepo)
router.post('/recently/:repoId', recentlyOpen)
router.delete('/repository/:repoId', deleteRepo)


module.exports = router;