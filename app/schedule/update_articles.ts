import { Subscription, Context } from 'egg';

export default class UpdateArticles extends Subscription {
    static get schedule() {
        return {
            cron: '0 0 24 * * *', // 每天 24 点准点执行
            type: 'all',
            immediate: true // 立即执行
        };
    }

    async subscribe(ctx: Context) {
        await ctx.service.article.autoBot();
    }
}
