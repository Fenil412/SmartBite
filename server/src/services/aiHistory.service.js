import { AiHistory } from "../models/aiHistory.model.js";
import { User } from "../models/user.model.js";

export class AiHistoryService {
    
    /**
     * Get AI interaction statistics for a user
     */
    static async getUserAiStats(userId) {
        try {
            // Get user to find username
            const user = await User.findById(userId).select('username email');
            if (!user) {
                throw new Error('User not found');
            }

            // Query by both userId and username for maximum compatibility
            const query = {
                $or: [
                    { userId: userId.toString() },
                    { userId: userId },
                    { username: user.username },
                    { username: user.email } // Sometimes email is used as username
                ]
            };

            // Get total interactions
            const totalInteractions = await AiHistory.countDocuments(query);

            // Get interactions by type
            const interactionsByType = await AiHistory.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: "$type",
                        count: { $sum: 1 },
                        lastInteraction: { $max: "$timestamp" }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get recent interactions (last 10)
            const recentInteractions = await AiHistory.find(query)
                .sort({ timestamp: -1 })
                .limit(10)
                .select('type action timestamp success metadata');

            // Get interactions by date (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const interactionsByDate = await AiHistory.aggregate([
                { 
                    $match: { 
                        ...query,
                        timestamp: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$timestamp"
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            // Get success rate
            const successfulInteractions = await AiHistory.countDocuments({
                ...query,
                success: true
            });

            const successRate = totalInteractions > 0 
                ? ((successfulInteractions / totalInteractions) * 100).toFixed(2)
                : 0;

            // Get most active day
            const mostActiveDay = interactionsByDate.reduce((max, day) => 
                day.count > (max?.count || 0) ? day : max, null
            );

            return {
                totalInteractions,
                successfulInteractions,
                failedInteractions: totalInteractions - successfulInteractions,
                successRate: parseFloat(successRate),
                interactionsByType: interactionsByType.map(item => ({
                    type: item._id,
                    count: item.count,
                    lastInteraction: item.lastInteraction
                })),
                recentInteractions,
                interactionsByDate,
                mostActiveDay,
                user: {
                    id: userId,
                    username: user.username,
                    email: user.email
                },
                queryUsed: query // For debugging
            };

        } catch (error) {
            console.error('Error fetching AI history stats:', error);
            throw error;
        }
    }

    /**
     * Get detailed AI interaction history for a user
     */
    static async getUserAiHistory(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                type = null,
                startDate = null,
                endDate = null,
                success = null
            } = options;

            // Get user to find username
            const user = await User.findById(userId).select('username email');
            if (!user) {
                throw new Error('User not found');
            }

            // Build query
            const query = {
                $or: [
                    { userId: userId.toString() },
                    { userId: userId },
                    { username: user.username },
                    { username: user.email }
                ]
            };

            // Add filters
            if (type) {
                query.type = type;
            }

            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = new Date(startDate);
                if (endDate) query.timestamp.$lte = new Date(endDate);
            }

            if (success !== null) {
                query.success = success;
            }

            // Get total count
            const totalCount = await AiHistory.countDocuments(query);

            // Get paginated results
            const interactions = await AiHistory.find(query)
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('type action timestamp success metadata processingTime error');

            return {
                interactions,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    hasNext: page < Math.ceil(totalCount / limit),
                    hasPrev: page > 1
                },
                filters: {
                    type,
                    startDate,
                    endDate,
                    success
                }
            };

        } catch (error) {
            console.error('Error fetching AI history:', error);
            throw error;
        }
    }

    /**
     * Get AI interaction summary for dashboard
     */
    static async getDashboardSummary(userId) {
        try {
            const stats = await this.getUserAiStats(userId);
            
            // Get today's interactions
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const user = await User.findById(userId).select('username email');
            const query = {
                $or: [
                    { userId: userId.toString() },
                    { userId: userId },
                    { username: user.username },
                    { username: user.email }
                ]
            };

            const todayInteractions = await AiHistory.countDocuments({
                ...query,
                timestamp: { $gte: today }
            });

            // Get this week's interactions
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);

            const weekInteractions = await AiHistory.countDocuments({
                ...query,
                timestamp: { $gte: weekStart }
            });

            // Get favorite AI service (most used)
            const favoriteService = stats.interactionsByType.length > 0 
                ? stats.interactionsByType[0] 
                : null;

            return {
                totalInteractions: stats.totalInteractions,
                todayInteractions,
                weekInteractions,
                successRate: stats.successRate,
                favoriteService: favoriteService ? {
                    type: favoriteService.type,
                    count: favoriteService.count,
                    lastUsed: favoriteService.lastInteraction
                } : null,
                recentActivity: stats.recentInteractions.slice(0, 5)
            };

        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            throw error;
        }
    }
}