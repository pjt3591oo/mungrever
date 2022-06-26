# mungrever 

mungrever는 forever를 모방한 프로세스 관리 도구입니다.

[npm](https://www.npmjs.com/package/mungrever)

### 설치

* install

```bash
$ npm install -g mungrever
```

* commands

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
  list                      managed process lise
  monit <number>            show log monitor
  help [command]            display help for command
```

* start options 

```bash
$ mungrever help start
Usage: mungrever start [options] <string>

create process by [*.js]

Arguments:
  string                   *.js

Options:
  -c, --command <string>   COMMAND to execute (defaults to node)
  -i --instances <number>  launch [number] instances (for networked app)(load balanced)
  -w, --watch              Watch for file changes
  -d, --debug              Forces forever to log debug output
  -h, --help               display help for command
```

### 프로세스 생성

* 샘플 서버코드

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

* 프로세스 생성

```bash
$ mungrever start example/simple-server.js
```

* 디버그 모드

디버그 모드는 모니터 프로세스로 동작중인 프로세스의 출력(표준출력/에러)을 터미널 세션으로 출력

```bash
$ mungrever start example/simple-server.js -d
```

* 와치모드

와치 모드는 실행중인 스크립트가 존재하는 디렉터리를 기준으로 변경이 감지되면 스크립트 재시작.

와치 모드는 기본적으로 디버깅 모드로 동작한다.

```bash
# 와치 모드
$ mungrever start example/simple-server.js -w
```

* 기타 커맨드 실행

```bash
# rust 프로세스
$ mungrever start ./ -c './example/test'

# golang 프로세스
$ mungrever start ./ -c 'go run ./example/test.go'

# python 프로세스
$ mungrever start ./ -c 'python ./example/test.py'
```

* 클러스터 모드

클러스터 모드로 생성된 프로세스는 exception 등으로 종료될 경우 다시 실행되며, 외부 signal로 인해 죽을경우 다시 생성하지 않으며 종료된 프로세스는 제거됩니다

```bash
$ mungrever start example/simple-server.js -i [인스턴스 수]
```

### 프로세스 목록조회

```bash
$ mungrever list
```

### 프로세스 삭제

클러스터 모드의 프로세스가 삭제될 경우 해당 인스턴스는 모두 삭제된다

```bash
$ mungrever delete [index]
```

### 프로세스 로그

클러스터 모드의 프로세스는 개별적인 PID를 할당받으므로, 개별적으로 로그가 관리된다

```bash
$ mungrever log [index]
```

### 프로세스 로그 모니터링

클러스터 모드의 프로세스는 개별적인 PID를 할당받으므로, 개별적으로 로그가 관리된다

```bash
$ mungrever monit [index]
```

---

### dev

##### install

```bash
$ git clone https://github.com/pjt3591oo/mungrever.git

$ cd mungrever

$ npm install -g . # 소스코드를 이용하여 global module 설치
$ npm uninstall -g mungrever # 설치된 mungrever 제거
```

##### commands

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
  list                      managed process lise
  monit <number>            show log monitor
  help [command]            display help for command
```

##### start options

```bash
$ mungrever help start
Usage: mungrever start [options] <string>

create process by [*.js]

Arguments:
  string                   *.js

Options:
  -c, --command <string>   COMMAND to execute (defaults to node)
  -i --instances <number>  launch [number] instances (for networked app)(load balanced)
  -w, --watch              Watch for file changes
  -d, --debug              Forces forever to log debug output
  -h, --help               display help for command
```

##### 프로세스 생성

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

* 디버그 모드

```bash
$ node lib/index.js start example/simple-server1.js -d

# or

$ mungrever start example/simple-server1.js -d
```

* 와치 모드

```bash
$ node lib/index.js start example/simple-server1.js -w

# or

$ mungrever start example/simple-server1.js -w
```

* 기타 커맨드 실행

```
$ node lib/index.js start ./ -c './example/test'

$ node lib/index.js start ./ -c 'go run ./example/test.go'

$ node lib/index.js start ./ -c 'python ./example/test.py'
```

* 클러스터 모드

```bash
$ node lib/index.js start example/simple-server.js -i [인스턴스 수]
```

##### 프로세스 목록조회

```bash
$ node lib/index.js list

# or

$ mungrever list
```

##### 프로세스 삭제

```bash
$ node lib/index.js delete [index]

# or

$ mungrever delete [index]
```

##### 프로세스 로그

```bash
$ node lib/index.js log [index]

# or

$ mungrever log [index]
```

##### 프로세스 모니터링

```bash
$ node lib/index.js monit [index]

# or

$ mungrever monit [index]
```

