export interface BotCommand {
  command: string;
  description: string;
}

export const commands: BotCommand[] = [
  {
    command: 'help',
    description: 'Show list of commands and help information',
  },
  {
    command: 'urls',
    description: 'Show list of shortened URLs along with their aliases',
  },
];
