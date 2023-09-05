    const express = require('express')
    const routes = express.Router()
    const jwt = require('jsonwebtoken');
    let app = express();
    const morgan = require('morgan');
    const moment = require('moment-timezone');
    const bodyParser = require('body-parser');
    const rfs = require('rotating-file-stream');
    const mysql = require('mysql2');

    //Configuração de conexão do banco
    var config =
    {
        host: '127.0.0.1',
        user: 'root',
        password: 'fat0516fat',
        database: 'clientes',
        port: 3306,
        ssl: false
    };

    function getDateString() {
        const date = new Date()
        const year = date.getFullYear()
        const month = `${date.getMonth() + 1}`.padStart(2, '0')
        const day = `${date.getDate()}`.padStart(2, '0')
        const hour = `${date.getHours()}`.padStart(2, '0')
        const min = `${date.getMinutes()}`.padStart(2, '0')
        const sec = `${date.getSeconds()}`.padStart(2, '0')
        const milisec = `${date.getMilliseconds()}`.padStart(2, '0')
        return `${year}${month}${day}${hour}${min}${sec}${milisec}`
      }

    //Cria conexão
    const conn = new mysql.createPool(config);

    //Midware para autenticação
    function verifyJWT(req, res, next) {
        var token = req.headers['x-access-token'];
        if (!token) return res.status(401).send({ autenticado: false });
      
        jwt.verify(token, 'xxxxxxx', function (err, decoded) {
          if (err) return res.status(500).send({ autenticado: false, menssagem: 'Falha na autenticação.' });
      
          req.userId = decoded.id;
          next();
        });
      }

    // Define Timezone
    morgan.token('date', (req, res, tz) => {
        return moment().tz(tz).format();
    })
      
    app.set('trust proxy', true)
      
    routes.use(morgan('[:date[America/Sao_Paulo]] :remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length]', { stream: accessLogStream }))
    routes.use(bodyParser.json());
    routes.use(bodyParser.urlencoded({ extended: false }));
    routes.use(express.urlencoded({ extended: false }));
      
    routes.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST');
        next();
      });

    var accessLogStream = rfs.createStream(`access_${getDateString()}.log`, {
        interval: '1d', // rotate daily
        path: 'logs'
    })

    //autenticação
    routes.post('/login', (req, res) => {
        if (req.body.user === 'registro' && req.body.pwd === 'xxxxxxx') {
        const id = req.params.id;
        var token = jwt.sign({ id }, 'xxxxxx', {
            expiresIn: 60
        });
        res.status(200).send({ auth: true, token: token });
        } else {
        res.status(500).send('Login inválido!');
        }
    })

    //API de retorno    
    routes.get('/cnpj/:cnpj/:produto', async (req, res) => {
        const promisePool = conn.promise()
        try {
            const [rows] = await promisePool.execute(`select ativo from clientes where cnpj = ? and produto = ?`, 
                                                     [req.params.cnpj, req.params.produto])
            return res.status(200).json(rows[0])
        } catch (err) {
            console.log(err)
        } finally {
            conn.releaseConnection(promisePool)
        }
    })

    
    module.exports = routes