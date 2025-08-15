import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const validateUser = (username, email, password) => {
    if (!username || typeof username !== 'string' || username.trim().length < 4) {
        throw 'Error: Username must be a string of at least 4 characters.';
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw 'Error: Please provide a valid email address.';
    }
    if (password && (typeof password !== 'string' || password.length < 8)) {
        throw 'Error: Password must be at least 8 characters long.';
    }
};

export const createUser = async (username, email, password) => {
    validateUser(username, email, password);
    const userCollection = await users();
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userCollection.findOne({ email: normalizedEmail });
    if (existingUser) throw 'Error: This email address is already registered.';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = {
        username: username.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        avatarUrl: null,
        submittedTools: [],
        bookmarkedTools: [],
        createdAt: new Date()
    };
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not create user.';
    return { insertedUser: true, userId: insertInfo.insertedId };
};

export const checkUser = async (email, password) => {
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw 'Error: Please provide a valid email address.';
    if (!password || typeof password !== 'string' || password.length < 8) throw 'Error: Invalid password format.';
    const userCollection = await users();
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userCollection.findOne({ email: normalizedEmail });
    if (!user) throw 'Error: Invalid email or password.';
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw 'Error: Invalid email or password.';
    return { _id: user._id.toString(), username: user.username, email: user.email, avatarUrl: user.avatarUrl };
};

export const getUserById = async (userId) => {
    if (!userId || !ObjectId.isValid(userId)) throw 'Invalid user ID.';
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'User not found.';
    return user;
};

export const updateUser = async (userId, updateData) => {
    if (!userId || !ObjectId.isValid(userId)) throw 'Invalid user ID.';
    const { username, avatarUrl } = updateData;
    if (!username || typeof username !== 'string' || username.trim().length < 4) throw 'Error: Username must be a string of at least 4 characters.';
    if (avatarUrl && (typeof avatarUrl !== 'string' || (avatarUrl.trim() !== '' && !/^https?:\/\/.+\..+/.test(avatarUrl.trim())))) throw 'Please provide a valid avatar URL or leave it blank.';
    const userCollection = await users();
    const updatedInfo = { username: username.trim(), avatarUrl: avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : null };
    await userCollection.updateOne({ _id: new ObjectId(userId) }, { $set: updatedInfo });
    return await getUserById(userId);
};

export const toggleBookmark = async (userId, toolId) => {
    if (!userId || !ObjectId.isValid(userId)) throw 'Invalid user ID.';
    if (!toolId || !ObjectId.isValid(toolId)) throw 'Invalid tool ID.';
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) throw 'User not found.';
    const toolObjectId = new ObjectId(toolId);
    const isBookmarked = user.bookmarkedTools.some(id => id.equals(toolObjectId));
    let updateOperation;
    if (isBookmarked) {
        updateOperation = { $pull: { bookmarkedTools: toolObjectId } };
    } else {
        updateOperation = { $addToSet: { bookmarkedTools: toolObjectId } };
    }
    await userCollection.updateOne({ _id: new ObjectId(userId) }, updateOperation);
    return { success: true, bookmarked: !isBookmarked };
};
