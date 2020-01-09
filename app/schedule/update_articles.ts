import { Subscription } from 'egg';

export default class UpdateArticles extends Subscription {
    static get schedule() {
        return {
            cron: '0 0 0 * * *', // 每天 24 点准点执行
            type: 'all',
            immediate: true // 立即执行
        };
    }

    async subscribe() {
        this.ctx.logger.info('更新 github issue 定时器');
        await this.ctx.service.article.autoBot();
    }
}
