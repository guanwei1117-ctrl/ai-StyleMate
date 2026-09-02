import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OotdPost } from './ootd-post.entity';
import { OotdLike } from './ootd-like.entity';
import { OotdComment } from './ootd-comment.entity';

const MAX_IMAGE_LENGTH = 2_500_000; // 分享卡 base64 约 100-400KB，2.5MB 上限足够
const MAX_CAPTION_LENGTH = 500;
const MAX_COMMENT_LENGTH = 200;

export interface OotdPostView {
  id: string;
  userId: string;
  imageData: string;
  caption?: string;
  scoreAvg?: number;
  scoreJson?: string;
  createdAt: Date;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  status: string;
  styleTags?: string;
  rejectReason?: string;
}

@Injectable()
export class OotdService {
  private readonly logger = new Logger(OotdService.name);

  constructor(
    @InjectRepository(OotdPost)
    private readonly postRepo: Repository<OotdPost>,
    @InjectRepository(OotdLike)
    private readonly likeRepo: Repository<OotdLike>,
    @InjectRepository(OotdComment)
    private readonly commentRepo: Repository<OotdComment>,
  ) {}

  async list(
    viewerUserId: string | undefined,
    page = 1,
    pageSize = 20,
  ): Promise<{ items: OotdPostView[]; total: number; hasMore: boolean }> {
    const take = Math.min(Math.max(pageSize, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const [posts, total] = await this.postRepo.findAndCount({
      where: { status: 'approved' },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    const items: OotdPostView[] = [];
    for (const post of posts) {
      const [likeCount, commentCount, myLike] = await Promise.all([
        this.likeRepo.count({ where: { postId: post.id } }),
        this.commentRepo.count({ where: { postId: post.id } }),
        viewerUserId
          ? this.likeRepo.findOne({ where: { postId: post.id, userId: viewerUserId } })
          : Promise.resolve(null),
      ]);
      items.push({
        id: post.id,
        userId: post.userId,
        imageData: post.imageData,
        caption: post.caption,
        scoreAvg: post.scoreAvg,
        scoreJson: post.scoreJson,
        createdAt: post.createdAt,
        likeCount,
        commentCount,
        likedByMe: !!myLike,
        status: post.status,
        styleTags: post.styleTags,
      });
    }

    return { items, total, hasMore: skip + take < total };
  }

  async create(
    userId: string,
    data: { imageData: string; caption?: string; scoreAvg?: number; scoreJson?: string; styleTags?: string },
  ): Promise<OotdPost> {
    if (!data.imageData || !data.imageData.startsWith('data:image/')) {
      throw new BadRequestException('图片数据无效');
    }
    if (data.imageData.length > MAX_IMAGE_LENGTH) {
      throw new BadRequestException('图片过大，请重新生成分享图');
    }
    if (data.caption && data.caption.length > MAX_CAPTION_LENGTH) {
      throw new BadRequestException('文案过长');
    }

    const post = this.postRepo.create({
      userId,
      imageData: data.imageData,
      caption: data.caption,
      scoreAvg: data.scoreAvg,
      scoreJson: data.scoreJson,
      styleTags: data.styleTags,
      status: 'pending',
    });
    const saved = await this.postRepo.save(post);
    this.logger.log(`OOTD 发布 | userId: ${userId} | postId: ${saved.id}`);
    return saved;
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('帖子不存在');
    if (post.userId !== userId) throw new NotFoundException('帖子不存在');
    await this.postRepo.remove(post);
    // 清理关联数据
    await this.likeRepo.delete({ postId });
    await this.commentRepo.delete({ postId });
  }

  async toggleLike(userId: string, postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('帖子不存在');

    const existing = await this.likeRepo.findOne({ where: { postId, userId } });
    if (existing) {
      await this.likeRepo.remove(existing);
    } else {
      await this.likeRepo.save(this.likeRepo.create({ postId, userId }));
    }
    const likeCount = await this.likeRepo.count({ where: { postId } });
    return { liked: !existing, likeCount };
  }

  async listComments(postId: string): Promise<OotdComment[]> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('帖子不存在');
    return this.commentRepo.find({
      where: { postId },
      order: { createdAt: 'ASC' },
    });
  }

  async addComment(userId: string, postId: string, content: string): Promise<OotdComment> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('帖子不存在');
    const trimmed = (content ?? '').trim();
    if (!trimmed) throw new BadRequestException('评论内容不能为空');
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      throw new BadRequestException('评论过长');
    }
    const comment = this.commentRepo.create({ postId, userId, content: trimmed });
    return this.commentRepo.save(comment);
  }

  /** 管理员：按状态查询帖子列表 */
  async adminList(
    status: string,
    page = 1,
    pageSize = 20,
  ): Promise<{ items: OotdPostView[]; total: number; hasMore: boolean }> {
    const take = Math.min(Math.max(pageSize, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const where = status && status !== 'all' ? { status } : {};
    const [posts, total] = await this.postRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    const items: OotdPostView[] = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      imageData: post.imageData,
      caption: post.caption,
      scoreAvg: post.scoreAvg,
      scoreJson: post.scoreJson,
      createdAt: post.createdAt,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
      status: post.status,
      styleTags: post.styleTags,
      rejectReason: post.rejectReason,
    }));

    return { items, total, hasMore: skip + take < total };
  }

  /** 管理员：审核帖子 */
  async reviewPost(
    postId: string,
    reviewerId: string,
    action: 'approved' | 'rejected',
    rejectReason?: string,
  ): Promise<OotdPost> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('帖子不存在');

    post.status = action;
    post.reviewedBy = reviewerId;
    post.reviewedAt = new Date();
    if (action === 'rejected') {
      post.rejectReason = rejectReason || undefined;
    }
    return this.postRepo.save(post);
  }
}
