
***INDEX.JS******

const express = require('express');
const PORT = 3000;
const app = express();
const router = require('./router');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');



//Setting up our logs
const log_token = '[:date] at :url Status::status in :response-time[2]/ms'
const accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})
const logger = morgan(log_token,{stream:accessLogStream});


app.use(logger);
app.use('/api',router);
app.use(express.static('public'));

app.get('/',(req,res)=>{
    res.send('<h1>Helllllllo</h1>');
})

app.get('/api/dogs',(req,res,next)=>{
        res.json({
            breed: 'Border Collie',
            age: 5,
            name:'Good boi',
            color: 'brown'
        })

        next();
})


app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})


***ROUTER.JS****

const express = require('express');
const router = express.Router();

const collection = [];

//Set up our logging middleware
router.use((req,res,next)=>{
    //loggging logic goes here
    console.log('Something going on!');
    next();
});

router.get('/', (req,res)=>{
    res.json({message:'Api landing'})
})

//* Additional Routes *//
router.route('/dogs')

.post((req,res)=>{
    const incoming = [];
    req.on('data',data=>{
        incoming.push(data);
    })
    req.on('end',()=>{
        const rawdata = incoming.join('');
        const parsed = JSON.parse(rawdata);
        collection.push(parsed);
        console.log(collection);
    })
    res.json({ message: 'Dog created!' });
})


module.exports = router;



*** Consume Dogs ****
const http = require('http');
const axios = require('axios');

//This is a function for consuming a rest API with a promisified version of the node HTTP module, the main benefit of this is it requires no dependencies
const getContent = url =>{
    return new Promise((resolve,reject)=>{
        const lib = url.startsWith('https') ? require('https') : require('http');
        lib.get(url, (response)=>{
            if(response.statusCode != 200){
                reject(new Error(`Failed to load page: ${response.statusCode}`))
            }

            const body = [];
            response.on('data',(chunk)=>body.push(chunk));
            response.on('end',()=>{
                const rawtext = body.join('');
                const output = JSON.parse(rawtext)
                resolve(output);
            });
        })
    })
}


//Simple example of consuming a rest API first using axios
axios.get('http://localhost:3000/api/dogs')
.then(res=>{
    console.log(res.data.name);
})

axios.post('http://localhost:3000/api/dogs', {
    breed: 'German Shepard',
    age: 10,
    name:'Litty',
    color: 'red'
})
.then(res=>{
    console.log(res.data.message);
})

//This is how to consume a rest API using the deafult http node module
http.get('http://localhost:3000/api/dogs',(res,err)=>{
    let {statusCode : stat } = res; 
    res.setEncoding('utf8');
    let rawdata = '';
    res.on('data',(chunk)=>{rawdata+=chunk;});
    res.on('end',()=>{
        let parsed = JSON.parse(rawdata);
        console.log(parsed.age);
    })
})

//Using our custom request method, which mimics axios.get
getContent('http://localhost:3000/api/dogs')
.then(res=>{
    console.log(res.breed);
})


const test_logger = time =>{
    setInterval(()=>{
        getContent('http://localhost:3000/api/dogs')
        .then(res=>{
            console.log(res.breed);
        })
    },time)
}

test_logger(1000);

**** package.json ****

{
  "name": "cool-server",
  "version": "1.0.0",
  "description": "a basic rest API",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "nodemon index.js"
  },
  "author": "Colin R. Casto",
  "license": "ISC",
  "dependencies": {
    "axios": "^0.18.0",
    "express": "^4.16.3",
    "morgan": "^1.9.1",
    "nodemon": "^1.18.4",
    "save": "^2.3.2"
  }
}

