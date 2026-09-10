import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const postsRouter = Router();

/**
 * GET /api/posts
 * Paginated news feed with reaction counts breakdown, comments count, and author profile details.
 */
postsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const [totalPosts, posts] = await Promise.all([
      prisma.post.count(),
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              handle: true,
            },
          },
          reactions: {
            select: {
              type: true,
              userId: true,
            },
          },
          comments: {
            take: 20,
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
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            },
          },
        },
      }),
    ]);

    // Format reaction breakdown for each post
    const formattedPosts = posts.map((post) => {
      const reactionBreakdown = post.reactions.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        id: post.id,
        content: post.content,
        mediaUrl: post.mediaUrl,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        metrics: {
          totalReactions: post._count.reactions,
          totalComments: post._count.comments,
          reactionsByType: reactionBreakdown,
        },
        recentComments: post.comments,
      };
    });

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * POST /api/posts
 * Create a new post
 */
postsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { authorId, content, mediaUrl } = req.body;

    if (!authorId || typeof authorId !== 'string') {
      res.status(400).json({ success: false, error: 'Valid authorId is required' });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      res.status(400).json({ success: false, error: 'Post content cannot be empty' });
      return;
    }

    // Verify user exists
    const author = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      res.status(404).json({ success: false, error: 'Author not found' });
      return;
    }

    const post = await prisma.post.create({
      data: {
        authorId,
        content: content.trim(),
        mediaUrl: mediaUrl?.trim() || null,
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

    res.status(201).json({
      success: true,
      data: {
        ...post,
        metrics: {
          totalReactions: 0,
          totalComments: 0,
          reactionsByType: {},
        },
        recentComments: [],
      },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * GET /api/posts/:id
 * Fetches a single post with complete reactions and comments list
 */
postsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            handle: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                handle: true,
              },
            },
          },
        },
        comments: {
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
        },
      },
    });

    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const reactionBreakdown = post.reactions.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        id: post.id,
        content: post.content,
        mediaUrl: post.mediaUrl,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        metrics: {
          totalReactions: post.reactions.length,
          totalComments: post.comments.length,
          reactionsByType: reactionBreakdown,
        },
        reactions: post.reactions,
        comments: post.comments,
      },
    });
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});
