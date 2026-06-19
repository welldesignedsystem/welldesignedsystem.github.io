+++
date = '2022-12-06T12:44:47+10:00'
draft = false
title = 'Python Quicky'
tags = ['Python']
summary = "A comprehensive guide to Python fundamentals for interviews."
+++

This guide covers all the essential Python topics you should master for technical interviews, from basic data types and control flow to advanced concepts like metaclasses, descriptors, and Python internals. It includes practical code examples, best practices, common pitfalls, and concise explanations to help you quickly revise and strengthen your understanding before interviews. Use this as a comprehensive checklist and reference to ensure you're well-prepared for any Python interview scenario, whether for general programming, data science, web development, or system design roles.

## Data Types & Structures

Python's built-in data types: int, float, complex, str, bool.
Collections: list, tuple, set, dict with mutability and time complexities for common operations.

### Basic Data Types

```python
# Numbers
x = 42          # int
y = 3.14        # float
z = 2 + 3j      # complex

# Strings
s = "Hello"
s2 = 'World'
s3 = """Multi
line"""

# Boolean
flag = True
```

### Collections

```python
# Lists (mutable, ordered)
nums = [1, 2, 3]
nums.append(4)
nums.insert(0, 0)
nums.remove(2)

# Tuples (immutable, ordered)
coords = (10, 20)
x, y = coords  # tuple unpacking

# Sets (mutable, unordered, unique)
unique_nums = {1, 2, 3}
unique_nums.add(4)
unique_nums.discard(2)

# Dictionaries (mutable, ordered in Python 3.7+)
person = {"name": "Alice", "age": 30}
person["city"] = "NYC"
```

### Time Complexity of Operations

| Operation | List | Dict | Set  | Tuple |
| --------- | ---- | ---- | ---- | ----- |
| Access    | O(1) | O(1) | N/A  | O(1)  |
| Search    | O(n) | O(1) | O(1) | O(n)  |
| Insert    | O(n) | O(1) | O(1) | N/A   |
| Delete    | O(n) | O(1) | O(1) | N/A   |
| Append    | O(1) | N/A  | N/A  | N/A   |

## Control Flow & Functions

Conditionals, loops, list comprehensions, functions, lambdas, higher-order functions.

### Conditionals & Loops

```python
# if-elif-else
if x > 0:
    print("positive")
elif x < 0:
    print("negative")
else:
    print("zero")

# for loops
for i in range(5):
    print(i)

for item in [1, 2, 3]:
    print(item)

for key, value in {"a": 1, "b": 2}.items():
    print(f"{key}: {value}")

# while loops
count = 0
while count < 5:
    print(count)
    count += 1

# List comprehensions
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
```

### Functions

```python
def greet(name, greeting="Hello"):
    """Function with default parameter"""
    return f"{greeting}, {name}!"

def sum_all(*args):
    """Variable positional arguments — *args collects extra positional args as a tuple"""
    return sum(args)

def create_profile(**kwargs):
    """Variable keyword arguments — **kwargs collects extra keyword args as a dict"""
    return kwargs

# Lambda functions — anonymous one-liner functions, useful for short throwaway operations
square = lambda x: x**2
sorted_names = sorted(["Alice", "bob", "Charlie"], key=lambda x: x.lower())

# Higher-order functions — functions that take or return other functions
def apply_operation(func, numbers):
    return [func(x) for x in numbers]

# Usage
print(greet("Alice"))                        # Hello, Alice!
print(greet("Bob", greeting="Hi"))           # Hi, Bob!
print(sum_all(1, 2, 3, 4))                  # 10
print(create_profile(name="Alice", age=30))  # {'name': 'Alice', 'age': 30}
print(square(5))                             # 25
print(apply_operation(square, [1, 2, 3]))    # [1, 4, 9]
```

## Object-Oriented Programming

Classes, inheritance, magic methods, encapsulation.

### Classes and Inheritance

```python
class Animal:
    species_count = 0  # Class variable — shared across all instances

    def __init__(self, name, age):
        self.name = name  # Instance variable — unique to each instance
        self.age = age
        Animal.species_count += 1

    def speak(self):
        raise NotImplementedError("Subclass must implement")

    @property
    def is_adult(self):
        return self.age >= 3

    @classmethod
    def get_species_count(cls):
        # cls refers to the class itself, not an instance; used to access class-level data
        return cls.species_count

    @staticmethod
    def animal_sound():
        # No access to class or instance; useful for utility functions logically grouped with the class
        return "Some generic animal sound"

class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age)  # Calls parent __init__
        self.breed = breed

    def speak(self):
        return f"{self.name} says Woof!"

# Multiple inheritance — Python uses MRO (Method Resolution Order) to determine method lookup order
class Flyable:
    def fly(self):
        return "Flying!"

class Bird(Animal, Flyable):
    def speak(self):
        return f"{self.name} says Tweet!"

# Usage
dog = Dog("Rex", 5, "Labrador")
print(dog.speak())                  # Rex says Woof!
print(dog.is_adult)                 # True (property access, no parentheses)
print(Animal.get_species_count())   # 1
print(Animal.animal_sound())        # Some generic animal sound

bird = Bird("Tweety", 2, )
print(bird.speak())                 # Tweety says Tweet!
print(bird.fly())                   # Flying!
print(Animal.get_species_count())   # 2
print(Bird.__mro__)                 # Shows method resolution order
```

### Magic Methods (Dunder Methods)

Magic methods (surrounded by double underscores) let you define how objects behave with built-in operations like `+`, `==`, `len()`, `[]`, and printing.

```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        # Called by print() and str() — human-readable representation
        return f"Vector({self.x}, {self.y})"

    def __repr__(self):
        # Called by repr() and in the REPL — unambiguous, developer-facing representation
        return f"Vector(x={self.x}, y={self.y})"

    def __eq__(self, other):
        # Called when using == operator
        return self.x == other.x and self.y == other.y

    def __add__(self, other):
        # Called when using + operator
        return Vector(self.x + other.x, self.y + other.y)

    def __len__(self):
        # Called by len() — must return an integer
        return int((self.x**2 + self.y**0.5))

    def __getitem__(self, key):
        # Called when using [] indexing
        return [self.x, self.y][key]

    def __call__(self):
        # Makes the object callable like a function: obj()
        return f"Vector magnitude: {len(self)}"

# Sample usage:
v1 = Vector(1, 2)
v2 = Vector(3, 4)
v3 = v1 + v2              # Calls __add__
print(v3)                 # Calls __str__: Vector(4, 6)
print(repr(v3))           # Calls __repr__: Vector(x=4, y=6)
print(v1 == Vector(1, 2)) # Calls __eq__: True
print(len(v3))            # Calls __len__: 7
print(v3[0], v3[1])       # Calls __getitem__: 4 6
print(v3())               # Calls __call__: Vector magnitude: 7
```

### Encapsulation and Properties

Encapsulation hides internal state. In Python, `_name` is a convention for "protected" (don't touch from outside), and `__name` triggers name mangling (Python renames it to `_ClassName__name`) to prevent accidental access from subclasses.

```python
class BankAccount:
    def __init__(self, initial_balance=0):
        self._balance = initial_balance  # Protected — by convention, avoid direct access
        self.__account_number = "12345"  # Private — name-mangled to _BankAccount__account_number

    @property
    def balance(self):
        # Getter — allows read access via account.balance (no parentheses)
        return self._balance

    @balance.setter
    def balance(self, value):
        # Setter — called when assigning: account.balance = 500
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = value

    def deposit(self, amount):
        self._balance += amount

# Usage
account = BankAccount(100)
print(account.balance)       # 100 (uses getter)
account.balance = 200        # Uses setter (validates value)
account.deposit(50)
print(account.balance)       # 250
# account.balance = -10      # Raises ValueError
# print(account.__account_number)  # AttributeError — name-mangled
print(account._BankAccount__account_number)  # "12345" — accessible but discouraged
```

## Decorators

Decorators wrap a function or class to modify or extend its behaviour without changing its source code. They are applied with the `@decorator` syntax.

### Function Decorators

```python
import functools
import time

# timer is a simple decorator — wraps a function to measure its execution time
def timer(func):
    @functools.wraps(func)  # Preserves the original function's name and docstring
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f}s")
        return result
    return wrapper

# retry is a decorator factory — a function that returns a decorator, allowing arguments (@retry(max_attempts=2))
def retry(max_attempts=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt + 1} failed: {e}")
        return wrapper
    return decorator

@timer
@retry(max_attempts=2)
def risky_operation():
    import random
    if random.random() < 0.5:
        raise Exception("Random failure")
    return "Success!"

# The above stacked decorators are equivalent to:
# risky_operation = timer(retry(max_attempts=2)(risky_operation))
# Decorators are applied bottom-up: retry wraps risky_operation first, then timer wraps that result

# Usage
result = risky_operation()
print(result)  # "Success!" (after any retries), with timing printed by @timer
```

### Class Decorators

A class decorator takes a class and returns a replacement callable, allowing you to modify or wrap the class itself.

```python
def singleton(cls):
    # Ensures only one instance of the class ever exists
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class Database:
    def __init__(self):
        self.connection = "Connected"

# Usage
db1 = Database()
db2 = Database()
print(db1 is db2)          # True — both variables point to the same instance
print(db1.connection)      # Connected
```

## Iterators and Generators

### Iterators

An iterator is any object with `__iter__` and `__next__` methods. `__iter__` returns the iterator object itself; `__next__` returns the next value or raises `StopIteration` when exhausted.

```python
class NumberSequence:
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.start >= self.end:
            raise StopIteration
        self.start += 1
        return self.start - 1

# Usage
for num in NumberSequence(1, 5):
    print(num)  # 1, 2, 3, 4

# You can also drive it manually
seq = NumberSequence(1, 3)
print(next(seq))  # 1
print(next(seq))  # 2
```

### Generators

Generators are functions that use `yield` to produce values lazily (one at a time), pausing execution between yields. They are memory-efficient for large sequences because they don't build the full list in memory.

```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Generator expression — like a list comprehension but lazy (values produced on demand)
squares = (x**2 for x in range(10))

# Real-world example: file processing — reads one line at a time, avoids loading the whole file
def read_large_file(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            yield line.strip()

# Usage
for num in fibonacci(7):
    print(num)               # 0 1 1 2 3 5 8

print(list(fibonacci(5)))    # [0, 1, 1, 2, 3]
print(next(squares))         # 0
print(next(squares))         # 1

for line in read_large_file("data.txt"):
    print(line)              # Processes one line at a time
```

## Exception Handling

Python uses a try/except/else/finally structure. `else` runs only if no exception was raised; `finally` always runs regardless of whether an exception occurred (useful for cleanup).

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Math error: {e}")
except Exception as e:
    print(f"General error: {e}")
else:
    print("No exceptions occurred")
finally:
    print("This always runs")

# Custom exceptions — subclass Exception to create domain-specific errors with extra context
class ValidationError(Exception):
    def __init__(self, message, code=None):
        super().__init__(message)
        self.code = code

def validate_age(age):
    if age < 0:
        raise ValidationError("Age cannot be negative", code="INVALID_AGE")

# Usage
try:
    validate_age(-5)
except ValidationError as e:
    print(e)       # Age cannot be negative
    print(e.code)  # INVALID_AGE
```

## Context Managers

Context managers handle setup and teardown automatically using the `with` statement. They guarantee cleanup (e.g., closing files or connections) even if an exception occurs.

```python
# Built-in context manager — file is automatically closed after the with block
with open('file.txt', 'r') as f:
    content = f.read()

# Custom context manager (class-based)
# __enter__ runs on entry; __exit__ runs on exit (even if an exception occurred)
class DatabaseConnection:
    def __enter__(self):
        print("Connecting to database")
        return self  # Value bound to the 'as' variable

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Closing database connection")
        if exc_type:
            print(f"Exception occurred: {exc_val}")
        return False  # False = don't suppress exceptions; True would swallow them

# Usage
with DatabaseConnection() as db:
    print("Doing database work")  # db is the object returned by __enter__
# Output:
# Connecting to database
# Doing database work
# Closing database connection

# Context manager using contextlib — simpler alternative to writing a full class
from contextlib import contextmanager

@contextmanager
def timer_context():
    # Code before yield runs on __enter__; code after yield runs on __exit__
    start = time.time()
    try:
        yield  # Control passes to the with block here
    finally:
        end = time.time()
        print(f"Operation took {end - start:.2f}s")

# Usage
with timer_context():
    time.sleep(1)
# Output: Operation took 1.00s
```

## Memory Management & Garbage Collection

Python manages memory automatically using reference counting plus a cyclic garbage collector for circular references.

### Reference Counting

Every object tracks how many references point to it. When the count reaches zero, memory is freed immediately.

```python
import sys

a = [1, 2, 3]
print(sys.getrefcount(a))  # Reference count (usually count + 1 due to the getrefcount call itself)

b = a  # Increases ref count
del b  # Decreases ref count; object stays alive because 'a' still references it
del a  # Now ref count hits 0 — object is freed
```

### Weak References

A weak reference points to an object without incrementing its reference count, allowing the object to be garbage collected normally. This is useful for avoiding circular reference memory leaks (e.g., parent↔child relationships).

```python
import weakref

class Node:
    def __init__(self, value):
        self.value = value
        self.children = []
        self.parent = None

# Avoid circular references
node1 = Node(1)
node2 = Node(2)
node1.children.append(node2)
node2.parent = weakref.ref(node1)  # Weak reference — won't prevent node1 from being GC'd

# Usage
print(node2.parent())        # <Node object> — call the weak ref to get the object
print(node2.parent().value)  # 1
del node1
print(node2.parent())        # None — object was collected since no strong references remain
```

## Functional Programming

### Map, Filter, Reduce

These are higher-order functions that operate on iterables. In modern Python, list comprehensions are often preferred for readability, but map/filter/reduce are still widely used.

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# Map — applies a function to every element, returns an iterator
squared = list(map(lambda x: x**2, numbers))    # [1, 4, 9, 16, 25]

# Filter — keeps elements where the function returns True, returns an iterator
evens = list(filter(lambda x: x % 2 == 0, numbers))  # [2, 4]

# Reduce — accumulates a result by applying a function left-to-right across the iterable
sum_all = reduce(lambda x, y: x + y, numbers)   # 15

# Partial functions — pre-fill some arguments of a function to create a specialised version
from functools import partial

def multiply(x, y):
    return x * y

double = partial(multiply, 2)  # 'x' is fixed to 2; only 'y' needs to be provided
print(double(5))  # 10
print(double(7))  # 14
```

### Closures

A closure is an inner function that remembers variables from its enclosing scope even after the outer function has returned. The `nonlocal` keyword is needed to rebind (not just read) a variable from the enclosing scope.

```python
def outer_function(x):
    def inner_function(y):
        return x + y  # 'x' is captured from the enclosing scope
    return inner_function

add_10 = outer_function(10)  # Returns the inner function with x=10 baked in
print(add_10(5))   # 15
print(add_10(20))  # 30

# Closure with mutable state — nonlocal allows the inner function to reassign the outer variable
def counter():
    count = 0
    def increment():
        nonlocal count  # Without this, assigning to 'count' would create a new local variable
        count += 1
        return count
    return increment

c = counter()
print(c())  # 1
print(c())  # 2
print(c())  # 3
```

## File Handling & I/O

```python
# Reading files
with open('data.txt', 'r') as f:
    content = f.read()           # Read entire file as a single string
    lines = f.readlines()        # Read all lines as a list of strings
    first_line = f.readline()    # Read one line at a time

# Writing files ('w' overwrites; use 'a' to append)
with open('output.txt', 'w') as f:
    f.write("Hello, World!\n")
    f.writelines(["Line 1\n", "Line 2\n"])

# JSON handling — use for structured data serialisation
import json

data = {"name": "Alice", "age": 30}
with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)  # Serialise Python object to JSON file

with open('data.json', 'r') as f:
    loaded_data = json.load(f)    # Deserialise JSON file to Python object

# CSV handling
import csv

with open('data.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Age'])
    writer.writerow(['Alice', 30])
```

## Modules and Packages

A module is a single `.py` file; a package is a directory containing an `__init__.py` and multiple modules. The `if __name__ == "__main__"` guard lets a file run code when executed directly but not when imported.

### Creating Modules

```python
# math_utils.py
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

PI = 3.14159

if __name__ == "__main__":
    # This block only runs when the file is executed directly, not when imported
    print("Running math_utils directly")
```

### Importing

```python
import math_utils                      # Access via math_utils.add()
from math_utils import add, PI         # Import specific names directly
from math_utils import multiply as mult  # Import with an alias
import math_utils as mu                # Import module with an alias

# Dynamic imports — useful when the module name is determined at runtime
import importlib
module = importlib.import_module('math_utils')
print(module.add(1, 2))  # 3
```

## Regular Expressions

Regular expressions (regex) are patterns for matching text. `re.findall` returns all matches; `re.search` returns the first match object; `re.sub` replaces matches. Compile patterns with `re.compile` when reusing them multiple times for better performance.

```python
import re

text = "Email: alice@example.com, Phone: 123-456-7890"

# Basic patterns
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
phone_pattern = r'\d{3}-\d{3}-\d{4}'

# Finding matches
emails = re.findall(email_pattern, text)       # ['alice@example.com']
phone_match = re.search(phone_pattern, text)   # Match object or None
if phone_match:
    print(phone_match.group())                 # '123-456-7890'

# Substitution
cleaned = re.sub(r'\d{3}-\d{3}-\d{4}', '[PHONE]', text)
print(cleaned)  # "Email: alice@example.com, Phone: [PHONE]"

# Compiled patterns (for performance — avoids recompiling the same pattern on each use)
email_regex = re.compile(email_pattern)
matches = email_regex.findall(text)
```

## Threading & Multiprocessing

Use **threading** for I/O-bound tasks (network, disk) where threads spend time waiting. Use **multiprocessing** for CPU-bound tasks to bypass the GIL and use multiple CPU cores.

### Threading

```python
import threading
import time

def worker(name, delay):
    for i in range(3):
        print(f"Worker {name}: {i}")
        time.sleep(delay)

# Creating threads
t1 = threading.Thread(target=worker, args=("A", 1))
t2 = threading.Thread(target=worker, args=("B", 1.5))

t1.start()
t2.start()

t1.join()  # Block main thread until t1 completes
t2.join()  # Block main thread until t2 completes

# Thread synchronization — a Lock prevents race conditions when threads share data
lock = threading.Lock()
shared_resource = 0

def increment():
    global shared_resource
    with lock:
        # Only one thread executes this block at a time
        shared_resource += 1

threads = [threading.Thread(target=increment) for _ in range(100)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(shared_resource)  # 100 (safe — no race condition)
```

### Multiprocessing

```python
import multiprocessing

def cpu_bound_task(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    # Pool distributes tasks across multiple processes (one per CPU core by default)
    with multiprocessing.Pool() as pool:
        results = pool.map(cpu_bound_task, [100000, 200000, 300000])
    print(results)  # [3333283333350000, ...]
```

## Error Handling & Debugging

### Exception Hierarchy

Python exceptions form a class hierarchy. Catch specific exceptions before broad ones (`Exception` catches almost everything except system-exit signals).

```python
# Built-in exceptions
try:
    value = int("not_a_number")
except ValueError as e:
    print(f"ValueError: {e}")
except Exception as e:
    print(f"General exception: {e}")

# Custom exceptions — add a 'field' attribute for richer error context
class ValidationError(Exception):
    def __init__(self, message, field=None):
        super().__init__(message)
        self.field = field

def validate_email(email):
    if "@" not in email:
        raise ValidationError("Invalid email format", field="email")

# Usage
try:
    validate_email("not-an-email")
except ValidationError as e:
    print(e)        # Invalid email format
    print(e.field)  # email
```

### Debugging Techniques

```python
import logging
import pdb

# Logging — preferred over print() for production code; supports log levels and output destinations
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def debug_function(x):
    logger.debug(f"Input: {x}")
    result = x * 2
    logger.info(f"Result: {result}")
    return result

debug_function(5)
# Output: DEBUG:__main__:Input: 5
#         INFO:__main__:Result: 10

# Assertions — for sanity checks during development (disabled with python -O flag)
def divide(a, b):
    assert b != 0, "Division by zero"
    return a / b

# Debugger — pdb.set_trace() drops into an interactive debugger at that line
def problematic_function():
    pdb.set_trace()  # Breakpoint — type 'n' (next), 's' (step), 'c' (continue), 'q' (quit)
    return "debug me"
```

## Data Structures Implementation

### Stack

A stack is a Last-In-First-Out (LIFO) structure. Python's list works well as a stack since `append` and `pop` are both O(1).

```python
class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

# Usage
s = Stack()
s.push(1)
s.push(2)
s.push(3)
print(s.peek())  # 3 (top element, not removed)
print(s.pop())   # 3
print(s.pop())   # 2
```

### Queue

A queue is a First-In-First-Out (FIFO) structure. Use `collections.deque` instead of a list because `popleft()` is O(1) vs O(n) for `list.pop(0)`.

```python
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.items.popleft()

    def is_empty(self):
        return len(self.items) == 0

# Usage
q = Queue()
q.enqueue("a")
q.enqueue("b")
q.enqueue("c")
print(q.dequeue())  # 'a' (first in, first out)
print(q.dequeue())  # 'b'
```

### Linked List

A linked list stores elements as nodes, each pointing to the next. Unlike lists, insertion/deletion at the head is O(1), but random access is O(n).

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, val):
        # Add to end — O(n) because we must traverse to find the tail
        new_node = ListNode(val)
        if not self.head:
            self.head = new_node
            return

        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def prepend(self, val):
        # Add to front — O(1)
        new_node = ListNode(val)
        new_node.next = self.head
        self.head = new_node

    def delete(self, val):
        # Remove first occurrence of val — O(n)
        if not self.head:
            return

        if self.head.val == val:
            self.head = self.head.next
            return

        current = self.head
        while current.next and current.next.val != val:
            current = current.next

        if current.next:
            current.next = current.next.next

# Usage
ll = LinkedList()
ll.append(1)
ll.append(2)
ll.append(3)
ll.prepend(0)

current = ll.head
while current:
    print(current.val, end=" -> ")  # 0 -> 1 -> 2 -> 3 ->
    current = current.next

ll.delete(2)
# List is now: 0 -> 1 -> 3
```

## Built-in Functions & Libraries

### Collections Module

The `collections` module provides specialised container types that extend Python's built-ins.

```python
from collections import Counter, defaultdict, deque, namedtuple, OrderedDict

# Counter — counts hashable objects; most_common(n) returns the n most frequent elements
text = "hello world"
char_count = Counter(text)
print(char_count.most_common(3))  # [('l', 3), ('o', 2), ('h', 1)]

# defaultdict — like a dict but returns a default value instead of raising KeyError on missing keys
dd = defaultdict(list)
dd['key'].append('value')  # No KeyError — missing key auto-initialised to []
print(dd)  # defaultdict(<class 'list'>, {'key': ['value']})

# deque (double-ended queue) — O(1) append/pop from both ends; list pop(0) is O(n)
dq = deque([1, 2, 3])
dq.appendleft(0)  # [0, 1, 2, 3]
dq.pop()          # removes 3; dq is now [0, 1, 2]

# namedtuple — tuple subclass with named fields; more readable than index-based access
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)   # 10 20
print(p[0])       # 10 — still accessible by index
```

### Itertools

`itertools` provides fast, memory-efficient tools for working with iterators and combinatorics.

```python
import itertools

# Combinations and permutations
data = [1, 2, 3]
print(list(itertools.combinations(data, 2)))  # [(1, 2), (1, 3), (2, 3)] — order doesn't matter
print(list(itertools.permutations(data, 2)))  # [(1, 2), (1, 3), (2, 1), ...] — order matters

# Infinite iterators — useful with next() or when you break manually
counter = itertools.count(start=5, step=2)  # 5, 7, 9, 11, ... (never stops)
repeater = itertools.repeat('hello', 3)     # 'hello', 'hello', 'hello'
print(next(counter))  # 5
print(next(counter))  # 7

# Grouping — groups consecutive elements with the same key (input must be pre-sorted by key)
data = [('a', 1), ('a', 2), ('b', 3), ('b', 4)]
grouped = itertools.groupby(data, key=lambda x: x[0])
for key, group in grouped:
    print(f"{key}: {list(group)}")
# a: [('a', 1), ('a', 2)]
# b: [('b', 3), ('b', 4)]
```

## Common Gotchas & Best Practices

### Mutable Default Arguments

Default argument values are evaluated **once** at function definition, not on each call. Using a mutable object (like a list) as a default causes it to persist across calls.

```python
# Wrong — target_list is shared across all calls; state persists between invocations
def append_to_list(item, target_list=[]):
    target_list.append(item)
    return target_list

print(append_to_list(1))  # [1]
print(append_to_list(2))  # [1, 2] — unexpected!

# Right — use None as the default and create a fresh object inside the function
def append_to_list(item, target_list=None):
    if target_list is None:
        target_list = []
    target_list.append(item)
    return target_list

print(append_to_list(1))  # [1]
print(append_to_list(2))  # [2] — correct
```

### Late Binding Closures

Lambda (and def) bodies are not evaluated until the function is called. Variables from the enclosing scope are looked up at call time, not at definition time.

```python
# Wrong — 'i' is looked up when each lambda is called; by then the loop has finished and i=2
functions = []
for i in range(3):
    functions.append(lambda: i)

print([f() for f in functions])  # [2, 2, 2] — all return 2

# Right — capture the current value of i as a default argument (evaluated at definition time)
functions = []
for i in range(3):
    functions.append(lambda x=i: x)

print([f() for f in functions])  # [0, 1, 2]
```

### Shallow vs Deep Copy

A shallow copy creates a new outer container but still references the same inner objects. A deep copy recursively copies everything.

```python
import copy

original = [[1, 2], [3, 4]]
shallow = copy.copy(original)       # New list, but inner lists are still shared
deep = copy.deepcopy(original)      # Fully independent copy at all levels

original[0][0] = 999
print(shallow)  # [[999, 2], [3, 4]] — inner list is shared, so it's affected
print(deep)     # [[1, 2], [3, 4]] — fully independent, not affected
```

## Testing

### Unit Testing

`unittest` is Python's built-in testing framework. `setUp` runs before each test method, providing a fresh fixture. Use `assert*` methods for readable failure messages.

```python
import unittest

class Calculator:
    def add(self, a, b):
        return a + b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

class TestCalculator(unittest.TestCase):
    def setUp(self):
        # Runs before each test — creates a fresh Calculator instance
        self.calc = Calculator()

    def test_add(self):
        self.assertEqual(self.calc.add(2, 3), 5)

    def test_divide_by_zero(self):
        with self.assertRaises(ValueError):
            self.calc.divide(10, 0)

if __name__ == "__main__":
    unittest.main()
```

### Pytest (More Popular)

Pytest uses plain `assert` statements and discovers tests automatically (any file/function prefixed with `test_`). Fixtures replace `setUp`/`tearDown` with a more composable, reusable pattern.

```python
import pytest

def test_add():
    calc = Calculator()
    assert calc.add(2, 3) == 5

def test_divide_by_zero():
    calc = Calculator()
    with pytest.raises(ValueError):
        calc.divide(10, 0)

# Fixtures — reusable setup; injected by name into test functions
@pytest.fixture
def calculator():
    return Calculator()

def test_with_fixture(calculator):
    assert calculator.add(1, 1) == 2

# Run tests with: pytest test_file.py -v
```

## Performance & Optimization

### Timing Code

```python
import timeit

# Simple timing — runs the function 'number' times and returns total elapsed seconds
def slow_function():
    return sum(range(1000))

execution_time = timeit.timeit(slow_function, number=1000)
print(f"Average time: {execution_time/1000:.6f}s")

# Profile with cProfile — shows per-function call counts and cumulative time
import cProfile
cProfile.run('slow_function()')
```

### Memory Usage

```python
import sys
from memory_profiler import profile  # pip install memory-profiler

@profile
def memory_intensive():
    # Decorating with @profile prints line-by-line memory usage when the function runs
    big_list = [i for i in range(1000000)]
    return sum(big_list)

# Check object size
data = [1, 2, 3, 4, 5]
print(f"Size: {sys.getsizeof(data)} bytes")  # Size of the list object itself (not its contents)
```

## Common Interview Questions & Patterns

### String Manipulation

```python
def is_palindrome(s):
    """Check if string is palindrome (ignore case, spaces, punctuation)"""
    cleaned = ''.join(char.lower() for char in s if char.isalnum())
    return cleaned == cleaned[::-1]

def reverse_words(s):
    """Reverse words in a string"""
    return ' '.join(s.split()[::-1])

def first_non_repeating_char(s):
    """Find first non-repeating character"""
    char_count = {}
    for char in s:
        char_count[char] = char_count.get(char, 0) + 1

    for char in s:
        if char_count[char] == 1:
            return char
    return None

# Usage
print(is_palindrome("A man a plan a canal Panama"))  # True
print(reverse_words("Hello World"))                  # "World Hello"
print(first_non_repeating_char("aabbcde"))           # 'c'
```

### Array Problems

```python
def find_missing_number(nums):
    """Find missing number in range [0, n] using the arithmetic sum formula"""
    n = len(nums)
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(nums)
    return expected_sum - actual_sum

def rotate_array(nums, k):
    """Rotate array to the right by k steps — slicing trick: move last k elements to front"""
    k = k % len(nums)
    nums[:] = nums[-k:] + nums[:-k]

def merge_intervals(intervals):
    """Merge overlapping intervals — sort by start, then extend the last merged interval if overlap"""
    if not intervals:
        return []

    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]

    for current in intervals[1:]:
        last = merged[-1]
        if current[0] <= last[1]:
            merged[-1] = [last[0], max(last[1], current[1])]
        else:
            merged.append(current)

    return merged

# Usage
print(find_missing_number([0, 1, 3, 4]))     # 2
nums = [1, 2, 3, 4, 5]
rotate_array(nums, 2)
print(nums)                                   # [4, 5, 1, 2, 3]
print(merge_intervals([[1,3],[2,6],[8,10]]))  # [[1, 6], [8, 10]]
```

## Metaclasses

- A metaclass is a "class of a class": it defines how classes behave. By default, Python uses `type` as the metaclass.
- Custom metaclasses are created by subclassing `type` and overriding methods like `__new__` or `__init__`.
- Use cases: automatically register subclasses, enforce class attributes/methods, modify class creation.
- Specify a metaclass with `class Foo(metaclass=Meta): ...`
- Prefer class decorators for most use cases; use metaclasses only for advanced class customization.

```python
# Example: Enforcing all classes have a 'speak' method
class RequireSpeak(type):
    def __init__(cls, name, bases, dct):
        # Called when a new class using this metaclass is defined
        if 'speak' not in dct:
            raise TypeError("Class must define 'speak' method")
        super().__init__(name, bases, dct)

class Animal(metaclass=RequireSpeak):
    def speak(self):
        return "Sound"

# This would raise TypeError at class definition time (not at instantiation):
# class Silent(metaclass=RequireSpeak):  # TypeError: Class must define 'speak' method
#     pass

# Usage
a = Animal()
print(a.speak())  # Output: Sound
```

## Descriptors

- A descriptor is any object that defines at least one of `__get__`, `__set__`, or `__delete__` methods and is used as a class attribute.
- **Data descriptor**: defines both `__get__` and `__set__` (e.g., property with setter); **non-data descriptor**: only `__get__`.
- The `property` built-in is implemented using descriptors; allows custom logic for attribute access.
- Use descriptors for validation, computed properties, or managing access to attributes.
- Descriptors are defined at the **class level** and apply to every instance — making them more reusable than properties when the same logic is needed across multiple attributes or classes.

```python
# Example: Descriptor for positive values
class Positive:
    def __get__(self, instance, owner):
        # instance = the Account object; owner = the Account class
        if instance is None:
            return self  # Accessed from the class itself, not an instance
        return instance._value

    def __set__(self, instance, value):
        if value < 0:
            raise ValueError("Value must be positive")
        instance._value = value

class Account:
    balance = Positive()  # Descriptor assigned as a class attribute

    def __init__(self, balance):
        self.balance = balance  # Calls Positive.__set__

# Usage
a = Account(100)
print(a.balance)  # 100 — calls Positive.__get__
a.balance = 50    # Calls Positive.__set__
print(a.balance)  # 50
# a.balance = -10  # Raises ValueError: Value must be positive
```

## Advanced String Operations

- Know all string formatting styles: f-strings (`f"{x}"`), `.format()`, and `%` formatting; prefer f-strings for new code.
- Understand the difference between Unicode strings (`str`) and byte strings (`bytes`); know how to encode/decode.
- String interning: Python may reuse immutable string objects for efficiency; use `sys.intern()` for large sets of repeated strings.
- Strings are immutable; all string operations create new objects.

```python
# Example: String formatting and interning
name = "Alice"
print(f"Hello, {name}!")           # f-string (Python 3.6+) — fastest and most readable
print("Hello, {}!".format(name))   # .format() — supports positional and keyword placeholders
print("Hello, %s!" % name)         # % formatting — older C-style; still seen in logging

# Encoding/decoding — str is Unicode text; bytes is raw binary data
s = "café"
encoded = s.encode('utf-8')   # str → bytes: b'caf\xc3\xa9'
decoded = encoded.decode('utf-8')  # bytes → str: 'café'

# String interning — CPython automatically interns short/identifier-like strings;
# sys.intern() forces interning and allows O(1) identity comparison instead of O(n) equality
import sys
a = sys.intern("hello")
b = sys.intern("hello")
print(a is b)  # True — same object in memory (faster comparison for large string sets)
```

## Python Internals

- The GIL (Global Interpreter Lock) allows only one thread to execute Python bytecode at a time; affects multi-threaded CPU-bound code.
- Python source code is compiled to bytecode (`.pyc` files), which is then interpreted by the CPython VM.
- Use the `dis` module to inspect Python bytecode: `import dis; dis.dis(func)`.
- Know how the GIL impacts concurrency and when to use multiprocessing instead of threading.

```python
# Example: Inspecting bytecode
def add(x, y):
    return x + y

import dis
dis.dis(add)
# Output shows low-level instructions like LOAD_FAST, BINARY_ADD, RETURN_VALUE
# Useful for understanding performance characteristics and Python's execution model
```

## Database Integration

- Connect to SQLite with `sqlite3` or to PostgreSQL/MySQL with libraries like `psycopg2` or `mysql-connector-python`.
- ORM basics: define models as classes, use sessions to query and persist data (SQLAlchemy).
- Always use context managers (`with` statement) for database connections to ensure cleanup.
- Prevent SQL injection by using parameterized queries, never string formatting for SQL.

```python
# Example: SQLite connection and query
import sqlite3

# ':memory:' creates a temporary in-memory database — great for testing
with sqlite3.connect(":memory:") as conn:
    c = conn.cursor()
    c.execute("CREATE TABLE users (id INTEGER, name TEXT)")
    # Use '?' placeholders — NEVER use f-strings or % formatting for SQL values (SQL injection risk)
    c.execute("INSERT INTO users VALUES (?, ?)", (1, "Alice"))
    c.execute("SELECT * FROM users")
    print(c.fetchall())  # [(1, 'Alice')]
    # Changes are committed automatically when the with block exits without error
```

## Web Frameworks Basics

- Flask: minimal web framework; Django: full-featured framework. Know how to define routes and handle requests.
- Understand the HTTP request/response cycle: request comes in, routed to a view, response returned.
- REST API: stateless endpoints using HTTP verbs (GET, POST, PUT, DELETE).
- Know where to add authentication (middleware/decorators) and input validation.

```python
# Example: Flask route
from flask import Flask
app = Flask(__name__)

@app.route("/hello")
def hello():
    return "Hello, World!"

# Run with: flask run
# Or programmatically:
if __name__ == "__main__":
    app.run(debug=True)  # Starts development server at http://127.0.0.1:5000
```

## Data Science Libraries

- NumPy: create arrays, perform vectorized operations, understand broadcasting rules.
- Pandas: create DataFrames, select/filter data, use `groupby`, handle missing data.
- Import/export data: `read_csv`, `to_csv`, `read_excel`, `read_json`.
- Practice common data manipulation: filtering, aggregation, reshaping.

```python
# Example: NumPy and Pandas basics
import numpy as np
import pandas as pd

# NumPy — vectorised operations apply element-wise without explicit loops
arr = np.array([1, 2, 3])
print(arr * 2)          # [2 4 6]
print(arr + arr)        # [2 4 6]
print(np.mean(arr))     # 2.0

# Pandas — DataFrame is a 2D table with labelled rows and columns
df = pd.DataFrame({"A": [1, 2], "B": [3, 4]})
print(df["A"].mean())   # 1.5 — column average
print(df[df["A"] > 1])  # Filter rows where column A > 1
```

## Networking & APIs

- Use the `requests` library to make HTTP requests: `requests.get()`, `requests.post()`, handle headers and JSON.
- Parse JSON with `response.json()` and serialize with `json.dumps()`.
- Basic socket programming: create TCP/UDP clients and servers with the `socket` module.
- Always handle exceptions and timeouts in network code.

```python
# Example: HTTP GET request
import requests

# Always set a timeout to avoid hanging indefinitely on slow or unresponsive servers
response = requests.get("https://api.github.com", timeout=5)
print(response.status_code)  # 200
print(response.json())       # Parsed JSON response as a Python dict

# POST with JSON body and custom headers
response = requests.post(
    "https://httpbin.org/post",
    json={"key": "value"},                           # Automatically sets Content-Type: application/json
    headers={"Authorization": "Bearer my-token"},
    timeout=5
)
data = response.json()
```

## Security Considerations

- Always validate and sanitize user input to prevent injection attacks.
- Avoid using `eval` and `pickle` on untrusted data; prefer `json` for serialization.
- Use context managers for file/database operations to avoid resource leaks.
- Be aware of common vulnerabilities: code injection, insecure deserialization, improper permissions.

```python
# Example: Safe JSON deserialization vs unsafe alternatives
import json

# Safe — json.loads only parses JSON, cannot execute arbitrary code
data = '{"name": "Alice"}'
obj = json.loads(data)
print(obj["name"])  # Alice

# Unsafe — NEVER do this with untrusted input:
# eval('{"name": "Alice"}')         # Can execute arbitrary Python code
# pickle.loads(untrusted_bytes)     # Can execute arbitrary code during deserialization
```

## Python 3 Features

- Type hints: annotate function arguments and return types; use `mypy` for static checking.
- Use `pathlib.Path` for filesystem paths instead of `os.path`.
- Prefer f-strings for formatting; know about new syntax features (e.g., assignment expressions `:=`).
- Pattern matching (`match` statement, Python 3.10+): use for matching on structure, not just values.

```python
# Example: Type hints and pattern matching
from pathlib import Path

def greet(name: str) -> str:
    # Type hints are not enforced at runtime but help IDEs and tools like mypy catch bugs
    return f"Hello, {name}"

p = Path("file.txt")
print(p.exists())         # True/False
print(p.suffix)           # '.txt'
print(p.parent)           # Current directory

# Assignment expression (':=' walrus operator, Python 3.8+) — assigns and tests in one step
data = [1, 2, 3, 4, 5]
if (n := len(data)) > 3:
    print(f"List is long ({n} elements)")  # List is long (5 elements)

# Pattern matching (Python 3.10+)
def http_status(status):
    match status:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case _:
            return "Unknown"

print(http_status(404))  # Not Found
```

## Asynchronous Programming & AsyncIO

Async programming allows a single thread to handle many I/O-bound tasks concurrently by suspending (not blocking) at `await` points, letting other coroutines run while waiting. Use `asyncio` for I/O-bound concurrency; it does **not** help with CPU-bound tasks (use multiprocessing for those).

### Introduction to AsyncIO

```python
import asyncio

# async def defines a coroutine — calling it returns a coroutine object, not a result
async def say_hello():
    print("Hello")
    await asyncio.sleep(1)  # Non-blocking — suspends this coroutine, lets others run
    print("World")

# asyncio.run() is the main entry point — creates an event loop, runs the coroutine, then closes it
asyncio.run(say_hello())

# Multiple coroutines
async def fetch_data(id):
    print(f"Fetching {id}...")
    await asyncio.sleep(2)
    return f"Data {id}"

async def main():
    result = await fetch_data(1)
    print(result)

asyncio.run(main())
```

### Concurrent Execution

```python
# Running tasks concurrently
async def task1():
    await asyncio.sleep(1)
    return "Task 1 complete"

async def task2():
    await asyncio.sleep(2)
    return "Task 2 complete"

async def main():
    # Method 1: gather — runs all coroutines concurrently; waits for all to finish
    # Total time ≈ max(1s, 2s) = 2s, not 3s
    results = await asyncio.gather(task1(), task2())
    print(results)  # ['Task 1 complete', 'Task 2 complete']

    # Method 2: create_task — schedules coroutines as Tasks (gives more control, e.g., cancellation)
    t1 = asyncio.create_task(task1())
    t2 = asyncio.create_task(task2())
    result1 = await t1
    result2 = await t2

    # Method 3: as_completed — yields tasks as they finish (not in submission order)
    tasks = [task1(), task2()]
    for coro in asyncio.as_completed(tasks):
        result = await coro
        print(f"Got: {result}")

asyncio.run(main())
```

### Event Loop

The event loop is the core scheduler that drives coroutines, manages I/O, and dispatches callbacks. In most cases you use `asyncio.run()` and never touch the loop directly.

```python
# Manual event loop management (lower-level; prefer asyncio.run() in Python 3.7+)
loop = asyncio.get_event_loop()
try:
    result = loop.run_until_complete(fetch_data(1))
finally:
    loop.close()

# Get current running loop (only valid inside a running coroutine)
async def get_loop_info():
    loop = asyncio.get_running_loop()
    print(f"Loop: {loop}")

# Schedule callbacks — call_soon runs after current iteration; call_later runs after a delay
def callback(arg):
    print(f"Callback called with {arg}")

async def schedule_callback():
    loop = asyncio.get_running_loop()
    loop.call_soon(callback, "data")        # Runs on the next event loop iteration
    loop.call_later(2, callback, "delayed") # Runs after 2 seconds
    await asyncio.sleep(3)

asyncio.run(schedule_callback())
```

### Async Context Managers

Async context managers use `__aenter__` and `__aexit__` (both coroutines) so setup/teardown can themselves await async operations (e.g., opening a network connection).

```python
class AsyncDatabase:
    async def __aenter__(self):
        print("Connecting to database")
        await asyncio.sleep(1)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("Closing database connection")
        await asyncio.sleep(1)

    async def query(self, sql):
        await asyncio.sleep(0.5)
        return f"Results for: {sql}"

# Usage — 'async with' calls __aenter__ and __aexit__ as coroutines
async def main():
    async with AsyncDatabase() as db:
        result = await db.query("SELECT * FROM users")
        print(result)

asyncio.run(main())

# Using asynccontextmanager — same pattern as @contextmanager but for async code
from contextlib import asynccontextmanager

@asynccontextmanager
async def async_timer():
    start = asyncio.get_event_loop().time()
    try:
        yield  # Control passes to the async with block here
    finally:
        end = asyncio.get_event_loop().time()
        print(f"Elapsed: {end - start:.2f}s")

async def main():
    async with async_timer():
        await asyncio.sleep(1)

asyncio.run(main())
```

### Async Iterators and Generators

Async iterators use `__aiter__` and `__anext__`; async generators use `yield` inside an `async def`. Both allow `async for` to iterate while awaiting between steps.

```python
# Async iterator
class AsyncCounter:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.current >= self.end:
            raise StopAsyncIteration
        await asyncio.sleep(0.5)
        self.current += 1
        return self.current - 1

# Usage
async def main():
    async for num in AsyncCounter(1, 5):
        print(num)  # 1, 2, 3, 4 (with 0.5s delay between each)

asyncio.run(main())

# Async generator — simpler syntax; yield inside async def
async def async_range(start, end):
    for i in range(start, end):
        await asyncio.sleep(0.5)
        yield i

async def main():
    async for num in async_range(1, 5):
        print(num)

asyncio.run(main())
```

### Synchronization Primitives

Async synchronization primitives work like their threading counterparts but are non-blocking — they suspend the coroutine rather than blocking the entire thread.

```python
# Lock — only one coroutine can hold it at a time; prevents concurrent access to shared state
lock = asyncio.Lock()

async def critical_section(id):
    async with lock:
        print(f"Task {id} acquired lock")
        await asyncio.sleep(1)
        print(f"Task {id} released lock")

# Semaphore — allows up to N coroutines to proceed concurrently (useful for rate limiting)
semaphore = asyncio.Semaphore(2)

async def limited_resource(id):
    async with semaphore:
        print(f"Task {id} accessing resource")
        await asyncio.sleep(2)
        print(f"Task {id} done")

# Event — one coroutine signals an event; others wait for it
event = asyncio.Event()

async def waiter():
    print("Waiting for event")
    await event.wait()
    print("Event received!")

async def setter():
    await asyncio.sleep(2)
    print("Setting event")
    event.set()

async def main():
    await asyncio.gather(waiter(), setter())

asyncio.run(main())

# Queue — producer-consumer pattern; maxsize=0 means unlimited
queue = asyncio.Queue(maxsize=5)

async def producer(id):
    for i in range(3):
        await asyncio.sleep(0.5)
        await queue.put(f"item-{id}-{i}")
        print(f"Producer {id} added item-{id}-{i}")

async def consumer(id):
    while True:
        item = await queue.get()
        print(f"Consumer {id} got {item}")
        await asyncio.sleep(1)
        queue.task_done()  # Signal that this item is fully processed

async def main():
    producers = [asyncio.create_task(producer(i)) for i in range(2)]
    consumers = [asyncio.create_task(consumer(i)) for i in range(2)]

    await asyncio.gather(*producers)
    await queue.join()  # Wait until all items have been processed (task_done called for each)

    for c in consumers:
        c.cancel()

asyncio.run(main())
```

### Error Handling

```python
async def failing_task():
    await asyncio.sleep(1)
    raise ValueError("Something went wrong")

async def main():
    # Standard try/except works normally with await
    try:
        await failing_task()
    except ValueError as e:
        print(f"Caught: {e}")

    # gather — by default, the first exception cancels remaining tasks and re-raises
    try:
        await asyncio.gather(
            failing_task(),
            asyncio.sleep(2)
        )
    except ValueError:
        print("First exception stops all")

    # return_exceptions=True — exceptions are returned as values instead of being raised;
    # allows all tasks to complete and lets you inspect each result individually
    results = await asyncio.gather(
        failing_task(),
        asyncio.sleep(2),
        return_exceptions=True
    )
    print(results)  # [ValueError('Something went wrong'), None]

    # TaskGroup (Python 3.11+) — preferred modern approach; raises ExceptionGroup if any task fails
    async with asyncio.TaskGroup() as group:
        group.create_task(failing_task())
        group.create_task(asyncio.sleep(1))
    # Raises ExceptionGroup containing all exceptions from failed tasks

asyncio.run(main())
```

### Timeouts and Cancellation

```python
async def long_running_task():
    try:
        await asyncio.sleep(10)
        return "IO Complete"
    except asyncio.CancelledError:
        # CancelledError is raised at the await point when the task is cancelled
        print("Task was cancelled")
        raise  # Always re-raise CancelledError so the framework knows the task is done

async def main():
    # Method 1: wait_for — cancels the task automatically if it exceeds the timeout
    try:
        result = await asyncio.wait_for(long_running_task(), timeout=2)
    except asyncio.TimeoutError:
        print("Task timed out")

    # Method 2: Manual cancellation — useful when you need to cancel based on external conditions
    task = asyncio.create_task(long_running_task())
    await asyncio.sleep(1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Task cancelled manually")

    # Method 3: shield — protects a task from being cancelled by an outer cancellation;
    # the shield itself raises CancelledError but the inner task keeps running
    task = asyncio.create_task(long_running_task())
    try:
        await asyncio.shield(task)
    except asyncio.CancelledError:
        print("Outer cancelled, but task continues")
        await task  # Wait for the still-running task to finish

asyncio.run(main())
```

### Async HTTP Requests with aiohttp

`aiohttp` is the standard async HTTP library. Using a single shared `ClientSession` is more efficient than creating one per request (reuses TCP connections).

```python
import aiohttp
import asyncio

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    # ClientSession should be created once and reused — creation is expensive
    async with aiohttp.ClientSession() as session:
        # Single request
        html = await fetch_url(session, "https://example.com")

        # Multiple concurrent requests — total time ≈ slowest request, not sum of all
        urls = [
            "https://example.com",
            "https://httpbin.org/delay/1",
            "https://httpbin.org/delay/2"
        ]
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)

        # POST request with JSON body
        async with session.post(
            "https://httpbin.org/post",
            json={"key": "value"}
        ) as response:
            data = await response.json()
            print(data)

asyncio.run(main())
```

### Running Blocking Code

Blocking code (e.g., `time.sleep`, synchronous file I/O, CPU-heavy computation) will freeze the event loop if called directly from a coroutine. Use `run_in_executor` to offload it to a thread or process pool.

```python
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def blocking_io():
    time.sleep(2)
    return "IO Complete"

def cpu_bound_task(n):
    return sum(i * i for i in range(n))

async def main():
    # Method 1: run_in_executor with default thread pool — runs blocking_io in a background thread
    result = await asyncio.get_event_loop().run_in_executor(
        None, blocking_io  # None = use default ThreadPoolExecutor
    )
    print(result)

    # Method 2: Custom thread pool — useful when you need to control concurrency
    with ThreadPoolExecutor(max_workers=3) as executor:
        result = await asyncio.get_event_loop().run_in_executor(
            executor, blocking_io
        )

    # Method 3: Process pool for CPU-bound tasks — bypasses the GIL for true parallelism
    with ProcessPoolExecutor() as executor:
        result = await asyncio.get_event_loop().run_in_executor(
            executor, cpu_bound_task, 1000000
        )

    # Method 4: asyncio.to_thread (Python 3.9+) — cleaner syntax for thread offloading
    result = await asyncio.to_thread(blocking_io)
    print(result)

asyncio.run(main())
```

### Async File I/O with aiofiles

Standard file I/O is blocking. `aiofiles` wraps file operations so they run in a thread pool, keeping the event loop responsive.

```python
import aiofiles
import asyncio

async def read_file(filename):
    async with aiofiles.open(filename, 'r') as f:
        content = await f.read()
        return content

async def write_file(filename, content):
    async with aiofiles.open(filename, 'w') as f:
        await f.write(content)

async def read_lines(filename):
    async with aiofiles.open(filename, 'r') as f:
        async for line in f:
            print(line.strip())

async def main():
    await write_file('test.txt', 'Hello, async world!')
    content = await read_file('test.txt')
    print(content)

    # Concurrent file operations — all writes happen concurrently
    tasks = [
        write_file(f'file{i}.txt', f'Content {i}')
        for i in range(5)
    ]
    await asyncio.gather(*tasks)

asyncio.run(main())
```

### Async Database Operations

Async database drivers (e.g., `asyncpg`, `aiomysql`) allow database queries to be non-blocking — the event loop can handle other work while waiting for query results.

```python
import asyncpg  # pip install asyncpg — PostgreSQL async driver
import aiomysql  # pip install aiomysql — MySQL async driver

# PostgreSQL example
async def postgres_example():
    conn = await asyncpg.connect(
        user='user', password='password',
        database='testdb', host='localhost'
    )

    # Use $1, $2, ... placeholders (parameterized queries — safe from SQL injection)
    values = await conn.fetch('SELECT * FROM users WHERE age > $1', 25)

    # Transaction — both operations succeed or both are rolled back
    async with conn.transaction():
        await conn.execute('INSERT INTO users VALUES ($1, $2)', 'Alice', 30)
        await conn.execute('UPDATE accounts SET balance = balance - $1', 100)

    await conn.close()

# MySQL example
async def mysql_example():
    # Use a connection pool for production — avoids reconnecting on every request
    pool = await aiomysql.create_pool(
        host='localhost', port=3306,
        user='user', password='password',
        db='testdb'
    )

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM users")
            rows = await cur.fetchall()
            print(rows)

    pool.close()
    await pool.wait_closed()
```

### WebSocket Server

WebSockets provide full-duplex (two-way) persistent connections over HTTP — useful for real-time apps (chat, live data feeds).

```python
import websockets
import asyncio

async def echo_handler(websocket, path):
    # Each connected client gets its own handler coroutine
    async for message in websocket:
        print(f"Received: {message}")
        await websocket.send(f"Echo: {message}")

async def main():
    # Serves on ws://localhost:8765; runs until cancelled
    async with websockets.serve(echo_handler, "localhost", 8765):
        await asyncio.Future()  # Run forever (never resolves)

# WebSocket client
async def client():
    async with websockets.connect("ws://localhost:8765") as websocket:
        await websocket.send("Hello, server!")
        response = await websocket.recv()
        print(response)  # "Echo: Hello, server!"

# Run server: asyncio.run(main())
# Run client (in a separate script): asyncio.run(client())
```

### Subprocess Management

`asyncio.create_subprocess_shell` runs shell commands without blocking the event loop, allowing other coroutines to continue while the process executes.

```python
async def run_command(cmd):
    process = await asyncio.create_subprocess_shell(
        cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    stdout, stderr = await process.communicate()

    if process.returncode == 0:
        return stdout.decode()
    else:
        raise Exception(stderr.decode())

async def run_multiple_commands():
    # Run multiple shell commands concurrently
    commands = ["ls -la", "pwd", "echo 'Hello'"]
    tasks = [run_command(cmd) for cmd in commands]
    results = await asyncio.gather(*tasks)
    return results

# Streaming output — process output line-by-line as it arrives (useful for long-running processes)
async def stream_output(cmd):
    process = await asyncio.create_subprocess_shell(
        cmd,
        stdout=asyncio.subprocess.PIPE
    )

    async for line in process.stdout:
        print(line.decode().strip())

    await process.wait()

# Usage
asyncio.run(stream_output("ping -c 4 google.com"))
```
