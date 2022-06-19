const http = require('http');

let count = 0;

console.log(`I a'm server`)

const server = http.createServer(function (req, res) {
  console.log(`[example/simple-server1.js] ${++count}`)
  res.writeHead(200, {'Content-Type': 'text/html'});
  if (count % 2 === 0) {
    throw 'error 에러발생~'
  } else {
    res.end('<h1 style="color: green;">Hello World ~~@!##@</h1>');
  }
})

server.listen(3000, () => {
  console.log('server running');
})
