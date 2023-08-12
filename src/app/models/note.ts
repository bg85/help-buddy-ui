import { Service } from "./service";

export class Note {
    public clientName: string;
    public dateOfService: string;
    public gender: Gender;
    public services: Service[];

    constructor(init?: Partial<Note>) {
        const currentDate = new Date();

        const defaultNote: Partial<Note> = {
            clientName: "",
            dateOfService: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
            gender: Gender.Unknown,
            services: []
        };
        Object.assign(this, defaultNote, init);
    }
}

export enum Gender {
    Unknown = 0,
    Male = 1,
    Female = 2
}

export namespace Gender {
    export function getKeys(): number[] {
        return Object.keys(Gender).filter(g => (!isNaN(Number(g)) && Number(g) !== 0)).map(k => parseInt(k));
    }
}