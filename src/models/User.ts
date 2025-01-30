
interface IUser {
    id?: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
}

export default IUser;