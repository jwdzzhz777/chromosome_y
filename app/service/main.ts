import { Service } from 'egg';
import { GitArticleObjectType } from '../types/git';

export default class MainService extends Service {
    async compare(fileList: GitArticleObjectType[]) {
        for (let file of fileList) {
            let data = await this.service.git.getLastCommitDate(file.name);
        }
    }
}
