const http = require('http');

let count = 0;

console.log(`I a'm server`)

const server = http.createServer(function (req, res) {
  console.log(`[example/simple-server.js] ${++count}`)
  res.writeHead(200, {'Content-Type': 'text/html'});
  if (count % 2 === 0) {
    throw 'error 강제발생'
  } else {
    res.end('<h1>Hello World</h1>');
  }
})

server.listen(1337, () => {
  console.log('server running');
})
