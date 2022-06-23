// go run test.go
package main

import "fmt"
import "time"

func main() {
	for true {
		fmt.Println("Hello world")
		time.Sleep(time.Second * 1)
	}
}