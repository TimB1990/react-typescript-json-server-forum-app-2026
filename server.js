import jsonServer from 'json-server'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import crypto from 'crypto'
import cookieParser from 'cookie-parser'
import { faker } from '@faker-js/faker'

const RESERVED_FILTERS = [
  "limit",
  "page",
  "order"
];

const NON_PAGINATED_RESROUCES = [
  "replies",
  "tags",
  "config"
]

const DEFAULT = {
  'messages': 10,
  'threads': 5,
  'categories': 4,
  'global': 20
}

// functions
function filterDataByQueryParams(data, filters) {
  // 1. Get keys that aren't 'limit', 'order', etc.
  const validFilterKeys = Object.keys(filters).filter(
    key => !RESERVED_FILTERS.includes(key) && filters[key] !== undefined
  );

  // 2. If no valid filters are provided, return the data as is 
  // (or handle based on your needs)
  if (validFilterKeys.length === 0) return data;

  return data.filter(item => {
    return validFilterKeys.every(key => {
      // Use optional chaining in case the item doesn't have the key
      const itemValue = item?.[key];
      const filterValue = filters[key];

      // Strict string comparison to bridge Number/String gap
      return String(itemValue) === String(filterValue);
    });
  });
}

// server setup
const server = jsonServer.create();

server.use(cookieParser())
server.use(cors({ origin: 'http://localhost:5173', credentials: true }))

const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults();

server.use((req, res, next) => {
  if (req.url.includes('.well-known') || req.url.includes('favicon.ico')) {
    return res.status(204).end(); // Silently return "No Content" and stop processing
  }
  next();
});

server.use(jsonServer.bodyParser);
server.use(middlewares)

server.use(async (req, res, next) => {
  console.log("called: ", req.route)
  next();
})

server.get('/config', (req, res) => {
  res.json(DEFAULT)
})

server.post('/register', async (req, res) => {

  const {
    username,
    email,
    password,
    passwordConfirm,
    regAgreedTerms,
    regAdminMails
  } = req.body;

  const errors = {}

  if (!username || username.trim() === '') {
    errors.username = "Username is required"
  }

  if (!email || email.trim() === '') {
    errors.email = 'Email is required.';
  }
  else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters"
  }

  if (password !== passwordConfirm) {
    errors.passwordConfirm = 'Passwords do not match.';
  }

  // 2. Validate essential checkboxes
  if (!regAgreedTerms) {
    errors.regAgreedTerms = 'You must agree to terms and conditions';
  }

  // 3. Check for existing users (using your json-server / lowdb instance)
  if (username && !errors.username) {
    const existingUsername = router.db.get('users').find({ username }).value();
    if (existingUsername) {
      errors.username = 'This username is already registred.'
    }
  }

  if (email && !errors.email) {
    const existingUser = router.db.get('users').find({ email }).value();
    if (existingUser) {
      errors.email = 'This email is already registered.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors })
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = {
      id: Date.now().toString(), // basic ID generator
      username,
      email,
      password: hashedPassword,
      avatar: faker.image.dataUri({ width: 150, height: 150 }),
      // regAdminMails: !!regAdminMails, // force boolean
      createdAt: new Date().toISOString()
    };

    router.db.get('users').push(newUser).write();
    return res.status(201).json({ message: 'Registration successful!', userId: newUser.id });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

server.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const user = router.db.get('users').find({ email }).value();

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  // Generate selector and validator token pair
  const selector = crypto.randomBytes(16).toString('hex')
  const validator = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(validator).digest('hex');

  // set expiration
  const durationMs = 30 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + durationMs).toISOString();

  // ensure tokens collection exists
  if (!router.db.has('tokens').value()) {
    router.db.set('tokens', []).write();
  }

  // store token details in LOW DB
  router.db.get('tokens').push({
    userId: user.id,
    selector,
    tokenHash,
    expiresAt: rememberMe ? expiresAt : null
  }).write()

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }

  if (rememberMe) {
    cookieOptions.maxAge = durationMs
  }

  res.cookie('auth_token', `${selector}:${validator}`, cookieOptions)

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ message: "Login successfull", user: userWithoutPassword })

});

// auth-login
server.get('/me', (req, res) => {
  const authToken = req.cookies.auth_token

  if (!authToken || !authToken.includes(':')) {
    return res.status(401).json({ message: "Unauthenticated" })
  }

  const [selector, validator] = authToken.split(':')
  const record = router.db.get('tokens').find({ selector }).value();

  if (!record) {
    return res.status(401).json({ message: "Invalid session" })
  }

  // verify expiration date if it exists
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    router.db.get('tokens').remove({ selector }).write();
    res.clearCookie('auth_token')
    return res.status(401).json({ message: "Session expired" })
  }

  // verify validator hash
  const computedHash = crypto.createHash('sha256').update(validator).digest('hex')
  if (computedHash !== record.tokenHash) {
    // Possible theft attempt: invalidate all the user tokens
    router.db.get('tokens').remove({ userId: record.userId }).write();
    res.clearCookie('auth_token')
    return res.status(401).json({ message: "Token mismatch. Logging out user." });
  }

  // fetch and return user
  const user = router.db.get('users').find({ id: record.userId }).value();
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({ user: userWithoutPassword })

})

// Logout endpoint
server.post('/logout', (req, res) => {
  const authToken = req.cookies.auth_token;
  if (authToken && authToken.includes(':')) {
    const [selector] = authToken.split(':')
    router.db.get('tokens').remove({ selector }).write();
  }
  res.clearCookie('auth_token')
  res.json({ message: 'Logged out successfully' })
})

server.get('/count/:resource', (req, res) => {
  const { resource } = req.params;
  const filters = req.query;

  let data = router.db.get(resource).value();

  if (!data || !Array.isArray(data)) {
    return res.status(404).json({ error: "Resource not found" });
  }

  // TODO make more efficient by improving filter needed to either fetch first or latest related child.
  const filteredData = filterDataByQueryParams(data, filters)

  res.json({
    count: filteredData.length
  });
});

server.get('/messages/latest-overview', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || DEFAULT.messages;
  const page = parseInt(req.query.page, 10) || 1;

  // 1. fetch all raw messages from lowdb
  const allMessages = router.db.get('messages').value() || [];

  // 2. Sort messages globally by date descending (newest replies first)
  const sortedMessages = [...allMessages].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  })

  // 3. filter to keep only the latest message per unique thread
  const uniqueThreadMessages = [];
  const seenThreads = new Set();

  for (const message of sortedMessages) {
    if (!seenThreads.has(message.threadId)) {
      seenThreads.add(message.threadId)
      uniqueThreadMessages.push(message);
    }
  }

  // 4. handle serverside pagination on the unique dataset
  const totalCount = uniqueThreadMessages.length;
  const startIndex = (page - 1) * limit;
  const paginatedResult = uniqueThreadMessages.slice(startIndex, startIndex + limit)

  // 5. respond matching your standard format structure
  res.json({
    data: paginatedResult,
    totalCount: totalCount,
    currentPage: page,
    limit: limit,
    totalPages: Math.ceil(totalCount / limit)
  })
})

server.get('/:resource', (req, res) => {

  // Get the resource from :resource
  const { resource } = req.params;

  // Get the filter set from the quert string (e.g. threadId=5)
  const filters = req.query;

  // get the data from the db
  const data = router.db.get(resource).value();

  // if data is undefined or data is not an array return status 404 - not found
  if (!data || !Array.isArray(data)) return res.status(404).json({ error: "Not found" });

  // filter the full data by the filters given as query param
  const filtered = filterDataByQueryParams(data, filters);

  // updated sorting logic
  const sortOrder = filters.order === 'asc' ? 'asc' : 'desc'; // Default to desc

  // spread the filtered result then apply sort on createdAt
  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // -- START EXCEPTION LOGIC
  const skipPagination = NON_PAGINATED_RESROUCES.includes(resource)

  let finalResult = sorted;
  // let limit = sorted.length;
  let page = 1

  const resourceDefault = DEFAULT[resource] || DEFAULT.global
  let limit = skipPagination ? sorted.length : (parseInt(filters.limit, 10) || resourceDefault);

  if (!skipPagination) {

    page = parseInt(filters.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    finalResult = sorted.slice(startIndex, startIndex + limit);
  }

  // -- END EXCEPTION LOGIC

  // return the result of the filter
  res.json({
    data: finalResult,
    totalCount: filtered.length,
    currentPage: page,
    limit: limit,
    totalPages: skipPagination ? 1 : Math.ceil(filtered.length / limit)
  });
});

server.post('/replies/resolve-pages', async (req, res) => {
  const { ids } = req.body;
  const itemsPerPage = DEFAULT.messages;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).send("Invalid IDs provided");
  }

  try {
    const db = router.db;
    const allMessages = db.get('messages').value() || [];

    const results = ids.map(targetId => {
      const message = allMessages.find(m => m.id === targetId);

      if (!message) return { messageId: targetId, atPage: null, error: "Not found" };

      // Calculate the page number
      const threadMessages = allMessages
        .filter(m => m.threadId === message.threadId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const index = threadMessages.findIndex(m => m.id === targetId);
      const atPage = Math.floor(index / itemsPerPage) + 1;

      // CORRECT LOWDB UPDATE PATTERN
      const existing = db.get('replies').find({ messageId: targetId }).value();

      if (existing) {
        // Update: You must call .find() on the collection and .assign() before .write()
        db.get('replies')
          .find({ messageId: targetId })
          .assign({ atPage })
          .write();
      } else {
        // Create
        db.get('replies')
          .push({
            messageId: targetId,
            parentMessageId: message.parentId || null,
            threadId: message.threadId,
            atPage: atPage
          })
          .write();
      }

      return { messageId: targetId, atPage, threadId: message.threadId };
    });

    res.json(results);
  } catch (err) {
    // This will now log the specific lowdb error to your terminal
    console.error("Resolve Pages Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// server.get('/count/users/:id/messages', async (req, res) => {
//   const { id } = req.params
//   const messages = router.db
//     .get('messages')
//     .filter(msg => msg.userId === id || msg.userId === Number(id))
//     .value()

//   return res.json({ count: messages.length })

// })

server.patch('/users/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const { avatar } = req.body;

  if (!avatar) {
    return res.status(400).json({ message: 'Avatar Data URL is required' });
  }

  // 1. Update user in LowDB
  router.db.get('users')
    .find({ id })
    .assign({ avatar })
    .write();

  const updatedUser = router.db.get('users').find({ id }).value();
  const { password, ...userWithoutPassword } = updatedUser;

  // 2. If using express-session, sync the active session so GET /me returns fresh data!
  if (req.session && req.session.user) {
    req.session.user = userWithoutPassword;
  }

  return res.status(200).json({
    message: 'Avatar updated successfully',
    user: userWithoutPassword
  });
});

server.use(router)

server.listen(5001, () => {
  console.log('JSON server is running with password hashing middleware')
})