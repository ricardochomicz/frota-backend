
export interface IUser {
    id?: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
}

export interface IUserUpdate {
    name: string;
    email: string;
    role: string;
}

