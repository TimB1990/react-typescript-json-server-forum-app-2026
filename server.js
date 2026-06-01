import jsonServer from 'json-server'
import bcrypt from 'bcryptjs'
import cors from 'cors'

const RESERVED_FILTERS = [
  "limit",
  "page",
  "order"
];

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

server.use(cors({ origin: 'http://localhost:5173' }))

const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);
server.use(middlewares)

server.use(async (req, res, next) => {
  console.log("called: ", req.route)
  next();
})

server.post('/register', async (req, res) => {
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    router.db.get('users').push(req.body).write()
    return res.status(201)
  }
});

server.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = router.db.get('users').find({ username }).value();

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {

    // takes password and assigns it to temporary _ variable
    // take everything else (rest operator ...) and pack it into
    // new object called userWithoutPassword

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: "Login successful", user: userWithoutPassword });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

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

  // Apply limit given as query string cast to int
  const limit = parseInt(filters.limit, 10) || 25;
  const page = parseInt(filters.page, 10) || 1;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Set the final result to be a sliced portion of sorted by limit  
  const finalResult = sorted.slice(startIndex, endIndex);

  // return the result of the filter
  res.json({
    data: finalResult,
    totalCount: filtered.length,
    currentPage: page,
    totalPages: Math.ceil(filtered.length / limit)
  });
});

server.use(router)

server.listen(5001, () => {
  console.log('JSON server is running with password hashing middleware')
})