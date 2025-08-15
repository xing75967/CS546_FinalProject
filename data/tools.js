import { tools } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

const validateTool = (name, officialUrl, category, summary) => {
    if (!name || typeof name !== 'string' || name.trim().length === 0) throw 'Tool name cannot be empty.';
    if (!officialUrl || typeof officialUrl !== 'string' || !/^https?:\/\/.+\..+/.test(officialUrl.trim())) throw 'Please provide a valid official website URL.';
    if (!category || typeof category !== 'string' || category.trim().length === 0) throw 'Category cannot be empty.';
    if (!summary || typeof summary !== 'string' || summary.trim().length === 0) throw 'Summary cannot be empty.';
};

export const createTool = async (name, officialUrl, category, techStack, summary, userId) => {
    validateTool(name, officialUrl, category, summary);
    if (!userId || !ObjectId.isValid(userId)) throw 'Invalid submitter ID.';
    const toolCollection = await tools();
    const categoryArray = category.split(',').map(cat => cat.trim()).filter(cat => cat);
    const newTool = {
        name: name.trim(),
        officialUrl: officialUrl.trim(),
        categories: categoryArray,
        techStack: techStack ? techStack.split(',').map(t => t.trim()).filter(t => t) : [],
        summary: summary.trim(),
        reviews: [],
        averageRating: 0,
        status: 'pending',
        submittedBy: new ObjectId(userId),
        submissionDate: new Date()
    };
    const insertInfo = await toolCollection.insertOne(newTool);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) throw 'Could not create new tool.';
    return { insertedTool: true, toolId: insertInfo.insertedId };
};

export const getToolById = async (toolId) => {
    if (!toolId || !ObjectId.isValid(toolId)) throw 'Invalid tool ID.';
    const toolCollection = await tools();
    const tool = await toolCollection.aggregate([
        { $match: { _id: new ObjectId(toolId) } },
        { $lookup: { from: 'users', localField: 'submittedBy', foreignField: '_id', as: 'submitterInfo' } },
        { $unwind: { path: '$submitterInfo', preserveNullAndEmptyArrays: true } },
        { $project: { name: 1, officialUrl: 1, categories: 1, techStack: 1, summary: 1, reviews: 1, averageRating: 1, status: 1, submissionDate: 1, 'submittedBy.username': '$submitterInfo.username', 'submittedBy._id': '$submitterInfo._id' } }
    ]).toArray();
    if (tool.length === 0) throw 'Tool not found.';
    tool[0].category = tool[0].categories.join(', ');
    tool[0].releaseDate = new Date(tool[0].submissionDate).toLocaleDateString();
    return tool[0];
};

export const getTopRatedTools = async (limit = 10) => {
    const toolCollection = await tools();
    return await toolCollection.find({ status: 'approved' }).sort({ averageRating: -1 }).limit(limit).toArray();
};

export const searchTools = async (query) => {
    if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
    const toolCollection = await tools();
    return await toolCollection.find({ status: 'approved', $text: { $search: query.trim() } }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).toArray();
};

export const getToolsByUserId = async (userId) => {
    if (!userId || !ObjectId.isValid(userId)) throw 'Invalid user ID.';
    const toolCollection = await tools();
    return await toolCollection.find({ submittedBy: new ObjectId(userId) }).toArray();
};

export const getToolsByIds = async (toolIds) => {
    if (!toolIds || !Array.isArray(toolIds)) return [];
    const objectIdList = toolIds.map(id => new ObjectId(id));
    const toolCollection = await tools();
    return await toolCollection.find({ _id: { $in: objectIdList } }).toArray();
};

export const addReviewToTool = async (toolId, userId, username, rating, comment) => {
    if (!toolId || !ObjectId.isValid(toolId)) throw 'Invalid tool ID.';
    if (!userId || !ObjectId.isValid(userId)) throw 'Invalid user ID.';
    rating = parseInt(rating, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) throw 'Rating must be an integer between 1 and 5.';
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) throw 'Comment cannot be empty.';
    const toolCollection = await tools();
    const tool = await toolCollection.findOne({ _id: new ObjectId(toolId) });
    if (!tool) throw 'Tool to be reviewed not found.';
    const newReview = { _id: new ObjectId(), user: { _id: new ObjectId(userId), username: username }, rating: rating, comment: comment.trim(), date: new Date().toLocaleDateString() };
    const totalRating = tool.reviews.reduce((sum, review) => sum + review.rating, 0) + newReview.rating;
    const newAverageRating = totalRating / (tool.reviews.length + 1);
    const updateResult = await toolCollection.updateOne({ _id: new ObjectId(toolId) }, { $push: { reviews: newReview }, $set: { averageRating: newAverageRating } });
    if (updateResult.modifiedCount === 0) throw 'Could not add review.';
    return { reviewAdded: true };
};

export const getPendingTools = async () => {
    const toolCollection = await tools();
    return await toolCollection.find({ status: 'pending' }).toArray();
};

export const updateToolStatus = async (toolId, newStatus) => {
    if (!toolId || !ObjectId.isValid(toolId)) throw 'Invalid tool ID.';
    if (newStatus !== 'approved' && newStatus !== 'rejected') throw 'Invalid status.';
    const toolCollection = await tools();
    const updateResult = await toolCollection.updateOne({ _id: new ObjectId(toolId) }, { $set: { status: newStatus } });
    if (updateResult.modifiedCount === 0) throw 'Could not update tool status.';
    return { statusUpdated: true };
};

export const getManagedTools = async () => {
    const toolCollection = await tools();
    return await toolCollection.find({ status: { $in: ['approved', 'rejected'] } }).toArray();
};

export const deleteToolById = async (toolId) => {
    if (!toolId || !ObjectId.isValid(toolId)) throw 'Invalid tool ID.';
    const toolCollection = await tools();
    const deletionInfo = await toolCollection.deleteOne({ _id: new ObjectId(toolId) });
    if (deletionInfo.deletedCount === 0) throw `Could not delete tool with id of ${toolId}`;
    return { deleted: true };
};
