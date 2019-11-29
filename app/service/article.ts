import { Service } from 'egg';

export default class MainService extends Service {
    async autoBot() {
        let { assigneeId, repositoryId, labelId, files } = await this.service.git.getArticleList();

        for (let { oid, name} of files) {
            /** 测试用！！！ */
            if (name !== 'test.md') continue;
            /** 先获取最近一次提交时间 */
            let commitDate = await this.service.git.getLastCommitDate(name);

            // 通过 oid 查找数据库是否有记录该 oid 的东西
            let fileData = await this.ctx.model.Articles.findOne({
                where: { oid },
                attributes: [ 'id' ],
                raw: true
            });

            /** 不存在就创建一个 Issue */
            if (!fileData) {
                // 先拿到文章内容
                let text = await this.service.git.getArticleContext(oid);
                /** 截取 title */
                let title = text.split('\n')[0].substr(2);
                let issueNumber = await this.service.git.createIssue({
                    assigneeIds: [assigneeId],
                    repositoryId,
                    labelIds: [labelId],
                    projectIds: [],
                    title,
                    body: text
                });

                await this.ctx.model.Articles.create({
                    oid,
                    issueId: issueNumber,
                    title: title,
                    publishedAt: commitDate,
                    issueUpdatedAt: commitDate
                });

                return;
            }
        }
    }
}
