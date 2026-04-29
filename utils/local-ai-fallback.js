// Local fallback question/explanation generator (no API key needed)
// Generates proper MCQ format with options and correctOption

const normalizeTopics = (topicsToFocus) =>
  String(topicsToFocus || "")
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);

// =============================================
// MCQ Question Banks per topic area
// =============================================

const QUESTION_BANKS = {
  "React": [
    { question: "What is the Virtual DOM in React?", options: ["A) A direct copy of the browser DOM", "B) A lightweight JavaScript representation of the real DOM", "C) A database for storing component state", "D) A CSS rendering engine"], correctOption: 1, answer: "**Correct Answer: B) A lightweight JavaScript representation of the real DOM**\n\nThe Virtual DOM is an in-memory representation of the actual DOM. React uses it to calculate the minimum number of changes needed, then batches updates to the real DOM for performance.\n\n**Key points:**\n- Diffing algorithm compares old and new Virtual DOM\n- Only changed elements are updated in the real DOM\n- This makes React fast for UI updates" },
    { question: "What are React Hooks?", options: ["A) CSS styling utilities", "B) Backend API connectors", "C) Functions that let you use state and lifecycle features in function components", "D) Testing frameworks for React"], correctOption: 2, answer: "**Correct Answer: C) Functions that let you use state and lifecycle features in function components**\n\nHooks like `useState`, `useEffect`, and `useContext` allow function components to manage state and side effects without classes.\n\n```js\nconst [count, setCount] = useState(0);\nuseEffect(() => { document.title = count; }, [count]);\n```" },
    { question: "What is the purpose of useEffect in React?", options: ["A) To style components dynamically", "B) To perform side effects in function components", "C) To create new React elements", "D) To handle form validation only"], correctOption: 1, answer: "**Correct Answer: B) To perform side effects in function components**\n\n`useEffect` runs after render and is used for data fetching, subscriptions, DOM manipulation, and cleanup.\n\n**Key points:**\n- Runs after every render by default\n- Dependency array controls when it re-runs\n- Return a cleanup function for subscriptions" },
    { question: "What is JSX in React?", options: ["A) A separate programming language", "B) A syntax extension that allows writing HTML-like code in JavaScript", "C) A database query language", "D) A CSS preprocessor"], correctOption: 1, answer: "**Correct Answer: B) A syntax extension that allows writing HTML-like code in JavaScript**\n\nJSX is syntactic sugar for `React.createElement()`. Babel transpiles it into regular JavaScript function calls." },
    { question: "What is the difference between state and props in React?", options: ["A) State is immutable, props are mutable", "B) Props are passed from parent, state is managed internally by the component", "C) State is only for class components", "D) Props and state are the same thing"], correctOption: 1, answer: "**Correct Answer: B) Props are passed from parent, state is managed internally by the component**\n\n**Props** are read-only data passed down from parent. **State** is local, mutable data managed within the component itself." },
  ],
  "Node.js": [
    { question: "What is the Event Loop in Node.js?", options: ["A) A UI rendering cycle", "B) A mechanism that handles asynchronous callbacks by offloading operations to the system kernel", "C) A looping construct like for/while", "D) A database connection pool"], correctOption: 1, answer: "**Correct Answer: B) A mechanism that handles asynchronous callbacks**\n\nThe Event Loop allows Node.js to perform non-blocking I/O despite JavaScript being single-threaded. It offloads operations to the kernel and processes callbacks when operations complete.\n\n**Phases:** timers → pending callbacks → poll → check → close callbacks" },
    { question: "What is middleware in Express.js?", options: ["A) A database migration tool", "B) Functions that have access to req, res, and next in the request-response cycle", "C) A frontend routing library", "D) A CSS framework"], correctOption: 1, answer: "**Correct Answer: B) Functions that have access to req, res, and next**\n\nMiddleware functions execute during the request lifecycle. They can modify `req`/`res`, end the request, or call `next()` to pass control.\n\n```js\napp.use((req, res, next) => {\n  console.log(`${req.method} ${req.url}`);\n  next();\n});\n```" },
    { question: "What is the difference between require() and import in Node.js?", options: ["A) They are identical", "B) require is CommonJS (synchronous), import is ES Modules (can be async)", "C) import only works in browsers", "D) require is deprecated"], correctOption: 1, answer: "**Correct Answer: B) require is CommonJS (synchronous), import is ES Modules (can be async)**\n\n- `require()` — CommonJS, synchronous, dynamic\n- `import` — ESM, static analysis, tree-shakeable\n- Use `\"type\": \"module\"` in package.json for ESM" },
    { question: "What is the purpose of package.json?", options: ["A) To store database credentials", "B) To define project metadata, scripts, and dependencies", "C) To compile JavaScript code", "D) To manage CSS styles"], correctOption: 1, answer: "**Correct Answer: B) To define project metadata, scripts, and dependencies**\n\npackage.json is the manifest file that includes project name, version, scripts, dependencies, and configuration." },
    { question: "How does Node.js handle concurrency?", options: ["A) Multi-threading like Java", "B) Single-threaded event loop with non-blocking I/O", "C) Process forking for every request", "D) GPU-based parallel processing"], correctOption: 1, answer: "**Correct Answer: B) Single-threaded event loop with non-blocking I/O**\n\nNode.js uses a single thread with an event loop. Heavy tasks are delegated to the libuv thread pool or OS kernel, keeping the main thread free." },
  ],
  "MongoDB": [
    { question: "What is the difference between SQL and NoSQL databases?", options: ["A) SQL is faster than NoSQL always", "B) SQL uses structured tables with schemas, NoSQL uses flexible document-based storage", "C) NoSQL cannot handle large data", "D) SQL databases don't support indexing"], correctOption: 1, answer: "**Correct Answer: B) SQL uses structured tables, NoSQL uses flexible documents**\n\n- **SQL:** Relational, fixed schema, joins, ACID\n- **NoSQL (MongoDB):** Document-based, flexible schema, horizontal scaling, eventual consistency" },
    { question: "What is a Mongoose schema?", options: ["A) A CSS layout system", "B) A structure that defines the shape of documents in a MongoDB collection", "C) A React component type", "D) A testing framework"], correctOption: 1, answer: "**Correct Answer: B) A structure that defines the shape of documents**\n\nMongoose schemas define field types, validation, defaults, and virtuals for MongoDB documents.\n\n```js\nconst userSchema = new Schema({\n  name: { type: String, required: true },\n  email: { type: String, unique: true }\n});\n```" },
    { question: "What is indexing in MongoDB?", options: ["A) Sorting documents alphabetically", "B) Creating data structures to improve query performance", "C) Deleting old documents", "D) Encrypting data at rest"], correctOption: 1, answer: "**Correct Answer: B) Creating data structures to improve query performance**\n\nIndexes allow MongoDB to find documents without scanning every document. Use `db.collection.createIndex()` for frequently queried fields." },
    { question: "What is aggregation in MongoDB?", options: ["A) Deleting multiple documents at once", "B) A pipeline of stages that process and transform documents", "C) Creating backup copies", "D) A type of database replication"], correctOption: 1, answer: "**Correct Answer: B) A pipeline of stages that process and transform documents**\n\nAggregation pipelines use stages like `$match`, `$group`, `$sort`, `$project` to transform data.\n\n```js\ndb.orders.aggregate([\n  { $match: { status: 'completed' } },\n  { $group: { _id: '$userId', total: { $sum: '$amount' } } }\n]);\n```" },
    { question: "What is the difference between findOne() and find() in MongoDB?", options: ["A) findOne() returns all documents, find() returns one", "B) findOne() returns the first matching document, find() returns a cursor to all matches", "C) They are identical", "D) find() only works with indexes"], correctOption: 1, answer: "**Correct Answer: B) findOne() returns the first match, find() returns a cursor to all matches**\n\n- `findOne()` — returns a single document object or null\n- `find()` — returns a cursor that you iterate or convert with `.toArray()`" },
  ],
  "Express": [
    { question: "What is routing in Express.js?", options: ["A) Managing database connections", "B) Defining how the application responds to client requests at specific endpoints", "C) Compiling JavaScript code", "D) Managing CSS styles"], correctOption: 1, answer: "**Correct Answer: B) Defining how the application responds to client requests at specific endpoints**\n\nRouting maps HTTP methods (GET, POST, PUT, DELETE) and URL paths to handler functions.\n\n```js\napp.get('/api/users', (req, res) => {\n  res.json({ users: [] });\n});\n```" },
    { question: "What is the difference between app.use() and app.get()?", options: ["A) They are identical", "B) app.use() registers middleware for all HTTP methods, app.get() handles only GET requests", "C) app.get() is for databases, app.use() is for files", "D) app.use() is deprecated"], correctOption: 1, answer: "**Correct Answer: B) app.use() registers middleware for all methods, app.get() handles GET only**\n\n- `app.use()` — matches any HTTP method, used for middleware\n- `app.get()` — only matches GET requests to a specific path" },
  ],
  "DSA": [
    { question: "What is the time complexity of binary search?", options: ["A) O(n)", "B) O(log n)", "C) O(n²)", "D) O(1)"], correctOption: 1, answer: "**Correct Answer: B) O(log n)**\n\nBinary search halves the search space each step by comparing the target with the middle element. It requires a sorted array.\n\n**Key points:**\n- Best case: O(1) — middle element is the target\n- Average/Worst: O(log n)\n- Space: O(1) iterative, O(log n) recursive" },
    { question: "What is the difference between a Stack and a Queue?", options: ["A) Both follow FIFO", "B) Stack is LIFO (Last In First Out), Queue is FIFO (First In First Out)", "C) Stack is faster than Queue", "D) Queue uses linked lists, Stack uses arrays only"], correctOption: 1, answer: "**Correct Answer: B) Stack is LIFO, Queue is FIFO**\n\n- **Stack:** push/pop from top (LIFO) — used for undo, recursion, DFS\n- **Queue:** enqueue at back, dequeue from front (FIFO) — used for BFS, task scheduling" },
    { question: "What is a Hash Table?", options: ["A) A sorted array", "B) A data structure that maps keys to values using a hash function", "C) A type of linked list", "D) A binary tree variant"], correctOption: 1, answer: "**Correct Answer: B) A data structure that maps keys to values using a hash function**\n\nHash tables provide O(1) average time for insert, delete, and lookup. Collisions are handled via chaining or open addressing." },
    { question: "What is Dynamic Programming?", options: ["A) Programming with dynamic types", "B) A method of solving problems by breaking them into overlapping subproblems and caching results", "C) Real-time programming", "D) A JavaScript framework"], correctOption: 1, answer: "**Correct Answer: B) Breaking problems into overlapping subproblems and caching results**\n\nDP avoids redundant computation by storing solutions to subproblems (memoization or tabulation).\n\n**Classic examples:** Fibonacci, Knapsack, LCS, Coin Change" },
    { question: "What is the difference between BFS and DFS?", options: ["A) BFS uses a stack, DFS uses a queue", "B) BFS explores level by level (queue), DFS explores depth-first (stack/recursion)", "C) DFS is always faster", "D) BFS only works on trees"], correctOption: 1, answer: "**Correct Answer: B) BFS explores level by level, DFS explores depth-first**\n\n- **BFS:** Queue, shortest path in unweighted graphs, O(V+E)\n- **DFS:** Stack/recursion, topological sort, cycle detection, O(V+E)" },
  ],
  "JavaScript": [
    { question: "What is a closure in JavaScript?", options: ["A) A way to close browser tabs", "B) A function that retains access to its outer scope's variables even after the outer function has returned", "C) A method to end loops", "D) A CSS property"], correctOption: 1, answer: "**Correct Answer: B) A function that retains access to its outer scope's variables**\n\nClosures allow inner functions to remember the environment in which they were created.\n\n```js\nfunction counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = counter();\nconsole.log(inc()); // 1\nconsole.log(inc()); // 2\n```" },
    { question: "What is the difference between let, const, and var?", options: ["A) They are all identical", "B) var is function-scoped, let/const are block-scoped; const cannot be reassigned", "C) const is faster than let", "D) let is only for numbers"], correctOption: 1, answer: "**Correct Answer: B) var is function-scoped, let/const are block-scoped**\n\n- `var` — function-scoped, hoisted, can be re-declared\n- `let` — block-scoped, not hoisted, can be reassigned\n- `const` — block-scoped, not hoisted, cannot be reassigned" },
    { question: "What is the difference between == and === in JavaScript?", options: ["A) They are identical", "B) == performs type coercion, === checks both value and type (strict equality)", "C) === is slower", "D) == only works with strings"], correctOption: 1, answer: "**Correct Answer: B) == performs type coercion, === is strict equality**\n\n- `==` converts types before comparing: `'5' == 5` → true\n- `===` no conversion: `'5' === 5` → false\n\nAlways prefer `===` to avoid unexpected coercion bugs." },
    { question: "What is the event loop in JavaScript?", options: ["A) A for loop that runs forever", "B) A mechanism that handles async operations by processing the callback queue after the call stack is empty", "C) A DOM event handler", "D) A CSS animation loop"], correctOption: 1, answer: "**Correct Answer: B) Handles async ops by processing callback queue after call stack empties**\n\nThe event loop checks if the call stack is empty, then pushes callbacks from the task queue. Microtasks (Promises) have priority over macrotasks (setTimeout)." },
    { question: "What are Promises in JavaScript?", options: ["A) Guaranteed function execution", "B) Objects representing the eventual completion or failure of an async operation", "C) A type of variable declaration", "D) Browser storage mechanism"], correctOption: 1, answer: "**Correct Answer: B) Objects representing eventual completion/failure of async operations**\n\nPromises have 3 states: pending, fulfilled, rejected.\n\n```js\nfetch('/api/data')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));\n```" },
  ],
  "System Design": [
    { question: "What is horizontal vs vertical scaling?", options: ["A) Both mean adding more RAM", "B) Horizontal adds more machines, vertical adds more resources to one machine", "C) Vertical is always better", "D) Horizontal only works with NoSQL"], correctOption: 1, answer: "**Correct Answer: B) Horizontal adds machines, vertical adds resources to one machine**\n\n- **Vertical:** Bigger server (more CPU/RAM) — simple but has limits\n- **Horizontal:** More servers + load balancer — complex but nearly unlimited scale" },
    { question: "What is a load balancer?", options: ["A) A database optimization tool", "B) A system that distributes incoming traffic across multiple servers", "C) A frontend framework", "D) A code compiler"], correctOption: 1, answer: "**Correct Answer: B) Distributes incoming traffic across multiple servers**\n\nLoad balancers ensure no single server is overwhelmed. Algorithms: Round Robin, Least Connections, IP Hash.\n\n**Examples:** Nginx, AWS ELB, HAProxy" },
    { question: "What is caching and why is it important?", options: ["A) Permanently storing data", "B) Temporarily storing frequently accessed data to reduce latency and database load", "C) Encrypting data", "D) Compressing files"], correctOption: 1, answer: "**Correct Answer: B) Temporarily storing frequently accessed data**\n\nCaching reduces response time and database load.\n\n**Types:** Browser cache, CDN cache, In-memory (Redis/Memcached), Application-level cache" },
  ],
  "default": [
    { question: "What is version control and why is Git important?", options: ["A) Git is a programming language", "B) Git tracks code changes, enables collaboration, and maintains history", "C) Git is a database", "D) Git replaces IDEs"], correctOption: 1, answer: "**Correct Answer: B) Git tracks code changes and enables collaboration**\n\nGit is a distributed version control system. Key concepts: branches, commits, merges, pull requests.\n\n**Essential commands:** `git add`, `git commit`, `git push`, `git pull`, `git branch`" },
    { question: "What is RESTful API design?", options: ["A) A frontend framework", "B) An architectural style using HTTP methods for CRUD operations on resources", "C) A database query language", "D) A testing methodology"], correctOption: 1, answer: "**Correct Answer: B) An architectural style using HTTP methods for CRUD ops**\n\n- GET — Read\n- POST — Create\n- PUT/PATCH — Update\n- DELETE — Remove\n\nREST uses stateless communication, resource URIs, and standard HTTP status codes." },
    { question: "What is the difference between authentication and authorization?", options: ["A) They are the same thing", "B) Authentication verifies identity (who you are), authorization verifies permissions (what you can do)", "C) Authorization comes before authentication", "D) Authentication is only for admins"], correctOption: 1, answer: "**Correct Answer: B) Authentication = identity, Authorization = permissions**\n\n- **Authentication:** Login, JWT, OAuth — proving who you are\n- **Authorization:** Roles, permissions, ACL — what you're allowed to do" },
    { question: "What is CI/CD?", options: ["A) A JavaScript library", "B) Continuous Integration and Continuous Deployment — automating build, test, and deployment", "C) A CSS framework", "D) A database optimization technique"], correctOption: 1, answer: "**Correct Answer: B) Continuous Integration/Deployment — automating build, test, deploy**\n\n- **CI:** Auto-build and test on every commit\n- **CD:** Auto-deploy to staging/production\n\n**Tools:** GitHub Actions, Jenkins, GitLab CI, CircleCI" },
    { question: "What is the purpose of environment variables?", options: ["A) To style web pages", "B) To store configuration values outside code (API keys, DB URIs, secrets)", "C) To define JavaScript variables", "D) To create database tables"], correctOption: 1, answer: "**Correct Answer: B) Store configuration values outside code**\n\nEnvironment variables keep sensitive data (API keys, database URIs) out of source code.\n\n```js\nconst dbUrl = process.env.MONGODB_URI;\nconst port = process.env.PORT || 3000;\n```" },
  ],
};

// Find the best matching topic bank
const findBankForTopic = (topic) => {
  const normalized = topic.toLowerCase().trim();
  for (const [key, bank] of Object.entries(QUESTION_BANKS)) {
    if (key === "default") continue;
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return bank;
    }
  }
  return null;
};

export const generateFallbackQuestions = ({
  role,
  experience,
  topicsToFocus,
  numberOfQuestions = 10,
}) => {
  const topics = normalizeTopics(topicsToFocus);

  // Collect questions from matching topic banks
  let pool = [];
  const usedBanks = new Set();

  for (const topic of topics) {
    const bank = findBankForTopic(topic);
    if (bank && !usedBanks.has(bank)) {
      pool.push(...bank);
      usedBanks.add(bank);
    }
  }

  // Also try matching the role
  const roleBank = findBankForTopic(role);
  if (roleBank && !usedBanks.has(roleBank)) {
    pool.push(...roleBank);
  }

  // Add default questions if pool is too small
  if (pool.length < numberOfQuestions) {
    pool.push(...QUESTION_BANKS.default);
  }

  // Shuffle the pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Return exactly the requested number
  return pool.slice(0, numberOfQuestions);
};

export const generateFallbackExplanation = (question) => ({
  title: "Concept Breakdown",
  explanation: [
    `**Definition:** ${question} is an interview topic where you should explain the idea clearly, connect it to practical work, and show trade-off awareness.`,
    "",
    "A strong answer should begin with the simplest correct explanation, then move into how the concept appears in real projects. Interviewers usually care more about whether you can apply the concept than whether you memorized a textbook definition.",
    "",
    "You can make your answer stronger by covering:",
    "- what problem the concept solves",
    "- where you have used it or would use it",
    "- one limitation or mistake to avoid",
    "",
    "```js",
    "const answerShape = ['definition', 'use case', 'trade-off'];",
    "console.log(answerShape.join(' -> '));",
    "```",
    "",
    "**Key Takeaway:** Keep the explanation simple, practical, and tied to real engineering decisions.",
  ].join("\n"),
});
