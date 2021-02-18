import { markdownv2 as format } from 'telegram-format';
import { commands } from './commands';
import api from './api';
import * as db from '../database';
import config from '../../config.json';
import { ActiveState, States } from './states';

type DefaultMessage = [string, object?];

export const messages = {
  [States.DEFAULT]: {
    help: (): DefaultMessage => {
      const message = `${format.underline('List of available commands:')}\n${commands
        .map(({ command, description }) => format.escape(`/${command} ⇒ ${description}`))
        .join('\n')}`;
      return [message];
    },

    urls: (): DefaultMessage => {
      const urlList = db.getAll();
      const message = `${format.underline('List of URLs:')}\n${urlList
        .map(
          ({ alias, target }) =>
            `${format.url(format.bold(format.escape(alias)), `${config.domain}/${alias}`)} ⇒ ${format.url(
              format.escape(target),
              target
            )}`
        )
        .join('\n')}`;
      return [message, { disable_web_page_preview: true }];
    },

    new: (): DefaultMessage => {
      const message = format.escape('Awesome! Send me the alias');
      ActiveState.state = States.ADD_ALIAS_TO_BE_RECEIVED;
      return [message];
    },

    error: (isCommand: boolean): DefaultMessage => {
      const message = isCommand ? 'Unrecognized command! See /help' : 'Please enter a command. See /help';
      return [format.escape(message)];
    },
  },

  [States.ADD_ALIAS_TO_BE_RECEIVED]: {
    invalidAlias: (alias: string): string => format.escape(`Alias "${alias}" is invalid. Please try again.`),
    sendTarget: (alias: string): string => format.escape(`Got it! Now send me the target URL for "${alias}"`),
  },

  [States.ADD_TARGET_TO_BE_RECEIVED]: {
    invalidTarget: format.escape('Invalid URL :(. Ensure that you add the leading protocol ("https", "http")'),
    targetSet: (alias: string, target: string): string =>
      `${format.escape('Done!')} ${format.bold(format.escape(alias))} ⇒ ${format.url(
        format.escape(target),
        target
      )}\n\nTry it out: ${format.url(format.escape(`${config.domain}/${alias}`), `${config.domain}/${alias}`)}`,
  },
};

export default messages;
