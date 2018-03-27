import { GenJsonCommand } from '../src/commands/GenJsonCommand';
import { BaseCommand } from '../src/commands/BaseCommand';
import { baseDir } from '../src/commands/DefaultOptions';

describe('BaseCommand', () => {

    it('Generates example from defined options', () => {
        const command: BaseCommand = new GenJsonCommand();
        expect(command.usageExamples()).toBe(' $ plexus gen-json-meta -b metadata -o src/gen');
    });

    it('Generates option args', () => {
        const command: BaseCommand = new GenJsonCommand();
        const args = command.optionArgs({
            baseDir: 'baseDir',
            out: 'out'
        }, '=');        
        expect(args.join(' ')).toBe('--baseDir=baseDir --out=out');
    });

    it('Fails validation if required option not provided', () => {
        const command: BaseCommand = new GenJsonCommand();
        expect(command.validateRequiredOpts([baseDir()], {}).length).toBe(1);        
    });

    it('Passes validation if required option provided', () => {
        const command: BaseCommand = new GenJsonCommand();
        expect(command.validateRequiredOpts([baseDir()], {
            baseDir: 'value'
        }).length).toBe(0);        
    });

});