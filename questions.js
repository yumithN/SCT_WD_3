/**
 * Interactive Quiz Game - Question Bank
 * Diverse categories, difficulty tiers, and question types:
 * - 'single': Single-choice multiple choice question
 * - 'multi': Multiple-select ("Choose all that apply")
 * - 'fill': Fill in the blank text question
 * - 'boolean': True / False statement
 */

const QUIZ_QUESTIONS = [
  // ==================== WEB DEVELOPMENT ====================
  {
    id: "web-01",
    category: "web-dev",
    difficulty: "easy",
    type: "single",
    question: "Which HTML5 element is used to specify a header for a document or section?",
    options: ["<top>", "<header>", "<head>", "<section-header>"],
    answer: 1,
    hint: "It matches the English word for the top introductory portion of a document.",
    explanation: "The `<header>` element represents a container for introductory content or a set of navigational links in HTML5."
  },
  {
    id: "web-02",
    category: "web-dev",
    difficulty: "easy",
    type: "boolean",
    question: "In CSS Flexbox, `justify-content` aligns items along the cross axis.",
    answer: false,
    hint: "Remember the difference between main axis and cross axis.",
    explanation: "`justify-content` aligns flex items along the *main axis*, whereas `align-items` aligns them along the *cross axis*."
  },
  {
    id: "web-03",
    category: "web-dev",
    difficulty: "medium",
    type: "multi",
    question: "Which of the following are valid JavaScript primitive data types? (Select all that apply)",
    options: ["Symbol", "BigInt", "Array", "Undefined", "Function"],
    answer: [0, 1, 3],
    hint: "Arrays and Functions are specialized objects, not primitives.",
    explanation: "JavaScript has 7 primitive types: string, number, bigint, boolean, undefined, symbol, and null. Array and Function are Objects."
  },
  {
    id: "web-04",
    category: "web-dev",
    difficulty: "easy",
    type: "fill",
    question: "Which CSS property is used to create space inside an element's border (inner spacing)?",
    acceptedAnswers: ["padding"],
    hint: "Contrast with margin which is outer spacing.",
    placeholder: "e.g., margin, padding...",
    explanation: "`padding` generates space inside the element's border, surrounding the content."
  },
  {
    id: "web-05",
    category: "web-dev",
    difficulty: "medium",
    type: "single",
    question: "What is the result of `typeof NaN` in JavaScript?",
    options: ["'undefined'", "'nan'", "'number'", "'object'"],
    answer: 2,
    hint: "Even though it stands for 'Not a Number', its type specification is numeric.",
    explanation: "In JavaScript, `NaN` (Not a Number) is technically a numeric data value conforming to IEEE 754 floating-point, so `typeof NaN === 'number'`."
  },
  {
    id: "web-06",
    category: "web-dev",
    difficulty: "medium",
    type: "multi",
    question: "Which CSS pseudo-classes represent user action states? (Select all that apply)",
    options: [":hover", ":active", ":focus", ":nth-child(2)", ":first-line"],
    answer: [0, 1, 2],
    hint: "Think about states triggered dynamically by mouse, touch, or keyboard input.",
    explanation: "`:hover`, `:active`, and `:focus` are user action pseudo-classes. `:nth-child()` is a structural pseudo-class, and `::first-line` is a pseudo-element."
  },
  {
    id: "web-07",
    category: "web-dev",
    difficulty: "hard",
    type: "single",
    question: "What will `console.log([] + {})` output in standard JavaScript?",
    options: ["'[object Object]'", "'undefined'", "NaN", "TypeError"],
    answer: 0,
    hint: "Array coerces to an empty string `\"\"` via `toString()`, then string concatenation occurs with the object.",
    explanation: "The `[]` converts to an empty string `\"\"`, and `{}` coerces to `\"[object Object]\"`. The `+` operator performs string concatenation yielding `\"[object Object]\"`."
  },
  {
    id: "web-08",
    category: "web-dev",
    difficulty: "hard",
    type: "fill",
    question: "In asynchronous JavaScript, which keyword pauses execution inside an `async` function until a Promise settles?",
    acceptedAnswers: ["await"],
    hint: "It forms a pair with the `async` keyword.",
    placeholder: "Enter keyword...",
    explanation: "The `await` keyword pauses execution within an `async` function until the Promise fulfills or rejects."
  },
  {
    id: "web-09",
    category: "web-dev",
    difficulty: "easy",
    type: "single",
    question: "Which HTTP status code corresponds to '404 Not Found'?",
    options: ["200", "301", "404", "500"],
    answer: 2,
    hint: "The most iconic error code on the internet.",
    explanation: "HTTP 404 Not Found indicates that the server cannot find the requested resource."
  },
  {
    id: "web-10",
    category: "web-dev",
    difficulty: "hard",
    type: "boolean",
    question: "Event delegation works because events in DOM bubble up through ancestor elements by default.",
    answer: true,
    hint: "Consider how an event attached to a `<ul>` can handle clicks on individual `<li>` children.",
    explanation: "True! Event delegation relies on event bubbling, allowing a single event listener on a parent element to catch events triggered by its descendants."
  },

  // ==================== COMPUTER SCIENCE & LOGIC ====================
  {
    id: "cs-01",
    category: "cs-logic",
    difficulty: "easy",
    type: "single",
    question: "What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 1,
    hint: "Each step cuts the search space approximately in half.",
    explanation: "In a balanced BST, half of the remaining nodes are eliminated at each level, resulting in an O(log n) search complexity."
  },
  {
    id: "cs-02",
    category: "cs-logic",
    difficulty: "medium",
    type: "multi",
    question: "Which of the following data structures operate on a First-In-First-Out (FIFO) or Last-In-First-Out (LIFO) discipline? (Select all that apply)",
    options: ["Stack (LIFO)", "Queue (FIFO)", "Hash Map (FIFO)", "Binary Tree (LIFO)"],
    answer: [0, 1],
    hint: "Stacks and queues are the classic linear ordered abstract data structures.",
    explanation: "A Stack follows Last-In-First-Out (LIFO) while a Queue follows First-In-First-Out (FIFO). Hash Maps and Binary Trees do not follow these access principles."
  },
  {
    id: "cs-03",
    category: "cs-logic",
    difficulty: "easy",
    type: "fill",
    question: "In Git, what command is used to combine changes from another branch into your current branch?",
    acceptedAnswers: ["git merge", "merge"],
    hint: "Begins with 'm' and rhymes with 'purge'.",
    placeholder: "e.g., merge, rebase...",
    explanation: "`git merge` integrates the commits and history from one branch into the active branch."
  },
  {
    id: "cs-04",
    category: "cs-logic",
    difficulty: "medium",
    type: "single",
    question: "Which sorting algorithm has a worst-case time complexity of O(n²)?",
    options: ["Merge Sort", "Quick Sort", "Heap Sort", "Tim Sort"],
    answer: 1,
    hint: "Its performance degrades when the chosen pivot consistently partitions into empty and n-1 subarrays.",
    explanation: "Quick Sort has an average case of O(n log n), but degrades to O(n²) in the worst case (e.g., already sorted array with poor pivot selection). Merge Sort and Heap Sort guarantee O(n log n)."
  },
  {
    id: "cs-05",
    category: "cs-logic",
    difficulty: "hard",
    type: "boolean",
    question: "In TCP/IP, the Three-Way Handshake consists of SYN, SYN-ACK, and ACK packets.",
    answer: true,
    hint: "Client sends Synchronize, server replies with Synchronize-Acknowledge, client confirms with Acknowledge.",
    explanation: "True! TCP establishes a reliable connection using the SYN -> SYN-ACK -> ACK handshake sequence."
  },
  {
    id: "cs-06",
    category: "cs-logic",
    difficulty: "medium",
    type: "multi",
    question: "Which of the following are valid HTTP methods? (Select all that apply)",
    options: ["POST", "PATCH", "FETCH", "DELETE", "PUT"],
    answer: [0, 1, 3, 4],
    hint: "`fetch` is a JavaScript browser API, not an HTTP verb.",
    explanation: "POST, PATCH, DELETE, and PUT are standard HTTP methods (RFC 7231). 'FETCH' is a browser Web API method for making network requests, not an HTTP verb."
  },
  {
    id: "cs-07",
    category: "cs-logic",
    difficulty: "hard",
    type: "single",
    question: "Which algorithm is typically used to find the shortest path between nodes in a weighted graph with non-negative edge weights?",
    options: ["Bellman-Ford Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm"],
    answer: 1,
    hint: "Formulated by Dutch computer scientist Edsger W. in 1956.",
    explanation: "Dijkstra's algorithm finds the shortest path from a single source node to all other nodes in a graph with non-negative edge weights in O((V + E) log V) with a priority queue."
  },
  {
    id: "cs-08",
    category: "cs-logic",
    difficulty: "easy",
    type: "fill",
    question: "What is the binary representation of the decimal number 10?",
    acceptedAnswers: ["1010", "0b1010"],
    hint: "8 + 2 = 10. Think of powers of two (8, 4, 2, 1).",
    placeholder: "e.g., 1010",
    explanation: "In binary: 8 (1) + 4 (0) + 2 (1) + 1 (0) = 1010₂."
  },

  // ==================== GENERAL TECH & AI ====================
  {
    id: "tech-01",
    category: "tech-ai",
    difficulty: "easy",
    type: "single",
    question: "What does 'API' stand for in computer software?",
    options: [
      "Application Programming Interface",
      "Advanced Protocol Integration",
      "Automated Program Interaction",
      "Application Performance Index"
    ],
    answer: 0,
    hint: "It defines how software components should talk to each other.",
    explanation: "API stands for Application Programming Interface, which is a set of rules and protocols for building and interacting with software applications."
  },
  {
    id: "tech-02",
    category: "tech-ai",
    difficulty: "medium",
    type: "multi",
    question: "Which of the following are popular relational database management systems (RDBMS)? (Select all that apply)",
    options: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite"],
    answer: [0, 2, 4],
    hint: "MongoDB is a document store and Redis is an in-memory key-value cache/store.",
    explanation: "PostgreSQL, MySQL, and SQLite are Relational DBMSs utilizing SQL tables. MongoDB is NoSQL Document-based, and Redis is an in-memory key-value store."
  },
  {
    id: "tech-03",
    category: "tech-ai",
    difficulty: "easy",
    type: "boolean",
    question: "In Machine Learning, Overfitting occurs when a model performs exceptionally well on training data but poorly on unseen test data.",
    answer: true,
    hint: "The model memorizes noise and specific details rather than general patterns.",
    explanation: "True! Overfitting happens when a model fits too closely to the training dataset, impairing its generalization ability to new data."
  },
  {
    id: "tech-04",
    category: "tech-ai",
    difficulty: "hard",
    type: "single",
    question: "In the context of Large Language Models (LLMs), what does the 'T' in 'GPT' stand for?",
    options: ["Tensor", "Transformer", "Translator", "Tokenizer"],
    answer: 1,
    hint: "Introduced in the seminal 2017 paper 'Attention Is All You Need'.",
    explanation: "GPT stands for 'Generative Pre-trained Transformer', built on the Transformer deep learning architecture introduced by Vaswani et al. in 2017."
  },
  {
    id: "tech-05",
    category: "tech-ai",
    difficulty: "medium",
    type: "fill",
    question: "What software architectural style uses lightweight containers for isolation, pioneered by Docker and managed by Kubernetes?",
    acceptedAnswers: ["containerization", "microservices", "containers"],
    hint: "Packaging an application and its dependencies into a standardized unit.",
    placeholder: "e.g., containerization...",
    explanation: "Containerization allows developers to package code with all its dependencies so the application runs quickly and reliably across computing environments."
  },
  {
    id: "tech-06",
    category: "tech-ai",
    difficulty: "medium",
    type: "multi",
    question: "Which of the following cloud providers offer serverless function services? (Select all that apply)",
    options: ["AWS (Lambda)", "Google Cloud (Cloud Functions)", "Microsoft Azure (Azure Functions)", "Linux Kernel (KVM)"],
    answer: [0, 1, 2],
    hint: "Look for cloud hyper-scalers with event-driven execution platforms.",
    explanation: "AWS Lambda, Google Cloud Functions, and Azure Functions are all premier serverless (FaaS) platforms. Linux KVM is a virtualization module, not a serverless cloud provider."
  },
  {
    id: "tech-07",
    category: "tech-ai",
    difficulty: "easy",
    type: "boolean",
    question: "DNS stands for Domain Name System and translates human-friendly URLs into machine-readable IP addresses.",
    answer: true,
    hint: "Think of it as the phonebook of the Internet.",
    explanation: "True! The Domain Name System (DNS) maps human-readable domain names (like google.com) to numeric IP addresses (like 142.250.190.46)."
  },
  {
    id: "tech-08",
    category: "tech-ai",
    difficulty: "hard",
    type: "single",
    question: "Which cryptographic algorithm is universally utilized in modern asymmetric public-key cryptography and SSL/TLS handshakes?",
    options: ["RSA", "AES-256", "SHA-256", "MD5"],
    answer: 0,
    hint: "Named after Rivest, Shamir, and Adleman.",
    explanation: "RSA is an asymmetric public-key cryptographic algorithm. AES is symmetric, SHA-256 is a cryptographic hash function, and MD5 is an obsolete hashing function."
  }
];

// Helper to get questions with optional filters
function getFilteredQuestions(category = 'all', difficulty = 'all', count = 10) {
  let list = [...QUIZ_QUESTIONS];
  
  if (category !== 'all') {
    list = list.filter(q => q.category === category);
  }
  
  if (difficulty !== 'all') {
    list = list.filter(q => q.difficulty === difficulty);
  }
  
  // Shuffle array using Fisher-Yates
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  
  return list.slice(0, count);
}
