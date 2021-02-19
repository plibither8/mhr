import { markdownv2 as format } from 'telegram-format';
import { chunkify } from './utils';
import { commands } from './commands';
import { States } from './states';
import * as db from '../database';
import config from '../../config.json';

type DefaultMessage = [string, object?];

function getAliasKeyboard() {
  return {
    keyboard: chunkify(
      db.getAll().map(({ alias }) => alias),
      2
    ),
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export const messages = {
  common: {
    operationsCancelled: format.escape('Ongoing operation cancelled. Off to a fresh start!'),
    noUrlsAdded: format.escape("You haven't added any URLs! Start by /new and see /help."),
    invalidDefaultCommand: (isCommand: boolean): DefaultMessage => {
      const message = isCommand ? 'Unrecognized command! See /help' : 'Please enter a command. See /help';
      return [format.escape(message)];
    },
    unauthorized: format.escape('You are unauthorized to interact with this bot.'),
    unauthorizedAlert: (id: number, firstName: string, isBot: boolean, text: string): string =>
      format.escape(
        `🚨 Unauthorized attempt!\nID: ${id}\nFirst name: ${firstName}\nBot? ${isBot ? 'Yes' : 'No'}\nText: ${text}`
      ),
    reinitialisedBot: (): string => format.escape(`♻️ Re-initialized bot with new domain: ${config.domain}`),
  },

  [States.DEFAULT]: {
    help: (): DefaultMessage => {
      const message = `${format.underline(
        'List of available commands:'
      )}\n\n${commands.map(({ command, description }) => format.escape(`/${command} ⇒ ${description}`)).join('\n')}`;
      return [message];
    },

    urls: (): DefaultMessage => {
      const urlList = db.getAll();
      const message = urlList.length
        ? `${format.underline('List of URLs:')}\n\n${urlList
            .map(
              ({ alias, target }) =>
                `• ${format.url(format.bold(format.escape(alias)), `${config.domain}/${alias}`)} ⇒ ${format.url(
                  format.escape(target),
                  target
                )}`
            )
            .join('\n')}`
        : messages.common.noUrlsAdded;
      return [message, { disable_web_page_preview: true }];
    },

    new: (): DefaultMessage => [format.escape('Awesome! Send me the alias')],

    update: (): DefaultMessage => {
      if (!db.getAll().length) return [messages.common.noUrlsAdded];
      const message = format.escape('I see! Send the alias of the target you want updated');
      return [message, { reply_markup: getAliasKeyboard() }];
    },

    delete: (): DefaultMessage => {
      if (!db.getAll().length) return [messages.common.noUrlsAdded];
      const message = format.escape('Cool! Send the alias you want deleted');
      return [message, { reply_markup: getAliasKeyboard() }];
    },
  },

  [States.ADD_ALIAS_TO_BE_RECEIVED]: {
    invalidAlias: (alias: string): string => format.escape(`Alias "${alias}" is invalid. Please try again.`),
    aliasExists: (alias: string): string =>
      format.escape(`Alias "${alias}" already exists, try again. Use /update to set a new target.`),
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

  [States.UPDATE_ALIAS_TO_BE_RECEIVED]: {
    invalidAlias: (alias: string): DefaultMessage => [
      format.escape(`Alias "${alias}" is invalid. Please try again.`),
      { reply_markup: getAliasKeyboard() },
    ],
    aliasNotFound: (alias: string): DefaultMessage => [
      format.escape(`No alias "${alias}" has been created. Choose one from the list or create one using /new.`),
      { reply_markup: getAliasKeyboard() },
    ],
    sendTarget: (alias: string): string => format.escape(`Got it! Now send me the new target URL for "${alias}"`),
  },

  [States.UPDATE_TARGET_TO_BE_RECEIVED]: {
    invalidTarget: format.escape('Invalid URL :(. Ensure that you add the leading protocol ("https", "http")'),
    targetUpdated: (alias: string, target: string): string =>
      `${format.escape('Done!')} ${format.bold(format.escape(alias))} ⇒ ${format.url(
        format.escape(target),
        target
      )}\n\nTry it out: ${format.url(format.escape(`${config.domain}/${alias}`), `${config.domain}/${alias}`)}`,
  },

  [States.DELETE_ALIAS_TO_BE_RECEIVED]: {
    invalidAlias: (alias: string): DefaultMessage => [
      format.escape(`Alias "${alias}" is invalid. Please try again.`),
      { reply_markup: getAliasKeyboard() },
    ],
    aliasNotFound: (alias: string): DefaultMessage => [
      format.escape(`No alias "${alias}" has been created. Please enter one from the existing list.`),
      { reply_markup: getAliasKeyboard() },
    ],
    aliasDeleted: (alias: string, target: string): string =>
      `${format.escape(`Done! Alias "${alias}" for`)} ${format.url(format.escape(target), target)} ${format.escape(
        'has been deleted.'
      )}`,
  },
};

export default messages;
