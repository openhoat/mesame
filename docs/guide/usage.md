# Usage

## Admin Dashboard

The MeSame admin dashboard provides a complete interface for managing your style profile, sources, and configuration.

### Accessing the Dashboard

- **Web UI**: Navigate to `http://localhost:3000` after starting the server (or your configured web server port)

### Navigation

The dashboard has several sections:

- **Chat** — Test the style proxy with a chat interface
- **Sources** — Import and manage your source documents
- **Style Profile** — View and edit your generated style profile
- **Logs** — Monitor proxy requests in real-time
- **Settings** — Configure LLM provider and API keys

## Managing Sources

### Importing Documents

1. Go to **Admin → Sources**
2. Click "Upload Document"
3. Select files (supported formats: PDF, Markdown `.md`, plain text `.txt`)
4. Files are parsed and stored in SQLite database

### Viewing Sources

- **List View**: See all imported documents with metadata (filename, size, upload date)
- **Detail View**: Click on a source to view extracted text content
- **Delete**: Remove sources you no longer need

### Supported Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| **PDF** | `.pdf` | Text extraction via `pdf-parse` |
| **Markdown** | `.md` | Full markdown syntax supported |
| **Plain Text** | `.txt` | Raw text content |

## Style Profile

### Generating a Profile

1. Upload at least one source document
2. Go to **Admin → Style Profile**
3. Click "Analyze Documents"
4. MeSame will:
   - Extract linguistic patterns (TF-IDF, N-Grams)
   - Calculate metrics (avg sentence length, lexical richness)
   - Generate a System Prompt describing your style

### Viewing the Profile

The profile includes:

- **System Prompt** — Auto-generated instructions for the LLM
- **Key Patterns** — Top words and phrases that characterize your style
- **Metrics** — Sentence length, vocabulary richness, tone indicators

### Editing the Profile

You can manually edit the System Prompt to fine-tune how the AI should mimic your style:

1. Click "Edit Profile"
2. Modify the System Prompt text
3. Save changes

## Using the Chat Interface

The chat interface lets you test the style proxy in real-time.

### Starting a Chat

1. Go to **Chat** page
2. Ensure your provider is configured (Settings)
3. Type a message and press Enter
4. The response will be generated with your style injected

### How It Works

When you send a chat message:

1. Frontend sends `POST /api/chat/completions` to MeSame proxy
2. Proxy fetches your style profile from database
3. Injects style System Prompt into the request
4. Forwards to target LLM (OpenAI, Claude, Google, Ollama)
5. Streams response back to frontend (SSE)

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | Insert new line |
| `Ctrl+K` | Clear conversation |

## Monitoring Logs

The **Logs** page shows real-time proxy activity:

- **Request URL** — Endpoint called
- **Method** — HTTP method (GET, POST)
- **Status** — Response status code
- **Timestamp** — When the request occurred
- **Payload** — Request body (for debugging)

Use logs to:
- Debug integration issues
- Monitor which apps are using the proxy
- Verify style injection is working

## Using the Proxy with External Apps

MeSame provides an OpenAI-compatible proxy at:

```
http://localhost:3001/v1/chat/completions
```

### Example: curl

```bash
curl http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "user", "content": "Write a short intro about AI"}
    ]
  }'
```

### Example: OpenAI SDK (Python)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:3001/v1",
    api_key="dummy"  # Not checked by proxy
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Write a short intro about AI"}
    ]
)

print(response.choices[0].message.content)
```

### Example: OpenAI SDK (JavaScript)

```javascript
import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: 'http://localhost:3001/v1',
  apiKey: 'dummy' // Not checked by proxy
})

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'Write a short intro about AI' }
  ]
})

console.log(response.choices[0].message.content)
```

### Example: LangChain

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="http://localhost:3001/v1",
    api_key="dummy",
    model="gpt-4o"
)

response = llm.invoke("Write a short intro about AI")
print(response.content)
```

## Provider Selection

The proxy determines which LLM to use based on:

1. **`MESAME_PROVIDER`** environment variable (default)
2. **Settings** in admin dashboard (overrides env var)

Supported providers:
- `openai` — OpenAI GPT models
- `anthropic` — Claude models
- `google` — Google Gemini models
- `ollama` — Local Ollama models

> See the [Configuration guide](/guide/configuration) for detailed provider setup instructions.
