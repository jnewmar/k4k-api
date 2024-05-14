export default function generateSimpleHash(): string {
    return Math.random()
        .toString(36)
        .substring(2);
}
