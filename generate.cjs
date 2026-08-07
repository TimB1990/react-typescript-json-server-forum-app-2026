const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// slugify function
const slugify = (text) => {
  return text
    .toString()                           // Ensure it's a string
    .normalize('NFD')                     // Separate accents from letters
    .replace(/[\u0300-\u036f]/g, '')      // Remove the accent marks
    .toLowerCase()                        // Convert to lowercase
    .trim()                               // Remove whitespace from both ends
    .replace(/\s+/g, '-')                 // Replace spaces with -
    .replace(/[^\w-]+/g, '')              // Remove all non-word chars
    .replace(/--+/g, '-');                // Replace multiple - with single -
};

const generateData = async () => {
  const users = [];
  const groups = [];
  const categories = [];
  const threads = [];
  const messages = [];
  const replies = [];

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash('secret', salt);
  const adminHashedPass = await bycrypt.hash('adminsecret', salt)

  // 1. Admin
  users.push({
    id: 1,
    username: 'Admin',
    email: 'admin@forum.test',
    password: adminHashedPass,
    avatar: faker.image.dataUri({ width: 150, height: 150 }),
    createdAt: faker.date.past().toISOString()
  })

  // 2. Users
  for (let i = 2; i <= 100; i++) {
    let username = faker.internet.username()
    users.push({
      id: i,
      username,
      email: `${username}@forum.test`,
      password: hashedPass,
      avatar: faker.image.dataUri({ width: 150, height: 150 }),
      createdAt: faker.date.past().toISOString()
    });
  }

  // 2. Groups
  const groupItems = [{
    title: 'Programming',
    description: 'All about programming',
    slug: 'programming'
  },
  {
    title: 'Community',
    description: 'Meet our community!',
    slug: 'community'
  }]

  groupItems.forEach(({ title, description }, index) => {
    groups.push({ id: index + 1, title, description });
  });

  // 3. Categories
  const categoryItems = [{
    groupId: 1,
    name: 'React',
    slug: 'react',
    description: faker.lorem.sentence(4),
    image: "src/assets/react.svg"
  }, {
    groupId: 1,
    name: 'TypeScript',
    slug: 'typescript',
    description: faker.lorem.sentence(3),
    image: "src/assets/ts.svg"
  }, {
    groupId: 1,
    name: 'Backend',
    slug: 'backend',
    description: faker.lorem.sentence(5),
    image: "src/assets/backend.svg"
  }, {
    groupId: 1,
    name: 'Random',
    slug: 'random',
    description: faker.lorem.sentence(1),
    image: "src/assets/random.svg"
  }, {
    groupId: 2,
    name: 'Members',
    slug: 'members',
    description: faker.lorem.sentence(4),
    image: "src/assets/person-team.svg"
  }, {
    groupId: 2,
    name: 'Computer talk',
    slug: 'computer-talk',
    description: faker.lorem.sentence(3),
    image: "src/assets/computer.svg"
  }, {
    groupId: 2,
    name: 'Miscellaneous',
    slug: 'miscellaneous',
    description: faker.lorem.sentence(3),
    image: "src/assets/misc.svg"
  }];

  categoryItems.forEach(({ groupId, name, slug, description, image }, index) => {
    categories.push({ id: index + 1, groupId, name, slug, description, image });
  });

  // 4. Threads & Messages
  let messageIdCounter = 1;

  for (let t = 1; t <= 80; t++) {
    const threadId = t;
    const categoryId = faker.helpers.arrayElement(categories).id;
    const title = faker.lorem.sentence(4);

    // FIX 1: Generate a wider span of time for threads (up to 30 days ago)
    const threadCreatedAt = faker.date.recent({ days: 30 }).toISOString();

    threads.push({
      id: threadId,
      categoryId: categoryId,
      slug: slugify(title),
      title,
      createdAt: threadCreatedAt
    });

    // FIX 2: Force opening post to match the exact same timestamp as the thread
    const openingMessage = {
      id: messageIdCounter++,
      threadId: threadId,
      categoryId,
      userId: faker.helpers.arrayElement(users).id,
      parentId: null,
      content: faker.lorem.paragraphs(1),
      createdAt: threadCreatedAt
    };
    messages.push(openingMessage);

    const threadMessages = [openingMessage];
    const replyCount = faker.number.int({ min: 10, max: 25 });

    // Keep track of the latest message time in this thread
    let lastMessageTime = new Date(threadCreatedAt);

    for (let r = 0; r < replyCount; r++) {
      const parent = faker.helpers.arrayElement(threadMessages);

      // 1. Generate a realistic delay (e.g., between 5 minutes and 4 hours)
      const minutesToAdd = faker.number.int({ min: 5, max: 240 });

      // 2. Advance the clock from the LAST message's time, not a static new Date()
      lastMessageTime = new Date(lastMessageTime.getTime() + minutesToAdd * 60000);
      const replyDate = lastMessageTime.toISOString();

      const reply = {
        id: messageIdCounter++,
        threadId: threadId,
        categoryId,
        userId: faker.helpers.arrayElement(users).id,
        parentId: parent.id,
        content: faker.lorem.sentence(),
        createdAt: replyDate
      };

      messages.push(reply);
      threadMessages.push(reply);

      const replyRecord = {
        messageId: reply.id,
        parentMessageId: parent.id,
        threadId,
        atPage: null
      };

      replies.push(replyRecord);
    }
  }

  // 5. User ranks
  const userRanks = [
    {
      name: 'Sprout Member',
      faIcon: 'faSeedling',
      faIconOptions: {
        size: 'lg',
        color: 'rgb(99, 230, 190)'
      },
      messageThreshold: 1,
    },
    {
      name: 'Steel Member',
      faIcon: 'faDrumSteelPan',
      faIconOptions: {
        size: 'lg',
        color: 'rgba(210, 232, 225, 1.00)'
      },
      messageThreshold: 1,
    },
    {
      name: 'Bronze Member',
      faIcon: 'faMedal',
      faIconOptions: {
        size: 'lg',
        color: 'rgba(131, 112, 48, 1.00)'
      },
      messageThreshold: 1,
    },
    {
      name: 'Silver Member',
      faIcon: 'faMedal',
      faIconOptions: {
        size: 'lg',
        color: 'rgba(213, 210, 202, 0.20)'
      },
      messageThreshold: 1,
    },
    {
      name: 'Gold Member',
      faIcon: 'faMedal',
      faIconOptions: {
        size: 'lg',
        color: 'rgba(230, 172, 19, 0.20)'
      },
      messageThreshold: 1,
    },
    {
      name: 'Platinum Member',
      faIcon: 'faTrophy',
      faIconOptions: {
        size: 'lg',
        color: 'rgba(249, 238, 200, 1.00)'
      },
      messageThreshold: 1,
    },
  ];

  return { users, groups, categories, threads, messages, replies, userRanks };
};

let db = false;

async function writeDatabase() {
  db = await generateData() || false;

  if (!db) {
    console.log("Error: Cannot generate Database");
    return;
  }

  const filePath = path.join(__dirname, 'db.json');
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
  console.log("✅ Recursive db.json generated with clean timelines!");
}

writeDatabase();