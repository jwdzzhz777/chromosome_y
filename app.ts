/** 注册全局 error 类 */
import './app/lib/global/errors';
import { Application } from 'egg';
import rules from './app/lib/utils/validatorRule';

class AppBootHook {
    app: Application;
    constructor(app: Application) {
        this.app = app;
    }

    async didLoad() {
        for (const key in rules) {
            this.app.validator.addRule(key, rules[key](this.app));
        }
    }
}

export default AppBootHook;
