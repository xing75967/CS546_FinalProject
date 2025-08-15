import { dbConnection, closeConnection } from './config/mongoConnection.js';
import { users, tools } from './config/mongoCollections.js';
import { createUser } from './data/users.js';
import { createTool } from './data/tools.js';

const main = async () => {
    const db = await dbConnection();
    // await db.dropDatabase(); // Warning: This will delete all current data
    // commented the dropDatabase because it raise permission error when testing with non-admin acct.

    console.log('Database has been dropped.');

    let adminUser, writerUser;

    // Create Admin User
    try {
        // Updated admin email directly
        const adminEmail = 'admin@gmail.com'; 
        const adminResult = await createUser('AdminUser', adminEmail, '12345678');
        const adminId = adminResult.userId;
        const userCollection = await users();
        adminUser = await userCollection.findOne({_id: adminId});
        console.log('Admin user created successfully.');
    } catch (e) {
        console.error('Failed to create admin user:', e);
    }

    // Create a regular user
    try {
        const writerResult = await createUser('AIWriterFan', 'writer@example.com', 'Password123');
        const writerId = writerResult.userId;
        const userCollection = await users();
        writerUser = await userCollection.findOne({_id: writerId});
        console.log('Regular user created successfully.');
    } catch (e) {
        console.error('Failed to create regular user:', e);
    }

    // Create Sample Tools
    try {
        await createTool('ChatGPT', 'https://chat.openai.com/', 'Text Generation, Conversational AI', 'GPT-4', 'A powerful conversational AI that can answer questions, write text, and more.', adminUser._id.toString());
        await createTool('Midjourney', 'https://www.midjourney.com/', 'Image Generation', 'N/A', 'A generative AI that creates images from textual descriptions.', adminUser._id.toString());
        await createTool('GitHub Copilot', 'https://github.com/features/copilot', 'Code Assistant, Development', 'OpenAI Codex', 'An AI pair programmer that helps you write code faster.', adminUser._id.toString());
        await createTool('RunwayML', 'https://runwayml.com/', 'Video Generation, Video Editing', 'Gen-2', 'An applied AI research company shaping the next era of art, entertainment and human creativity.', writerUser._id.toString());
        await createTool('Perplexity AI', 'https://www.perplexity.ai/', 'Search Engine, Conversational AI', 'LLaMA', 'An AI-powered answer engine that provides direct answers to questions with cited sources.', writerUser._id.toString());
        console.log('Sample tools created successfully.');
    } catch (e) {
        console.error('Failed to create sample tools:', e);
    }
    
    console.log('Done seeding database!');
    await closeConnection();
};

main().catch(console.error);
