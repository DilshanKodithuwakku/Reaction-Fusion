import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { thirdPartySync } from '../services/thirdPartySync';

export const commentsRouter = Router({ mergeParams: true });

/**
 * GET /api/posts/:id/comments
 * Fetches all comments for a post
 */
commentsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            handle: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: comments,
      count: comments.length,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * POST /api/posts/:id/comments
 * Appends a comment to a post
 */
commentsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const { authorId, text } = req.body;

    if (!authorId || typeof authorId !== 'string') {
      res.status(400).json({ success: false, error: 'authorId is required' });
      return;
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.status(400).json({ success: false, error: 'Comment text cannot be empty' });
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

    // Verify author exists
    const author = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      res.status(404).json({ success: false, error: 'Author not found' });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        text: text.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            handle: true,
          },
        },
      },
    });

    const totalComments = await prisma.comment.count({
      where: { postId },
    });

    // Outbound webhook dispatch (asynchronous & non-blocking)
    thirdPartySync.dispatchCommentCreated({
      postId,
      commentId: comment.id,
      author: {
        id: author.id,
        name: author.name,
      },
      text: comment.text,
      totalComments,
    });

    res.status(201).json({
      success: true,
      data: comment,
      totalComments,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
