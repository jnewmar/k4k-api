export default class FirebaseUser {
    email: string;
    password: string;
    uid?:string;
    emailVerified?: boolean;
    phoneNumber?: string;
    displayName?: string;
    photoURL?: string;
    disabled?: boolean; 
}