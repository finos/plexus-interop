
import * as program from 'commander';

export interface Command {

    register(builder: program.CommanderStatic): void;

}