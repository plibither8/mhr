import { markdownv2 as format } from 'telegram-format';
import { commands } from './commands';
import api from './api';
import * as db from '../database';
import config from '../../config.json';
import { ActiveState, States } from './states';

type DefaultMessage = [string, object?];

export const defaultState = {
  help: (): DefaultMessage => {
    const message = `${format.underline('List of available commands:')}\n${commands
      .map(({ command, description }) => format.escape(`/${command} - ${description}`))
      .join('\n')}`;
    return [message];
  },

  urls: (): DefaultMessage => {
    const urlList = db.getAll();
    const message = `${format.underline('List of URLs:')}\n${urlList
      .map(
        ({ alias, target }) =>
          `${format.url(format.bold(format.escape(alias)), `${config.domain}/${alias}`)} \\- ${format.url(
            format.escape(target),
            target
          )}`
      )
      .join('\n')}`;
    return [message, { disable_web_page_preview: true }];
  },

  new: (): DefaultMessage => {
    const message = format.escape('Awesome! Send me the *alias*');
    ActiveState.state = States.ADD_ALIAS_TO_BE_RECEIVED;
    return [message];
  },

  error: (isCommand: boolean): DefaultMessage => {
    const message = isCommand ? 'Unrecognized command! See /help' : 'Please enter a command. See /help';
    return [format.escape(message)];
  },
};
