import { Service } from 'egg';

export default class MainService extends Service {
    async autoBot() {
        let { assigneeId, repositoryId, labelId, files } = await this.service.git.getArticleList();

        for (let file of files) {
            // 测试用！！！
            if (file.name !== 'test.md') continue;

            // 通过 oid 查找数据库是否有记录该 oid 的东西
            let fileData = await this.ctx.model.Articles.findOne({
                where: { oid: file.oid },
                attributes: [ 'id' ],
                raw: true
            });

            if (!fileData) {
                // 不存在就创建一个 Issue

                let text = await this.service.git.getArticleContext(file.oid);
                console.log(text);
                // this.service.git.createIssue({
                //
                // });
                return;
            }

            let needUpdate = await this.issueNeedUpdate(file.name);
        }
    }
    async issueNeedUpdate(name: string): Promise<boolean> {
        let commitDate = await this.service.git.getLastCommitDate(name);
        return false
    }
}
