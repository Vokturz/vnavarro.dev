---
title: 'Running Python in the Browser'
date: '2025-08-03'
summary: 'How I implemented a full-featured Python runtime for my personal website. Basically Jupyter Notebook in the browser.'
runnable: true
icon: 'python'
tags: ['web', 'javascript', 'python']
---

The web has traditionally been JavaScript's domain, but what if you could run Python directly in the browser? With **Pyodide**, this becomes not just possible, but practical. In this post, I'll share my experience implementing a full-featured Python runtime for my personal website, complete with interactive code execution and execution control.

# What is Pyodide?

[Pyodide](https://pyodide.org/en/stable/) is a Python distribution for the browser and Node.js based on WebAssembly. It makes it possible to install and run Python packages in the browser, including scientific packages like NumPy, Pandas, and Matplotlib. Think of it as bringing the power of a Jupyter notebook directly to your web application.

```python
# This Python code runs entirely in your browser!
import numpy as np
import matplotlib.pyplot as plt

# Generate some sample data
x = np.linspace(0, 2 * np.pi, 100)
y = np.sin(x)

# Create a plot
plt.figure(figsize=(8, 4))
plt.plot(x, y, 'b-', linewidth=2, label='sin(x)')
plt.grid(True, alpha=0.3)
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.title('Sine Wave Generated in Browser')
plt.legend()
plt.show()
```

# The Architecture: WebWorkers and Isolation

One of the biggest challenges with running Python in the browser is preventing long-running computations from blocking the main UI thread. The straightforward solution is to use a **[WebWorker](https://github.com/Vokturz/vnavarro.dev/blob/main/src/lib/pyodide-worker.ts)** architecture that completely isolates Python execution:

```typescript
// Main thread - creating the worker
worker = new Worker(new URL('./pyodide-worker.ts', import.meta.url), {
  type: 'module'
})
```

The worker handles all Python execution while the main thread manages the UI. This means you can run complex computations without freezing the interface. The worker loads Pyodide along with essential packages:

```typescript
// Inside the worker - package loading
await pyodide.loadPackage(['numpy', 'matplotlib', 'pandas', 'tqdm'])
```

# The SharedArrayBuffer Challenge

How do you stop a long-running Python script that's executing in a WebWorker? Traditional approaches like `worker.terminate()` would destroy the entire Python environment, forcing a reload. Here's where **[SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)** comes in: they allow us to, as the name suggests, share data between multiple JavaScript contexts.

```typescript
// Creating the interrupt buffer inside
if (typeof SharedArrayBuffer !== 'undefined') {
  interruptBuffer = new Uint8Array(new SharedArrayBuffer(1))
  worker.postMessage({ type: 'set-interrupt-buffer', interruptBuffer })
}
```

This creates a single byte of shared memory that acts as our "stop button." When a user clicks the stop button during execution:

```typescript
// Signal interruption
if (interruptBuffer) {
  interruptBuffer[0] = 2 // Signal SIGINT
}
```

On the worker side, Pyodide can check this buffer and gracefully interrupt execution:

```typescript
// In the worker - setting up interrupt handling
if (interruptBuffer) {
  pyodide.setInterruptBuffer(interruptBuffer)
}
```

This approach is elegant because it allows for *graceful interruption* - Python can clean up resources, close files, and handle the interruption properly rather than being brutally terminated.

It's important to mention that SharedArrayBuffer requires `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` policies:
- For Sveltekit you can create a [hook.server.ts](https://github.com/Vokturz/vnavarro.dev/blob/main/src/hooks.server.ts) file
- For Vite, you can set the server.headers directly in the [vite.config.ts](https://github.com/Vokturz/vnavarro.dev/blob/main/vite.config.ts) file
- If you are deploying in Vercel, then the headers must be set in the [vercel.json](https://github.com/Vokturz/vnavarro.dev/blob/main/vercel.json) file

```python
# Try running this two blocks in a row (you can press Ctrl+Shift to execute each one)
# and stop the execution of this for loop
import time
for i in range(10):
    print(f"Processing {i}")
    time.sleep(1)
```

```python
print("Hello World")
```

# Making the Experience Interactive

## Real-time Output Streaming

Traditional code execution shows results only after completion. For a true notebook-like experience, real-time output streaming captures `print()` statements and displays them as they happen. The Pyodide worker intercepts stdout and stderr, sending output back to the main thread via `postMessage` for immediate display, creating a live terminal-like experience.

```python
print("Hello")
print("World")
```

## Smart Expression Evaluation

To mimic Jupyter notebook behavior, the system automatically displays the result of the last expression in a code cell:

```python
import numpy as np
random = np.random.rand(3, 3)
random
```


## Handling `tqdm` Progress Bars

One particularly tricky challenge was supporting progress bars from libraries like `tqdm`. These typically use carriage returns (`\r`) to overwrite the same line, which doesn't work well in HTML. The solution involved creating a custom `WebTqdm` class that outputs each progress update on a new line while maintaining the visual progress indication. The worker detects progress bar output and handles it with special formatting for better web display.

```python
from tqdm import tqdm
import time
for i in tqdm(range(10)):
    time.sleep(0.2)
print('Done!')
```

## Error Handling and Debugging

The Python runtime also provides intelligent error handling with line highlighting. When an error occurs, the problematic line is visually highlighted in the code editor, making debugging much easier:

```python
# This line will cause an error - division by zero
result = 10 / 0
print("This line won't be reached")
```


# Try it Yourself!

Nothing beats hands-on experience! The code blocks below demonstrate the full capabilities of this Python-in-browser implementation. Each block is fully interactive - you can modify the code, run it, and see the results in real-time.

## Data Analysis with Pandas and NumPy

```python
import pandas as pd
import numpy as np
from tqdm import tqdm
import time

# Create a sample dataset
data = []
print("Generating sample data...")

for i in tqdm(range(1000), desc="Processing"):
    data.append({
        'id': i,
        'value': np.random.normal(100, 15),
        'category': np.random.choice(['A', 'B', 'C']),
        'timestamp': pd.Timestamp.now() - pd.Timedelta(hours=i)
    })
    if i % 100 == 0:
        time.sleep(0.1)  # Small delay to see streaming

df = pd.DataFrame(data)
print(f"\nDataset created with {len(df)} rows")
print("\nFirst 5 rows:")
df.head()
```

## Data Visualization

```python
import matplotlib.pyplot as plt

# Analyze our data
category_stats = df.groupby('category')['value'].agg(['mean', 'std', 'count'])
print("Statistics by category:")
print(category_stats)

# Create visualizations
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Histogram of values
ax1.hist(df['value'], bins=30, alpha=0.7, edgecolor='black')
ax1.set_title('Distribution of Values')
ax1.set_xlabel('Value')
ax1.set_ylabel('Frequency')
ax1.grid(True, alpha=0.3)

# Box plot by category
df.boxplot(column='value', by='category', ax=ax2)
ax2.set_title('Values by Category')
ax2.set_xlabel('Category')
ax2.set_ylabel('Value')

plt.tight_layout()
plt.show()
```

## Interactive Computation

```python
# Try modifying these parameters and re-running!
n_samples = 500
noise_level = 0.1

# Generate some interesting data
t = np.linspace(0, 4*np.pi, n_samples)
signal = np.sin(t) + 0.5*np.cos(3*t)
noisy_signal = signal + noise_level * np.random.randn(len(t))

plt.figure(figsize=(10, 6))
plt.plot(t, signal, 'b-', linewidth=2, label='Original Signal', alpha=0.8)
plt.plot(t, noisy_signal, 'r.', markersize=3, label='Noisy Signal', alpha=0.6)
plt.xlabel('Time')
plt.ylabel('Amplitude')
plt.title(f'Signal Processing Demo (n={n_samples}, noise={noise_level})')
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

print(f"Signal-to-noise ratio: {np.var(signal)/np.var(noisy_signal - signal):.2f}")
```

---

> *Want to see more about how this works? Check out the [source code](https://github.com/vokturz/vnavarro.dev) for this website, where you can explore the full Pyodide integration in detail.*
