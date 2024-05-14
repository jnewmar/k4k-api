export default interface EmailOptions {
    to: string[] | string;
    subject: string;
    text: string;
    html?: string;
}
