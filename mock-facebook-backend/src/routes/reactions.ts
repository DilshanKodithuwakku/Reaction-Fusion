import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { thirdPartySync } from '../services/thirdPartySync';

export const reactionsRouter = Router({ mergeParams: true });

const VALID_REACTIONS = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'] as const;
type ReactionType = typeof VALID_REACTIONS[number];

/**
 * POST /api/posts/:id/reactions
 * Adds or updates a user's reaction on a post
 */
reactionsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const { userId, type } = req.body;

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({ success: false, error: 'userId is required' });
      return;
    }

    if (!type || typeof type !== 'string') {
      res.status(400).json({ success: false, error: 'type is required' });
      return;
    }

    const normalizedType = type.toUpperCase() as ReactionType;
    if (!VALID_REACTIONS.includes(normalizedType)) {
      res.status(400).json({
        success: false,
        error: `Invalid reaction type. Must be one of: ${VALID_REACTIONS.join(', ')}`,
      });
      return;
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Upsert reaction (one reaction per user per post)
    const reaction = await prisma.reaction.upsert({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      update: {
        type: normalizedType,
      },
      create: {
        postId,
        userId,
        type: normalizedType,
      },
    });

    // Count new total reactions for this post
    const totalReactions = await prisma.reaction.count({
      where: { postId },
    });

    // Outbound webhook dispatch (asynchronous & non-blocking)
    thirdPartySync.dispatchReactionUpdated({
      postId,
      userId,
      reactionType: normalizedType,
      totalReactions,
    });

    res.json({
      success: true,
      data: {
        reaction,
        totalReactions,
      },
    });
  } catch (error) {
    console.error('Error handling reaction:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * DELETE /api/posts/:id/reactions
 * Removes a user's reaction from a post
 */
reactionsRouter.delete('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const userId = (req.body.userId || req.query.userId) as string;

    if (!userId) {
      res.status(400).json({ success: false, error: 'userId is required in body or query' });
      return;
    }

    // Attempt to delete reaction
    try {
      await prisma.reaction.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
    } catch {
      // If reaction didn't exist, continue gracefully
    }

    const totalReactions = await prisma.reaction.count({
      where: { postId },
    });

    // Outbound webhook dispatch for reaction removal
    thirdPartySync.dispatchReactionUpdated({
      postId,
      userId,
      reactionType: null,
      totalReactions,
    });

    res.json({
      success: true,
      message: 'Reaction removed',
      totalReactions,
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
