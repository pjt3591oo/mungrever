// rustc test.rs
// ./test

use std::{thread, time};

fn main() {
  let ten_millis = time::Duration::from_millis(1000);
  loop {
    println!("hello world");
    thread::sleep(ten_millis);
 }
}