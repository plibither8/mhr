/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import api from './api';
import messages from './messages';
import { getCommandFromText, isValidAlias, isValidUrl, MessageEntity, prefix } from './utils';
import env from '../kv';

interface MessageInfo {
  text: string;
  entities: MessageEntity[];
}

export const enum States {
  DEFAULT,
  ADD_ALIAS_TO_BE_RECEIVED,
  ADD_TARGET_TO_BE_RECEIVED,
  UPDATE_ALIAS_TO_BE_RECEIVED,
  UPDATE_TARGET_TO_BE_RECEIVED,
  DELETE_ALIAS_TO_BE_RECEIVED,
}

const ActiveState: { state: States; stateData: any } = {
  state: States.DEFAULT,
  stateData: undefined,
};

const nextStateFromDefault: { [key: string]: States } = {
  new: States.ADD_ALIAS_TO_BE_RECEIVED,
  update: States.UPDATE_ALIAS_TO_BE_RECEIVED,
  delete: States.DELETE_ALIAS_TO_BE_RECEIVED,
};

const stateHandlers = {
  [States.DEFAULT]: async ({ text, entities }: MessageInfo) => {
    const stateMessages = messages[States.DEFAULT];
    const commandFromText = getCommandFromText(text, entities);
    const getMessage = stateMessages[commandFromText];
    const [message, options] = getMessage
      ? await getMessage()
      : messages.common.invalidDefaultCommand(!!commandFromText);
    await api.sendMessage(message, undefined, options);

    ActiveState.state = nextStateFromDefault[commandFromText] || States.DEFAULT;
  },

  [States.ADD_ALIAS_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {
    const stateMessages = messages[States.ADD_ALIAS_TO_BE_RECEIVED];
    const alias = text.trim();

    if (!isValidAlias(alias)) {
      const message = stateMessages.invalidAlias(alias);
      await api.sendMessage(message);
      return;
    }

    if (await env.MHR.get(alias)) {
      const message = stateMessages.aliasExists(alias);
      await api.sendMessage(message);
      return;
    }
    const message = stateMessages.sendTarget(alias);
    await api.sendMessage(message);

    ActiveState.stateData = { alias };
    ActiveState.state = States.ADD_TARGET_TO_BE_RECEIVED;
  },

  [States.ADD_TARGET_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {
    const stateMessages = messages[States.ADD_TARGET_TO_BE_RECEIVED];
    const target = text.trim();

    if (!isValidUrl(target)) {
      const message = stateMessages.invalidTarget;
      await api.sendMessage(message);
      return;
    }

    const { alias } = ActiveState.stateData;
    await env.MHR.put(prefix(alias, 'alias'), target);

    const message = stateMessages.targetSet(alias, target);
    await api.sendMessage(message, undefined, { disable_web_page_preview: true });

    ActiveState.stateData = undefined;
    ActiveState.state = States.DEFAULT;
  },

  [States.UPDATE_ALIAS_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {
    const stateMessages = messages[States.UPDATE_ALIAS_TO_BE_RECEIVED];
    const alias = text.trim();

    if (!isValidAlias(alias)) {
      const [message, options] = await stateMessages.invalidAlias(alias);
      await api.sendMessage(message, undefined, options);
      return;
    }

    const target = await env.MHR.get(prefix(alias, 'alias'));

    if (!target) {
      const [message, options] = await stateMessages.aliasNotFound(alias);
      await api.sendMessage(message, undefined, options);
      return;
    }

    const message = stateMessages.sendTarget(alias);
    await api.sendMessage(message);

    ActiveState.stateData = { alias };
    ActiveState.state = States.UPDATE_TARGET_TO_BE_RECEIVED;
  },

  [States.UPDATE_TARGET_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {
    const stateMessages = messages[States.UPDATE_TARGET_TO_BE_RECEIVED];
    const target = text.trim();

    if (!isValidUrl(target)) {
      const message = stateMessages.invalidTarget;
      await api.sendMessage(message);
      return;
    }

    const { alias } = ActiveState.stateData;
    await env.MHR.put(prefix(alias, 'alias'), target);

    const message = stateMessages.targetUpdated(alias, target);
    await api.sendMessage(message, undefined, { disable_web_page_preview: true });

    ActiveState.stateData = undefined;
    ActiveState.state = States.DEFAULT;
  },

  [States.DELETE_ALIAS_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {
    const stateMessages = messages[States.DELETE_ALIAS_TO_BE_RECEIVED];
    const alias = text.trim();

    if (!isValidAlias(alias)) {
      const [message, options] = await stateMessages.invalidAlias(alias);
      await api.sendMessage(message, undefined, options);
      return;
    }

    const target = await env.MHR.get(prefix(alias, 'alias'));

    if (!target) {
      const [message, options] = await stateMessages.aliasNotFound(alias);
      await api.sendMessage(message, undefined, options);
      return;
    }

    await env.MHR.delete(prefix(alias, 'alias'));
    const message = stateMessages.aliasDeleted(alias, target);
    await api.sendMessage(message, undefined, { disable_web_page_preview: true });

    ActiveState.state = States.DEFAULT;
  },
};

export async function messageHandler(message: MessageInfo): Promise<void> {
  const commandFromText = getCommandFromText(message.text, message.entities);
  if (commandFromText === 'cancel') {
    ActiveState.state = States.DEFAULT;
    ActiveState.stateData = undefined;
    await api.sendMessage(messages.common.operationsCancelled);
    return;
  }

  await stateHandlers[ActiveState.state](message);
}
