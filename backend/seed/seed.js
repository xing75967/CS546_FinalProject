
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "ai_service_aggregator";

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    console.log("Connected to DB:", dbName);

    // 清空旧数据 clear data
    await db.collection("users").deleteMany({});
    await db.collection("tools").deleteMany({});
    await db.collection("reviews").deleteMany({});

    // 插入测试用户 adding users 
    const passwordHash = await bcrypt.hash("password123", 10);
    const users = [
      {
        _id: new ObjectId(),
        email: "user1@example.com",
        auth_provider: "email",
        password: passwordHash,
        first_name: "Alice",
        last_name: "Wang",
        birthday: "1990-05-10",
        avatar_url: "https://i.pravatar.cc/150?img=1",
        phone: "1234567890",
        city: "Toronto",
        state: "ON",
        country: "Canada",
        role: "user",
        created_at: "2023-01-01",
        bookmarks: [],
        two_factor_enabled: false,
        last_login: new Date().toISOString(),
      },
      {
        _id: new ObjectId(),
        email: "admin@example.com",
        auth_provider: "email",
        password: passwordHash,
        first_name: "Admin",
        last_name: "User",
        birthday: "1985-01-01",
        avatar_url: "https://i.pravatar.cc/150?img=2",
        phone: "0987654321",
        city: "Vancouver",
        state: "BC",
        country: "Canada",
        role: "admin",
        created_at: "2023-01-01",
        bookmarks: [],
        two_factor_enabled: true,
        last_login: new Date().toISOString(),
      },
    ];
    await db.collection("users").insertMany(users);
    console.log("Inserted users.");

    // 生成30多个工具tools
    const baseModels = ["GPT-4", "Claude 3", "Stable Diffusion", "DALL·E 2", "BERT", "T5", "XLNet"];
    const categories = ["Text Generation", "Image Processing", "Coding Assistance", "Speech Recognition"];
    const formats = ["txt", "json", "jpg", "png", "mp3", "mp4"];

    const tools = [];

    for (let i = 1; i <= 35; i++) {
      const baseModel = baseModels[i % baseModels.length];
      const category = categories[i % categories.length];
      const subcategories = [category + " Subcat A", category + " Subcat B"];
      const supportedFormats = formats.slice(0, (i % formats.length) + 1);
      const tool = {
        name: `AI Tool ${i}`,
        official_url: `https://aitool${i}.example.com`,
        url_verified: true,
        description: `AI Tool ${i} is a powerful tool for ${category.toLowerCase()}.`,
        base_model: baseModel,
        hardware_requirements: ["CPU", "GPU"],
        supported_formats: supportedFormats,
        tool_approved: true,
        category,
        subcategories,
        ratings: {
          functionality: Math.floor(Math.random() * 5) + 1,
          usability: Math.floor(Math.random() * 5) + 1,
          value: Math.floor(Math.random() * 5) + 1,
        },
        views: Math.floor(Math.random() * 1000),
        bookmarks: Math.floor(Math.random() * 500),
        submission_date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
        submitted_by: users[0]._id,
      };
      tools.push(tool);
    }
    const resultTools = await db.collection("tools").insertMany(tools);
    console.log(`Inserted ${resultTools.insertedCount} tools.`);

    // 生成一些评论 adding comments
    const reviews = [];
    for (let i = 0; i < 50; i++) {
      const toolIndex = i % tools.length;
      reviews.push({
        user_id: users[i % users.length]._id,
        tool_id: resultTools.insertedIds[toolIndex],
        title: `Review ${i + 1} for Tool ${toolIndex + 1}`,
        content: `This is a detailed review of AI Tool ${toolIndex + 1}, with good points and some suggestions.`,
        ratings: {
          functionality: Math.floor(Math.random() * 5) + 1,
          usability: Math.floor(Math.random() * 5) + 1,
          value: Math.floor(Math.random() * 5) + 1,
        },
        created_at: new Date(Date.now() - i * 3600000).toISOString().slice(0, 10),
        comments: [],
      });
    }
    const resultReviews = await db.collection("reviews").insertMany(reviews);
    console.log(`Inserted ${resultReviews.insertedCount} reviews.`);

    console.log("Seeding complete.");
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

seed();
