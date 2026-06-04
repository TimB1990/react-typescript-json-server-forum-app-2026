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

  // 1. Users
  for (let i = 1; i <= 25; i++) {
    // const seed = faker.string.alphanumeric(10);
    // `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`

    users.push({
      id: i,
      username: faker.internet.username(),
      password: hashedPass,
      avatar: faker.image.dataUri({ width: 150, height: 150 }),
      createdAt: faker.date.past().toISOString()
    });
  }

  // 2. Groups
  const groupItems = [{
    title: 'Programming',
    description: 'All about programming'
  },
  {
    title: 'Community',
    description: 'Meet our community!'
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

  for (let t = 1; t <= 50; t++) {
    const threadId = t;
    const categoryId = faker.helpers.arrayElement(categories).id;

    const title = faker.lorem.sentence(4)

    threads.push({
      id: threadId,
      categoryId: categoryId,
      slug: slugify(title),
      title,
      createdAt: faker.date.recent().toISOString()
    });

    // Create the "Opening Post" (The first message of the thread)
    const openingMessage = {
      id: messageIdCounter++,
      threadId: threadId,
      categoryId,
      userId: faker.helpers.arrayElement(users).id,
      parentId: null, // No parent because it starts the topic
      content: faker.lorem.paragraphs(1),
      createdAt: faker.date.recent().toISOString()
    };
    messages.push(openingMessage);

    // Create a few replies within this thread
    const threadMessages = [openingMessage]; // Keep track of messages in THIS thread
    const replyCount = faker.number.int({ min: 10, max: 25 });

    for (let r = 0; r < replyCount; r++) {

      // Pick a random message from this thread to reply to
      const parent = faker.helpers.arrayElement(threadMessages);

      // 3. Ensure the reply date is AFTER the parent date
      const replyDate = faker.date.between({
        from: parent.createdAt,
        to: new Date()
      }).toISOString();

      const reply = {
        id: messageIdCounter++,
        threadId: threadId,
        categoryId,
        userId: faker.helpers.arrayElement(users).id,
        parentId: parent.id, // Assign the parent ID here
        content: faker.lorem.sentence(),
        createdAt: replyDate
      };

      // 4. CRITICAL: Push the reply to BOTH arrays
      messages.push(reply);
      threadMessages.push(reply);

      // 5. Put record in table replies
      const replyRecord = {
        messageId: reply.id,
        parentMessageId: parent.id,
        threadId,
        atPage: null
      }

      replies.push(replyRecord)
    }
  }

  return { users, groups, categories, threads, messages, replies };
};

let db = false;

async function writeDatabase() {
  db = await generateData() || false

  if (!db) {
    console.log("Error: Cannot generate Database")
    return;
  }

  const filePath = path.join(__dirname, 'db.json');
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
  console.log("✅ Recursive db.json generated!");

}

writeDatabase();
