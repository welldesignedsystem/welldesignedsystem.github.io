+++
date = '2022-05-03T12:44:47+10:00'
draft = false
title = 'Python Quicky'
tags = ['Python']
+++

This guide covers all the essential Python topics you should master for technical interviews, from basic data types and control flow to advanced concepts like metaclasses, descriptors, and Python internals. It includes practical code examples, best practices, common pitfalls, and concise explanations to help you quickly revise and strengthen your understanding before interviews. Use this as a comprehensive checklist and reference to ensure you’re well-prepared for any Python interview scenario, whether for general programming, data science, web development, or system design roles.

## Data Types & Structures

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
| Operation | List | Dict | Set | Tuple |
|-----------|------|------|-----|-------|
| Access | O(1) | O(1) | N/A | O(1) |
| Search | O(n) | O(1) | O(1) | O(n) |
| Insert | O(n) | O(1) | O(1) | N/A |
| Delete | O(n) | O(1) | O(1) | N/A |
| Append | O(1) | N/A | N/A | N/A |

## Control Flow & Functions

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
    """Variable positional arguments"""
    return sum(args)

def create_profile(**kwargs):
    """Variable keyword arguments"""
    return kwargs

# Lambda functions
square = lambda x: x**2
sorted_names = sorted(["Alice", "bob", "Charlie"], key=lambda x: x.lower())

# Higher-order functions
def apply_operation(func, numbers):
    return [func(x) for x in numbers]
```

## Object-Oriented Programming

### Classes and Inheritance
```python
class Animal:
    species_count = 0  # Class variable
    
    def __init__(self, name, age):
        self.name = name  # Instance variable
        self.age = age
        Animal.species_count += 1
    
    def speak(self):
        raise NotImplementedError("Subclass must implement")
    
    @property
    def is_adult(self):
        return self.age >= 3
    
    @classmethod
    def get_species_count(cls):
        return cls.species_count
    
    @staticmethod
    def animal_sound():
        return "Some generic animal sound"

class Dog(Animal):
    def __init__(self, name, age, breed):
        super().__init__(name, age)
        self.breed = breed
    
    def speak(self):
        return f"{self.name} says Woof!"

# Multiple inheritance
class Flyable:
    def fly(self):
        return "Flying!"

class Bird(Animal, Flyable):
    def speak(self):
        return f"{self.name} says Tweet!"
```

### Magic Methods (Dunder Methods)
```python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __str__(self):
        return f"Vector({self.x}, {self.y})"
    
    def __repr__(self):
        return f"Vector(x={self.x}, y={self.y})"
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def __len__(self):
        return int((self.x**2 + self.y**0.5))
    
    def __getitem__(self, key):
        return [self.x, self.y][key]
    
    def __call__(self):
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
```python
class BankAccount:
    def __init__(self, initial_balance=0):
        self._balance = initial_balance  # Protected
        self.__account_number = "12345"  # Private (name mangling)
    
    @property
    def balance(self):
        return self._balance
    
    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = value
    
    def deposit(self, amount):
        self._balance += amount
```

## Decorators

### Function Decorators
```python
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.2f}s")
        return result
    return wrapper

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
```

### Class Decorators
```python
def singleton(cls):
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
```

## Iterators and Generators

### Iterators
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
```

### Generators
```python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# Generator expression
squares = (x**2 for x in range(10))

# Real-world example: file processing
def read_large_file(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            yield line.strip()
```

## Exception Handling

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

# Custom exceptions
class ValidationError(Exception):
    def __init__(self, message, code=None):
        super().__init__(message)
        self.code = code

def validate_age(age):
    if age < 0:
        raise ValidationError("Age cannot be negative", code="INVALID_AGE")
```

## Context Managers

```python
# Built-in context manager
with open('file.txt', 'r') as f:
    content = f.read()

# Custom context manager (class-based)
class DatabaseConnection:
    def __enter__(self):
        print("Connecting to database")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Closing database connection")
        if exc_type:
            print(f"Exception occurred: {exc_val}")
        return False  # Don't suppress exceptions

# Context manager using contextlib
from contextlib import contextmanager

@contextmanager
def timer_context():
    start = time.time()
    try:
        yield
    finally:
        end = time.time()
        print(f"Operation took {end - start:.2f}s")

# Usage
with timer_context():
    time.sleep(1)
```

## Memory Management & Garbage Collection

### Reference Counting
```python
import sys

a = [1, 2, 3]
print(sys.getrefcount(a))  # Reference count

b = a  # Increases ref count
del b  # Decreases ref count
```

### Weak References
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
node2.parent = weakref.ref(node1)  # Weak reference to parent
```

## Functional Programming

### Map, Filter, Reduce
```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# Map
squared = list(map(lambda x: x**2, numbers))

# Filter
evens = list(filter(lambda x: x % 2 == 0, numbers))

# Reduce
sum_all = reduce(lambda x, y: x + y, numbers)

# Partial functions
from functools import partial

def multiply(x, y):
    return x * y

double = partial(multiply, 2)
print(double(5))  # 10
```

### Closures
```python
def outer_function(x):
    def inner_function(y):
        return x + y
    return inner_function

add_10 = outer_function(10)
print(add_10(5))  # 15

# Closure with mutable state
def counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

c = counter()
print(c())  # 1
print(c())  # 2
```

## File Handling & I/O

```python
# Reading files
with open('data.txt', 'r') as f:
    content = f.read()           # Read entire file
    lines = f.readlines()        # Read all lines
    first_line = f.readline()    # Read one line

# Writing files
with open('output.txt', 'w') as f:
    f.write("Hello, World!\n")
    f.writelines(["Line 1\n", "Line 2\n"])

# JSON handling
import json

data = {"name": "Alice", "age": 30}
with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)

with open('data.json', 'r') as f:
    loaded_data = json.load(f)

# CSV handling
import csv

with open('data.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Age'])
    writer.writerow(['Alice', 30])
```

## Modules and Packages

### Creating Modules
```python
# math_utils.py
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

PI = 3.14159

if __name__ == "__main__":
    print("Running math_utils directly")
```

### Importing
```python
import math_utils
from math_utils import add, PI
from math_utils import multiply as mult
import math_utils as mu

# Dynamic imports
import importlib
module = importlib.import_module('math_utils')
```

## Regular Expressions
```python
import re

text = "Email: alice@example.com, Phone: 123-456-7890"

# Basic patterns
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
phone_pattern = r'\d{3}-\d{3}-\d{4}'

# Finding matches
emails = re.findall(email_pattern, text)
phone_match = re.search(phone_pattern, text)

# Substitution
cleaned = re.sub(r'\d{3}-\d{3}-\d{4}', '[PHONE]', text)

# Compiled patterns (for performance)
email_regex = re.compile(email_pattern)
matches = email_regex.findall(text)
```

## Threading & Multiprocessing

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

t1.join()  # Wait for completion
t2.join()

# Thread synchronization
lock = threading.Lock()
shared_resource = 0

def increment():
    global shared_resource
    with lock:
        shared_resource += 1
```

### Multiprocessing
```python
import multiprocessing

def cpu_bound_task(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    with multiprocessing.Pool() as pool:
        results = pool.map(cpu_bound_task, [100000, 200000, 300000])
    print(results)
```

## Error Handling & Debugging

### Exception Hierarchy
```python
# Built-in exceptions
try:
    value = int("not_a_number")
except ValueError as e:
    print(f"ValueError: {e}")
except Exception as e:
    print(f"General exception: {e}")

# Custom exceptions
class ValidationError(Exception):
    def __init__(self, message, field=None):
        super().__init__(message)
        self.field = field

def validate_email(email):
    if "@" not in email:
        raise ValidationError("Invalid email format", field="email")
```

### Debugging Techniques
```python
import logging
import pdb

# Logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def debug_function(x):
    logger.debug(f"Input: {x}")
    result = x * 2
    logger.info(f"Result: {result}")
    return result

# Assertions
def divide(a, b):
    assert b != 0, "Division by zero"
    return a / b

# Debugger
def problematic_function():
    pdb.set_trace()  # Breakpoint
    return "debug me"
```

## Data Structures Implementation

### Stack
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
```

### Queue
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
```

### Linked List
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None
    
    def append(self, val):
        new_node = ListNode(val)
        if not self.head:
            self.head = new_node
            return
        
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def prepend(self, val):
        new_node = ListNode(val)
        new_node.next = self.head
        self.head = new_node
    
    def delete(self, val):
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
```

## Algorithms (Common Interview Questions)

### Sorting
```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

### Binary Search
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1

def binary_search_recursive(arr, target, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    
    if left > right:
        return -1
    
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    else:
        return binary_search_recursive(arr, target, left, mid - 1)
```

### Two Pointers Pattern
```python
def two_sum_sorted(arr, target):
    """Find two numbers that sum to target in sorted array"""
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []

def remove_duplicates(arr):
    """Remove duplicates from sorted array in-place"""
    if not arr:
        return 0
    
    write_index = 1
    for read_index in range(1, len(arr)):
        if arr[read_index] != arr[read_index - 1]:
            arr[write_index] = arr[read_index]
            write_index += 1
    
    return write_index
```

### Sliding Window
```python
def max_sum_subarray(arr, k):
    """Maximum sum of k consecutive elements"""
    if len(arr) < k:
        return None
    
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    for i in range(k, len(arr)):
        window_sum = window_sum - arr[i-k] + arr[i]
        max_sum = max(max_sum, window_sum)
    
    return max_sum

def longest_substring_without_repeating(s):
    """Length of longest substring without repeating characters"""
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length
```

## Dynamic Programming

### Memoization
```python
def fibonacci_memo(n, memo={}):
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)
    return memo[n]

# Using functools.lru_cache
from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci_cached(n):
    if n <= 1:
        return n
    return fibonacci_cached(n-1) + fibonacci_cached(n-2)
```

### Classic DP Problems
```python
def coin_change(coins, amount):
    """Minimum coins needed to make amount"""
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

def longest_common_subsequence(text1, text2):
    """Length of longest common subsequence"""
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]
```

## Built-in Functions & Libraries

### Collections Module
```python
from collections import Counter, defaultdict, deque, namedtuple, OrderedDict

# Counter
text = "hello world"
char_count = Counter(text)
print(char_count.most_common(3))

# defaultdict
dd = defaultdict(list)
dd['key'].append('value')  # No KeyError

# deque (double-ended queue)
dq = deque([1, 2, 3])
dq.appendleft(0)
dq.pop()

# namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)
```

### Itertools
```python
import itertools

# Combinations and permutations
data = [1, 2, 3]
print(list(itertools.combinations(data, 2)))  # [(1, 2), (1, 3), (2, 3)]
print(list(itertools.permutations(data, 2)))  # [(1, 2), (1, 3), (2, 1), ...]

# Infinite iterators
counter = itertools.count(start=5, step=2)  # 5, 7, 9, 11, ...
repeater = itertools.repeat('hello', 3)     # 'hello', 'hello', 'hello'

# Grouping
data = [('a', 1), ('a', 2), ('b', 3), ('b', 4)]
grouped = itertools.groupby(data, key=lambda x: x[0])
for key, group in grouped:
    print(f"{key}: {list(group)}")
```

## Common Gotchas & Best Practices

### Mutable Default Arguments
```python
# Wrong
def append_to_list(item, target_list=[]):
    target_list.append(item)
    return target_list

# Right
def append_to_list(item, target_list=None):
    if target_list is None:
        target_list = []
    target_list.append(item)
    return target_list
```

### Late Binding Closures
```python
# Wrong
functions = []
for i in range(3):
    functions.append(lambda: i)  # All return 2

# Right
functions = []
for i in range(3):
    functions.append(lambda x=i: x)  # Capture current value
```

### Shallow vs Deep Copy
```python
import copy

original = [[1, 2], [3, 4]]
shallow = copy.copy(original)
deep = copy.deepcopy(original)

original[0][0] = 999
print(shallow)  # [[999, 2], [3, 4]] - affected
print(deep)     # [[1, 2], [3, 4]] - not affected
```

## Testing

### Unit Testing
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
```python
import pytest

def test_add():
    calc = Calculator()
    assert calc.add(2, 3) == 5

def test_divide_by_zero():
    calc = Calculator()
    with pytest.raises(ValueError):
        calc.divide(10, 0)

# Fixtures
@pytest.fixture
def calculator():
    return Calculator()

def test_with_fixture(calculator):
    assert calculator.add(1, 1) == 2
```

## Performance & Optimization

### Timing Code
```python
import timeit

# Simple timing
def slow_function():
    return sum(range(1000))

execution_time = timeit.timeit(slow_function, number=1000)
print(f"Average time: {execution_time/1000:.6f}s")

# Profile with cProfile
import cProfile
cProfile.run('slow_function()')
```

### Memory Usage
```python
import sys
from memory_profiler import profile

@profile
def memory_intensive():
    big_list = [i for i in range(1000000)]
    return sum(big_list)

# Check object size
data = [1, 2, 3, 4, 5]
print(f"Size: {sys.getsizeof(data)} bytes")
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
```

### Array Problems
```python
def find_missing_number(nums):
    """Find missing number in range [0, n]"""
    n = len(nums)
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(nums)
    return expected_sum - actual_sum

def rotate_array(nums, k):
    """Rotate array to the right by k steps"""
    k = k % len(nums)
    nums[:] = nums[-k:] + nums[:-k]

def merge_intervals(intervals):
    """Merge overlapping intervals"""
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
        if 'speak' not in dct:
            raise TypeError("Class must define 'speak' method")
        super().__init__(name, bases, dct)

class Animal(metaclass=RequireSpeak):
    def speak(self):
        return "Sound"

a = Animal()
print(a.speak())  # Output: Sound
```

## Descriptors

- A descriptor is any object that defines at least one of `__get__`, `__set__`, or `__delete__` methods and is used as a class attribute.
- **Data descriptor**: defines both `__get__` and `__set__` (e.g., property with setter); **non-data descriptor**: only `__get__`.
- The `property` built-in is implemented using descriptors; allows custom logic for attribute access.
- Use descriptors for validation, computed properties, or managing access to attributes.

```python
# Example: Descriptor for positive values
class Positive:
    def __get__(self, instance, owner):
        return instance._value
    def __set__(self, instance, value):
        if value < 0:
            raise ValueError("Value must be positive")
        instance._value = value

class Account:
    balance = Positive()
    def __init__(self, balance):
        self.balance = balance

a = Account(100)
a.balance = 50
# a.balance = -10  # Raises ValueError
```

## Advanced String Operations

- Know all string formatting styles: f-strings (`f"{x}"`), `.format()`, and `%` formatting; prefer f-strings for new code.
- Understand the difference between Unicode strings (`str`) and byte strings (`bytes`); know how to encode/decode.
- String interning: Python may reuse immutable string objects for efficiency; use `sys.intern()` for large sets of repeated strings.
- Strings are immutable; all string operations create new objects.

```python
# Example: String formatting and interning
name = "Alice"
print(f"Hello, {name}!")  # f-string
print("Hello, {}!".format(name))  # .format()
print("Hello, %s!" % name)  # % formatting

import sys
a = sys.intern("hello")
b = sys.intern("hello")
print(a is b)  # True
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
```

## Design Patterns

- **Singleton**: ensure only one instance of a class exists (use a class variable or decorator).
- **Factory**: a function or class that creates objects, often based on input parameters.
- **Observer**: objects subscribe to events and get notified on changes (use callbacks or signals).
- Pythonic alternatives: use modules as singletons, or leverage first-class functions for factories.
- Be able to recognize and implement these patterns in Python.

```python
# Example: Singleton pattern
class Singleton:
    _instance = None
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance

s1 = Singleton()
s2 = Singleton()
print(s1 is s2)  # True
```

## Database Integration

- Connect to SQLite with `sqlite3` or to PostgreSQL/MySQL with libraries like `psycopg2` or `mysql-connector-python`.
- ORM basics: define models as classes, use sessions to query and persist data (SQLAlchemy).
- Always use context managers (`with` statement) for database connections to ensure cleanup.
- Prevent SQL injection by using parameterized queries, never string formatting for SQL.

```python
# Example: SQLite connection and query
import sqlite3
with sqlite3.connect(":memory:") as conn:
    c = conn.cursor()
    c.execute("CREATE TABLE users (id INTEGER, name TEXT)")
    c.execute("INSERT INTO users VALUES (?, ?)", (1, "Alice"))
    c.execute("SELECT * FROM users")
    print(c.fetchall())  # [(1, 'Alice')]
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

arr = np.array([1, 2, 3])
print(arr * 2)  # [2 4 6]

df = pd.DataFrame({"A": [1, 2], "B": [3, 4]})
print(df["A"].mean())  # 1.5
```

## Networking & APIs

- Use the `requests` library to make HTTP requests: `requests.get()`, `requests.post()`, handle headers and JSON.
- Parse JSON with `response.json()` and serialize with `json.dumps()`.
- Basic socket programming: create TCP/UDP clients and servers with the `socket` module.
- Always handle exceptions and timeouts in network code.

```python
# Example: HTTP GET request
import requests
response = requests.get("https://api.github.com")
print(response.status_code)
print(response.json())
```

## Security Considerations

- Always validate and sanitize user input to prevent injection attacks.
- Avoid using `eval` and `pickle` on untrusted data; prefer `json` for serialization.
- Use context managers for file/database operations to avoid resource leaks.
- Be aware of common vulnerabilities: code injection, insecure deserialization, improper permissions.

```python
# Example: Safe JSON deserialization
import json
data = '{"name": "Alice"}'
obj = json.loads(data)
print(obj["name"])
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
    return f"Hello, {name}"

p = Path("file.txt")
print(p.exists())

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

### Introduction to AsyncIO
```python
import asyncio

# Basic async function
async def say_hello():
    print("Hello")
    await asyncio.sleep(1)  # Non-blocking sleep
    print("World")

# Running async function
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
    # Method 1: gather (runs concurrently, waits for all)
    results = await asyncio.gather(task1(), task2())
    print(results)  # ['Task 1 complete', 'Task 2 complete']
    
    # Method 2: create_task (more control)
    t1 = asyncio.create_task(task1())
    t2 = asyncio.create_task(task2())
    result1 = await t1
    result2 = await t2
    
    # Method 3: as_completed (process as they finish)
    tasks = [task1(), task2()]
    for coro in asyncio.as_completed(tasks):
        result = await coro
        print(f"Got: {result}")

asyncio.run(main())
```

### Event Loop
```python
# Manual event loop management
loop = asyncio.get_event_loop()
try:
    result = loop.run_until_complete(fetch_data(1))
finally:
    loop.close()

# Get current running loop
async def get_loop_info():
    loop = asyncio.get_running_loop()
    print(f"Loop: {loop}")

# Schedule callbacks
def callback(arg):
    print(f"Callback called with {arg}")

async def schedule_callback():
    loop = asyncio.get_running_loop()
    loop.call_soon(callback, "data")
    loop.call_later(2, callback, "delayed")
    await asyncio.sleep(3)
```

### Async Context Managers
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

# Usage
async def main():
    async with AsyncDatabase() as db:
        result = await db.query("SELECT * FROM users")
        print(result)

asyncio.run(main())

# Using asynccontextmanager
from contextlib import asynccontextmanager

@asynccontextmanager
async def async_timer():
    start = asyncio.get_event_loop().time()
    try:
        yield
    finally:
        end = asyncio.get_event_loop().time()
        print(f"Elapsed: {end - start:.2f}s")

async def main():
    async with async_timer():
        await asyncio.sleep(1)
```

### Async Iterators and Generators
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
        print(num)

# Async generator
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
```python
# Lock
lock = asyncio.Lock()

async def critical_section(id):
    async with lock:
        print(f"Task {id} acquired lock")
        await asyncio.sleep(1)
        print(f"Task {id} released lock")

# Semaphore (limit concurrent access)
semaphore = asyncio.Semaphore(2)

async def limited_resource(id):
    async with semaphore:
        print(f"Task {id} accessing resource")
        await asyncio.sleep(2)
        print(f"Task {id} done")

# Event (signaling between coroutines)
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

# Queue (producer-consumer pattern)
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
        queue.task_done()

async def main():
    producers = [asyncio.create_task(producer(i)) for i in range(2)]
    consumers = [asyncio.create_task(consumer(i)) for i in range(2)]
    
    await asyncio.gather(*producers)
    await queue.join()  # Wait for all items to be processed
    
    for c in consumers:
        c.cancel()
```

### Error Handling
```python
async def failing_task():
    await asyncio.sleep(1)
    raise ValueError("Something went wrong")

async def main():
    try:
        await failing_task()
    except ValueError as e:
        print(f"Caught: {e}")
    
    # With gather - default behavior stops on first exception
    try:
        await asyncio.gather(
            failing_task(),
            asyncio.sleep(2)
        )
    except ValueError:
        print("First exception stops all")
    
    # return_exceptions=True to collect all results/exceptions
    results = await asyncio.gather(
        failing_task(),
        asyncio.sleep(2),
        return_exceptions=True
    )
    print(results)  # [ValueError(...), None]
    
    # Exception groups (Python 3.11+)
    async with asyncio.TaskGroup() as group:
        group.create_task(failing_task())
        group.create_task(asyncio.sleep(1))
    # Raises ExceptionGroup if any task fails
```

### Timeouts and Cancellation
```python
async def long_running_task():
    try:
        await asyncio.sleep(10)
        return "IO Complete"
    except asyncio.CancelledError:
        print("Task was cancelled")
        raise

async def main():
    # Method 1: wait_for with timeout
    try:
        result = await asyncio.wait_for(long_running_task(), timeout=2)
    except asyncio.TimeoutError:
        print("Task timed out")
    
    # Method 2: Manual cancellation
    task = asyncio.create_task(long_running_task())
    await asyncio.sleep(1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Task cancelled manually")
    
    # Method 3: shield from cancellation
    task = asyncio.create_task(long_running_task())
    try:
        await asyncio.shield(task)
    except asyncio.CancelledError:
        print("Outer cancelled, but task continues")
        await task  # Wait for completion

asyncio.run(main())
```

### Async HTTP Requests with aiohttp
```python
import aiohttp

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    async with aiohttp.ClientSession() as session:
        # Single request
        html = await fetch_url(session, "https://example.com")
        
        # Multiple concurrent requests
        urls = [
            "https://example.com",
            "https://httpbin.org/delay/1",
            "https://httpbin.org/delay/2"
        ]
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        
        # POST request
        async with session.post(
            "https://httpbin.org/post",
            json={"key": "value"}
        ) as response:
            data = await response.json()
            print(data)

asyncio.run(main())
```

### Running Blocking Code
```python
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def blocking_io():
    time.sleep(2)
    return "IO Complete"

def cpu_bound_task(n):
    return sum(i * i for i in range(n))

async def main():
    # Method 1: run_in_executor with default thread pool
    result = await asyncio.get_event_loop().run_in_executor(
        None, blocking_io
    )
    print(result)
    
    # Method 2: Custom thread pool
    with ThreadPoolExecutor(max_workers=3) as executor:
        result = await asyncio.get_event_loop().run_in_executor(
            executor, blocking_io
        )
    
    # Method 3: Process pool for CPU-bound tasks
    with ProcessPoolExecutor() as executor:
        result = await asyncio.get_event_loop().run_in_executor(
            executor, cpu_bound_task, 1000000
        )
    
    # Method 4: asyncio.to_thread (Python 3.9+)
    result = await asyncio.to_thread(blocking_io)

asyncio.run(main())
```

### Async File I/O with aiofiles
```python
import aiofiles

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
    
    # Concurrent file operations
    tasks = [
        write_file(f'file{i}.txt', f'Content {i}')
        for i in range(5)
    ]
    await asyncio.gather(*tasks)

asyncio.run(main())
```

### Async Database Operations
```python
import asyncpg  # PostgreSQL
import aiomysql  # MySQL

# PostgreSQL example
async def postgres_example():
    conn = await asyncpg.connect(
        user='user', password='password',
        database='testdb', host='localhost'
    )
    
    # Single query
    values = await conn.fetch('SELECT * FROM users WHERE age > $1', 25)
    
    # Transaction
    async with conn.transaction():
        await conn.execute('INSERT INTO users VALUES ($1, $2)', 'Alice', 30)
        await conn.execute('UPDATE accounts SET balance = balance - $1', 100)
    
    await conn.close()

# MySQL example
async def mysql_example():
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
```python
import websockets

async def echo_handler(websocket, path):
    async for message in websocket:
        print(f"Received: {message}")
        await websocket.send(f"Echo: {message}")

async def main():
    async with websockets.serve(echo_handler, "localhost", 8765):
        await asyncio.Future()  # Run forever

# WebSocket client
async def client():
    async with websockets.connect("ws://localhost:8765") as websocket:
        await websocket.send("Hello, server!")
        response = await websocket.recv()
        print(response)

asyncio.run(main())
```

### Subprocess Management
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
    commands = ["ls -la", "pwd", "echo 'Hello'"]
    tasks = [run_command(cmd) for cmd in commands]
    results = await asyncio.gather(*tasks)
    return results

# Streaming output
async def stream_output(cmd):
    process = await asyncio.create_subprocess_shell(
        cmd,
        stdout=asyncio.subprocess.PIPE
    )
    
    async for line in process.stdout:
        print(line.decode().strip())
    
    await process.wait()
```

### Common Patterns and Best Practices

#### Pattern: Retry with Exponential Backoff
```python
async def retry_with_backoff(coro, max_retries=3, base_delay=1):
    for attempt in range(max_retries):
        try:
            return await coro()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            delay = base_delay * (2 ** attempt)
            print(f"Attempt {attempt + 1} failed, retrying in {delay}s")
            await asyncio.sleep(delay)

async def unreliable_api_call():
    # Simulated API call that might fail
    import random
    if random.random() < 0.7:
        raise Exception("API Error")
    return "Success"

async def main():
    result = await retry_with_backoff(unreliable_api_call)
    print(result)
```

#### Pattern: Rate Limiting
```python
import time

class RateLimiter:
    def __init__(self, rate, per):
        self.rate = rate
        self.per = per
        self.allowance = rate
        self.last_check = time.time()
    
    async def acquire(self):
        current = time.time()
        time_passed = current - self.last_check
        self.last_check = current
        self.allowance += time_passed * (self.rate / self.per)
        
        if self.allowance > self.rate:
            self.allowance = self.rate
        
        if self.allowance < 1.0:
            sleep_time = (1.0 - self.allowance) * (self.per / self.rate)
            await asyncio.sleep(sleep_time)
            self.allowance = 0.0
        else:
            self.allowance -= 1.0

# Usage
limiter = RateLimiter(rate=5, per=1)  # 5 requests per second

async def make_request(i):
    await limiter.acquire()
    print(f"Request {i} at {time.time()}")

async def main():
    await asyncio.gather(*[make_request(i) for i in range(10)])
```

#### Pattern: Graceful Shutdown
```python
async def background_task():
    try:
        while True:
            print("Working...")
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        print("Shutting down gracefully...")
        # Cleanup code here
        raise

async def main():
    task = asyncio.create_task(background_task())
    
    try:
        await asyncio.sleep(5)
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            print("Task cancelled successfully")

asyncio.run(main())
```
