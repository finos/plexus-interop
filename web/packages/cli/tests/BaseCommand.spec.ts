import { GenJsonCommand } from '../src/commands/GenJsonCommand';
import { BaseCommand } from '../src/commands/BaseCommand';

describe('BaseCommand', () => {

    it('Generates example from defined options', () => {
        const command: BaseCommand = new GenJsonCommand();
        expect(command.usageExamples()).toBe(' $ plexus gen-json-meta -b metadata -o src/gen');
    });

});