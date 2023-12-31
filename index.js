    const express = require('express')
    const morgan = require('morgan')
    const cors = require('cors')
    const bodyParser = require('body-parser')
    const routes = require('./config/routes')


    const app = express()

    app.use(morgan('dev'))
    app.use(bodyParser.urlencoded({extended: false}))
    app.use(express.json())
    app.use(cors())
    app.use(routes)

    
    app.listen(8080, () => {
        console.log('Express started at http://26.17.6.4:8080') 
        //console.log('Express started at http://147.135.88.99:8080')
        //console.log('Express started at http://localhost:8080')
    })