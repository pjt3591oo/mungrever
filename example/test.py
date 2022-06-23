# python test.py

import time
import sys

def print(msg):
    sys.stdout.write(f'{msg}\n')
    sys.stdout.flush()

while True:
    print('hello world')
    time.sleep(1)