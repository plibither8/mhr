export interface BotCommand {
  command: string;
  description: string;
}

export const commandAliases: { [key: string]: string } = {
  list: 'urls',
  create: 'new',
};

export const commands: BotCommand[] = (() => {
  const defaultCommands: BotCommand[] = [
    {
      command: 'help',
      description: 'Show list of commands and help information',
    },
    {
      command: 'cancel',
      description: 'Cancel the ongoing operation',
    },
    {
      command: 'urls',
      description: 'Show list of shortened URLs along with their aliases',
    },
    {
      command: 'new',
      description: 'Create a new alias for a URL',
    },
    {
      command: 'update',
      description: 'Update the target URL for an existing alias',
    },
    {
      command: 'delete',
      description: 'Delete an alias and redirection',
    },
  ];
  return [
    ...defaultCommands,
    ...Object.entries(commandAliases).map(([alias, target]) => ({
      command: alias,
      description: defaultCommands.find(({ command }) => target === command).description,
    })),
  ];
})();
