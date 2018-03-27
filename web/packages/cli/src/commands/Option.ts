

export interface Option {
    shortName: string;
    longName: string;
    exampleValue: string;
    description?: string;
    isRequired?: boolean;
    defaultValue?: any;
}

export function getFlags(o: Option): string {
    return !!o.isRequired ? 
        `-${o.shortName}, --${o.longName} <${o.longName}>`
            : `-${o.shortName}, --${o.longName}`;
}