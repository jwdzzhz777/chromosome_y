import { Service } from 'egg';

export default class MainService extends Service {
    async autoBot() {
        let { assigneeId, repositoryId, labelId, files } = await this.service.git.getArticleList();

        for (let { oid, name} of files) {
            this.logger.info(`
                fileName:${name}，fileId:${oid}
            `);
            /** 测试用！！！ */
            // if (name !== 'test.md') continue;
            /** 先获取最近一次提交时间 */
            let fileCommitDate = await this.service.git.getLastAndFirstCommitDate(name);
            // 取不到就跳过
            if (!fileCommitDate) continue;
            let [commitDate, createTime] = fileCommitDate as Date[];

            // 通过 fileName 查找数据库是否有记录该 file 的东西
            let fileData: any = await this.ctx.model.Articles.findOne({
                where: { fileName: name },
                attributes: [ 'id', 'issueUpdatedAt', 'issueNumber' ],
                raw: true
            });
            this.logger.info(`
                commitDate:${commitDate}，issueUpdatedAt:${fileData!.issueUpdatedAt}。
            `);

            /** 不存在就创建一个 Issue */
            if (!fileData) {
                // 先拿到文章内容
                let text = await this.service.git.getArticleContext(oid);
                /** 截取 title */
                let title = text.split('\n')[0].substr(2);
                let {number: issueNumber, id} = await this.service.git.createIssue({
                    assigneeIds: [assigneeId],
                    repositoryId,
                    labelIds: [labelId],
                    projectIds: [],
                    title,
                    body: text
                });
                this.logger.info(`
                    ---------创建 Issue---------
                `);
                this.logger.info({
                    issueNumber,
                    issueId: id
                });

                await this.ctx.model.Articles.create({
                    fileName: name,
                    oid,
                    issueId: id,
                    issueNumber: issueNumber,
                    title: title,
                    publishedAt: createTime,
                    issueUpdatedAt: commitDate
                });
            } else if (+commitDate > +fileData.issueUpdatedAt){
                /** 提交时间大于更新时间的话就更新 issue */
                // 先拿到文章内容
                let text = await this.service.git.getArticleContext(oid);
                let title = text.split('\n')[0].substr(2);

                this.logger.info(`
                    --------- 更新 Issue ---------
                `);

                await this.service.git.updateIssue(text, title, fileData.issueNumber);
                /*
                    需要更新
                    commitDate： 用户判断是否需要更新，
                    oid: 文件的 oid 是会随着提交而变化所以要一直保持最新
                    issueId、number: issue 的 id和numnber 是不会变的，不需要更新
                 */
                await this.ctx.model.Articles.update({
                    issueUpdatedAt: commitDate,
                    title,
                    oid
                }, {
                    where: { fileName: name }
                });
            }
        }
    }
}
