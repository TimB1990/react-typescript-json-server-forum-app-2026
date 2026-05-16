const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const generateData = async () => {
  const users = [];
  const groups = [];
  const categories = [];
  const threads = [];
  const messages = [];

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash('secret', salt);

  // 1. Users
  for (let i = 1; i <= 10; i++) {
    const seed = faker.string.alphanumeric(10);

    users.push({
      id: i,
      username: faker.internet.username(),
      password: hashedPass,
      avatar: `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}`
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

  groupItems.forEach(({title, description}, index) => {
    groups.push({ id: index + 1, title, description});
  });


  // 3. Categories
  const categoryItems = [{
    groupdId: 1,
    name: 'React',
    description: faker.lorem.sentence(4),
    image: "src/assets/react.svg"
  }, {
    groupId: 1,
    name: 'TypeScript',
    description: faker.lorem.sentence(3),
    image: "src/assets/ts.svg"
  },{
    groupId: 1,
    name: 'Backend',
    description: faker.lorem.sentence(5),
    image: "src/assets/backend.svg"
  }, {
    groupId: 1,
    name: 'Random',
    description: faker.lorem.sentence(1),
    image: "src/assets/random.svg"
  }, {
    groupId: 2,
    name: 'Members',
    description: faker.lorem.sentence(4),
    image: "src/assets/person-team.svg"
  },{
    groupId: 2,
    name: 'Computer talk',
    description: faker.lorem.sentence(3),
    image: "src/assets/computer.svg"
  }, {
    groupId: 2,
    name: 'Miscellaneous',
    description: faker.lorem.sentence(3),
    image: "src/assets/misc.svg"
  }];

  categoryItems.forEach(({groupId, name, description, image}, index) => {
    categories.push({ id: index + 1, groupId, name, description, image });
  });

  // 4. Threads & Messages
  let messageIdCounter = 1;

  for (let t = 1; t <= 15; t++) {
    const threadId = t;
    const categoryId = faker.helpers.arrayElement(categories).id;

    threads.push({
      id: threadId,
      categoryId: categoryId,
      title: faker.lorem.sentence(4),
      createdAt: faker.date.past().toISOString()
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
    const replyCount = faker.number.int({ min: 3, max: 8 });

    for (let r = 0; r < replyCount; r++) {
      // Pick a random message from this thread to reply to
      const parent = faker.helpers.arrayElement(threadMessages);

      const reply = {
        id: messageIdCounter++,
        threadId: threadId,
        categoryId,
        userId: faker.helpers.arrayElement(users).id,
        parentId: parent.id, // Replies to the parent
        content: faker.lorem.sentence(),
        createdAt: faker.date.recent().toISOString()
      };

      messages.push(reply);
      threadMessages.push(reply);
    }
  }

  return { users, groups, categories, threads, messages };
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
