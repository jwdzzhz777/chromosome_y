export interface GitArticleObjectType {
    oid: string;
    name: string;
    type: string;
}

export interface GitUserType {
    id: string;
    name: string;
    login: string;
    email: string;
    bio: string;
    avatarUrl: string;
}
