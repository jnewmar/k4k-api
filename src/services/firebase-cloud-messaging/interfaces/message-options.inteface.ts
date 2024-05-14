export default interface MessageOptions {
    tokens: string[] | string;
    data: any;
    notificationTitle: string;
    notificationMessage: string;
    notificationIcon?: string;
    notificationSound?: string;
}
