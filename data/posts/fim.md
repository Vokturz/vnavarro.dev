---
title: 'Fill-in-the-Middle: The Magic Behind Smart Code Completion'
date: '2025-08-11'
summary: 'How your favorite code editor suggests exactly what you were thinking of'
runnable: true
icon: ''
tags: ['transformers', 'python']
---

Fill-in-the-Middle (FIM) is a technique in code completion that allows language models to generate code based on context from **both before and after the cursor**. Unlike traditional left-to-right autocompletion, which only sees past code, FIM provides a "peek into the future," enabling significantly more accurate and contextually aware suggestions.

The technique was popularized by OpenAI's 2022 paper, *["Efficient Training of Language Models to Fill in the Middle"](https://arxiv.org/abs/2207.14255)*, which detailed an effective method for training models on this task. This approach has since become a cornerstone for many state-of-the-art coding assistants, such as *GitHub Copilot*, *Windsurf*, *CodeGPT*, *Cursor*, *Continue.dev*, and others.

---

# How FIM Works

FIM models are trained to understand a specific structure using special control tokens. The idea is to mark the beginning of the code that comes *before* the cursor and the beginning of the code that comes *after* the cursor using special tokens. The FIM paper proposes the following structure for training:

$\text{<PRE>}\,\circ\,\text{Enc(prefix)}\,\circ\,\text{<SUF>}\,\circ\,\text{Enc(suffix)}\,\circ\,\text{<MID>}\,\circ\,\text{Enc(middle)}$

Where $\text{<PRE>}$ refers to the prefix token, $\text{<SUF>}$ to the suffix token, and $\text{<MID>}$ to the middle token. $\text{Enc}(\cdot)$ corresponds to the encoding function (the tokenizer) and $\circ$ to the concatenation operation. So, for example, a training example could have the following as [green:prefix], [red:suffix], and [purple:middle]:

```colorized
%%green:def fibonacci(n, memo={}):
    if n <= 0:
        return 0%%
%%purple:    elif n == 1:
        return 1
    elif n in memo:
        return memo[n]%%
%%red:    else:
        memo[n] = fibonacci(n-1) + fibonacci(n-2)
        return memo[n]%%
```

Then for inference, the idea is to determine $\text{Enc(middle)}$, i.e., the code in the middle. The prompt looks like:

$\text{<PRE>}\,\circ\,\text{Enc(prefix)}\,\circ\,\text{<SUF>}\,\circ\,\text{Enc(suffix)}\,\circ\,\text{<MID>}$

Of course, this isn't just for code. It can also work for natural language generation. For example, in the classic example of *The quick brown fox jumps over the lazy dog.*, this (without encoding) would look like this:

$\text{<PRE>}$ [green:The quick brown fox] $\text{<SUF>}$ [red:the lazy dog.] $\text{<MID>}$ [purple:jumps over ]

# Making It Work

The model used in this demonstration, **Qwen2.5-Coder**, employs the following tokens to frame the problem:

-   `<|fim_prefix|>`: Marks the beginning of the code that comes [green:before] the cursor.
-   `<|fim_suffix|>`: Marks the beginning of the code that comes [red:after] the cursor.
-   `<|fim_middle|>`: A prompt for the model, indicating where it needs to generate the missing code in the [purple:middle].

By combining these, we create a single prompt that gives the model a complete picture of the surrounding code.

## Setting Up The Environment

First, let's set up the environment by loading the necessary libraries and the pre-trained FIM model from the Hugging Face Hub. We'll use `transformers.js` (inside Python) to run the model directly in the browser.

```python
import micropip
from tqdm import tqdm
import numpy as np

# Load transformers.js, a library to run models in the browser
await micropip.install(["transformers_js_py"])
from transformers_js_py import import_transformers_js
transformers = await import_transformers_js()

# A progress bar to monitor the model download
pbar = tqdm(total=100, desc='Downloading model', unit='%')
def progress_callback(p):
    file_name = p.get('file', '')
    status = p.get('status')
    if not file_name.endswith('.onnx'):
        return
    if status == 'progress':
        pbar.n = int(p.get('progress', 0))
        pbar.desc = file_name
        pbar.refresh()
    elif status == 'done':
        pbar.n = 100
        pbar.close()

# The model ID for a FIM-capable model
# NOTE: We use a smaller ONNX model to stay within browser memory limits
# https://onnxruntime.ai/docs/tutorials/web/large-models.html#protobuf-file-size-limit
model_id = 'onnx-community/Qwen2.5-Coder-1.5B'

# Load the tokenizer and the model
AutoTokenizer = transformers.AutoTokenizer
tokenizer = await AutoTokenizer.from_pretrained(model_id)
print("Tokenizer loaded.")

AutoModelForCausalLM = transformers.AutoModelForCausalLM
model = await AutoModelForCausalLM.from_pretrained(
    model_id,
    progress_callback = lambda p: progress_callback(p.to_py())
)
print("Model download complete.")
````

## Basic FIM Completion

Now, let's define a function to perform FIM. It will take a `prefix` and `suffix`, construct the special FIM prompt, and generate the code to fill the gap.

```python
async def fim_complete(prefix, suffix, max_tokens=50):
    # Construct the FIM prompt with special tokens
    fim_prompt = f"<|fim_prefix|>{prefix}<|fim_suffix|>{suffix}<|fim_middle|>"

    inputs = tokenizer(fim_prompt, return_tensors="pt")
    up = np.array(inputs["input_ids"].tolist(), dtype=np.uint32)
    input_length = up.shape[1]

    # Generate the completion
    outputs = await model.generate(
        **inputs,
        max_new_tokens=max_tokens,
        do_sample=False, # Use greedy decoding for deterministic output
        pad_token_id=tokenizer.eos_token_id
    )

    # Decode only the newly generated tokens
    c = np.array(outputs.tolist(), dtype=np.uint32)
    completion = tokenizer.decode([int(token) for token in c[0]][input_length:], skip_special_tokens=True)
    return completion

print("FIM completion function ready!")
```

Let's try it on a classic `quicksort` function where we've "deleted" the line `left = [x for x in arr if x < pivot]\n`.

```python
prefix = """def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    """

suffix = """
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)"""

completion = await fim_complete(prefix, suffix)
print("Raw Completion:\n------")
print(repr(completion))
print("\n------\nFull function (before cleaning):\n------")
print(prefix + completion + suffix)
```

You'll notice that the raw output might not be as clean as expected. In many cases, especially for smaller models, it includes the necessary code but also some extra characters from the prefix and/or suffix.

-----

# The Need for Cleaning and `stop_words`

To get clean, usable output, we need to address two issues:

1.  **Overlapping Text**: The model might generate text that's already present.
2.  **Over-generation**: The model might not know when to stop and continue generating code beyond the logical completion point.

## Cleaning Overlapping Text

Let's create a utility function to trim any generated text that overlaps with the `prefix` and `suffix`. This way, we can ensure the output is free from any unwanted characters.

```python
def clean_fim_completion(completion, prefix, suffix):
    """
    Cleans a Fill-in-the-Middle completion by removing overlapping text
    that may be duplicated from the prefix or suffix.
    """
    # 1. Trim suffix overlap
    # Find the longest suffix of `completion` that is also a prefix of `suffix`.
    for i in range(min(len(completion), len(suffix)), 0, -1):
        if completion.endswith(suffix[:i]):
            completion = completion[:-i]
            break

    # 2. Trim prefix overlap
    # Find the longest prefix of `completion` that is also a suffix of `prefix`.
    for i in range(min(len(completion), len(prefix)), 0, -1):
        if completion.startswith(prefix[-i:]):
            completion = completion[i:]
            break

    return completion

# Let's clean our previous quicksort completion
cleaned_completion = clean_fim_completion(completion, prefix, suffix)
print("Cleaned Completion:\n------")
print(repr(cleaned_completion))
print("\n------\nFull function with cleaned completion:\n------")
print(prefix + cleaned_completion + suffix)
```

## Using `stop_words` to Prevent Over-generation

A more robust way to control the output is by using **`stop_words`**. These are strings that, when generated, tell the model to stop immediately. Choosing them wisely is key to getting good results.

Let's modify our generation function to handle `stop_words`. We'll implement it manually by post-processing the output; however, applications like [Ollama](https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values), [vLLM](https://docs.vllm.ai/en/v0.6.4/dev/sampling_params.html), and providers like [OpenRouter](https://openrouter.ai/docs/api-reference/parameters#stop) accept a `stop_words` parameter.

```python
async def fim_complete_v2(prefix, suffix, stop_words=[], max_tokens=100):
    """
    Generates a FIM completion and stops generating if it encounters
    any of the specified stop_words.
    """
    fim_prompt = f"<|fim_prefix|>{prefix}<|fim_suffix|>{suffix}<|fim_middle|>"
    inputs = tokenizer(fim_prompt, return_tensors="pt")
    up = np.array(inputs["input_ids"].tolist(), dtype=np.uint32)
    input_length = up.shape[1]

    # We add the FIM control tokens to the stop list by default
    all_stop_words = stop_words + ["<|fim_prefix|>", "<|fim_suffix|>", "<|fim_middle|>", "<|endoftext|>"]

    outputs = await model.generate(
        **inputs,
        max_new_tokens=max_tokens,
        do_sample=False,
        pad_token_id=tokenizer.eos_token_id
    )

    c = np.array(outputs.tolist(), dtype=np.uint32)
    completion = tokenizer.decode([int(token) for token in c[0]][input_length:], skip_special_tokens=True)

    # Find the earliest occurrence of any stop word and truncate
    min_stop_index = len(completion)
    for word in all_stop_words:
        index = completion.find(word)
        if index != -1 and index < min_stop_index:
            min_stop_index = index

    completion = completion[:min_stop_index]

    # Finally, clean any remaining overlap with the suffix
    cleaned_completion = clean_fim_completion(completion, prefix, suffix)
    return cleaned_completion

print("FIM completion function v2 (with stop words) is ready.")
```

-----

# Examples

## Completing a JavaScript Object

Imagine completing a value in a JavaScript object. We know the completion should stop before the closing curly brace `}`.

```python
prefix = """const user = {
  name: "Alex",
  id: """
suffix = "\n}"
stop_words = ["\n", "}"]

completion = await fim_complete_v2(prefix, suffix, stop_words=stop_words)
print("Completion:\n------")
print(repr(completion))
print("\n------\nFull object:\n------")
print(prefix + completion + suffix)
```

Here, using `\n` and `}` as stop words correctly prevents the model from generating the closing brace, which is already in the `suffix`.

## Completing Python Dictionary Items

```python
prefix = """config = {
    'user': 'admin',
    'port': 8080,
    'host': """
suffix = ",\n}"

# We expect a string, so the next logical element is the comma or a new line
stop_words = [",", "\n"]

completion = await fim_complete_v2(prefix, suffix, stop_words=stop_words)
print("Completion:\n------")
print(repr(completion))
print("\n------\nFull dictionary:\n------")
print(prefix + completion + suffix)
```

## Adding Import Statements

Here the model will add the `import matplotlib.pyplot as plt` to the code:

```python
prefix = """import numpy as np"""
suffix = """

x = np.arange(1,100)
y = np.random.randint(1,100,100)
plt.plot(x,y)
"""
# The completion should stop next after finding the initialization of the variable x
stop_words = ["\nx"]

completion = await fim_complete_v2(prefix, suffix, stop_words=stop_words)
print("Completion:\n------")
print(repr(completion))
print("\n------\nFull block:\n------")
print(prefix + completion + suffix)
```

## Completing a TypeScript Class

```python
prefix = """class User {
  constructor(name: string, email: string, number: """
suffix = """
  }
}

const user = new User('John Doe', 'john@example.com');
console.log(user.name);"""

completion = await fim_complete_v2(prefix, suffix, stop_words=stop_words)
print("Completion:\n------")
print(repr(completion))
print("\n------\nFull block:\n------")
print(prefix + completion + suffix)
```

---

# Real implementations

How is FIM being implemented in real-world applications? While our basic cleanup function and use of stop words are a great start, creating a top-of-the-line inline completion feature requires a few more tricks. Production-ready tools often add more sophisticated post-processing steps:
- **Removing Repetitive Content**: Models can sometimes get stuck in a loop and repeat the same code. An effective implementation needs to detect and trim this redundant content.
- **Smart Bracket Closing**: The `stop_words` we choose might accidentally cut off a closing bracket or parenthesis. A robust implementation intelligently handles bracket pairing to ensure syntactically correct code.
- **Correcting Python Identation**: Perfect indentation is non-negotiable in Python. Advanced tools often include logic to fix incorrect indentation from the model, preventing frustrating syntax errors.

Examples of these implementations are in [Continue.dev](https://github.com/continuedev/continue/tree/main/core/autocomplete) and [vscode-copilot-chat](https://github.com/microsoft/vscode-copilot-chat/tree/main/src/platform/inlineEdits) github.

Other code editors, such as [Cursor](https://docs.cursor.com/en/tab/overview) and [Zed](https://zed.dev/docs/ai/edit-prediction), takes this even further. They build predictive editing features that anticipate your next changes, likely using advanced techniques that rely on Language Server Protocol ([LSP](https://microsoft.github.io/language-server-protocol/)) or [tree-sitter](https://tree-sitter.github.io/tree-sitter/) for deeper code analysis.

# Conclusion

And there you have it. Fill-in-the-Middle isn't some kind of dark art; it's just a clever trick that gives the AI a sneak peek at what's coming next in your code. By letting the model see both the beginning and the end, it can make a much better guess about what belongs in between.

So the next time your editor finishes your line of code so perfectly it feels like it's reading your mind, you'll know exactly how the trick works.

![](https://c.tenor.com/mebKvSZt-N4AAAAd/tenor.gif)
> "Future be like tab tab tab" - **Andrej Karpathy**
