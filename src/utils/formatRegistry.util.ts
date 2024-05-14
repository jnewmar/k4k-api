export default function formatRegistry(registry: string): string {
    return `${registry.slice(0,3)}.${registry.slice(3,6)}.${registry.slice(6,9)}-${registry.slice(9,11)}`;
}