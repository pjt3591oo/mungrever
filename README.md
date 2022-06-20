# mungrever 

mungrever는 forever를 모방한 프로세스 관리 도구입니다.

```bash
$ npm install -g mungrever
```

```bash
$ mungrever help
Usage: mungrever [options] [command]

CLI to process management

Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  start [options] <string>  create process by [*.js]
  log <number>              view log by process index
  delete <number>           process delete by process index
  list
  help [command]            display help for command
```

* 프로세스 생성

```js
// example/simple-server.js
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
```

```bash
$ mungrever start example/simple-server.js
```

* 프로세스 목록조회

```bash
$ mungrever list
```

* 프로세스 삭제

```bash
$ mungrever delete [index]
```

* 프로세스 로그

```bash
$ mungrever log [index]
```

### dev

* install

```bash
$ git clone https://github.com/pjt3591oo/mungrever.git

$ cd mungrever

$ npm install -g .
```

```bash
$ mungrever help
Usage: mungrever [options] [command]

CLI to process management

Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  start [options] <string>  create process by [*.js]
  log <number>              view log by process index
  delete <number>           process delete by process index
  list
  help [command]            display help for command
```

* 프로세스 생성

```bash
$ node lib/index.js start example/simple-server.js

# or

$ mungrever start example/simple-server.js
```

```bash
$ node lib/index.js start example/simple-server1.js

# or

$ mungrever start example/simple-server1.js
```

* 프로세스 목록조회

```bash
$ node lib/index.js list

# or

$ mungrever list
```

* 프로세스 삭제

```bash
$ node lib/index.js delete [index]

# or

$ mungrever delete [index]
```

* 프로세스 로그

```bash
$ node lib/index.js log [index]

# or

$ mungrever log [index]
```