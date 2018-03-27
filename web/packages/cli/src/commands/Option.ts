

export interface Option {
    shortName: string;
    longName: string;
    exampleValue: string;
    description?: string;
    defaultValue?: any;
}

export function getFlags(o: Option): string {
    return `-${o.shortName}, --${o.longName} <${o.longName}>`;
}