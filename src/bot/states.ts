/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import api from './api';
import messages from './messages';
import * as db from '../database';
import { getCommandFromText, isValidAlias, isValidUrl, MessageEntity } from './utils';

interface MessageInfo {
  text: string;
  entities: MessageEntity[];
}

export const enum States {
  DEFAULT,
  ADD_ALIAS_TO_BE_RECEIVED,
  ADD_TARGET_TO_BE_RECEIVED,
  GET_ALIAS_TO_BE_RECEIVED,
  UPDATE_ALIAS_TO_BE_RECEIVED,
  UPDATE_TARGET_TO_BE_RECEIVED,
  DELETE_ALIAS_TO_BE_RECEIVED,
}

class State {
  private _state: States = States.DEFAULT;

  private _stateData: any = undefined;

  get state(): States {
    return this._state;
  }

  set state(newState: States) {
    this._state = newState;
  }

  get stateData(): any {
    return this._stateData;
  }

  set stateData(newStateData: any) {
    this._stateData = newStateData;
  }
}

export const ActiveState = new State();

const stateHandlers = {
  [States.DEFAULT]: async ({ text, entities }: MessageInfo) => {
    const stateMessages = messages[ActiveState.state];
    const commandFromText = getCommandFromText(text, entities);
    const getMessage = stateMessages[commandFromText];
    const [message, options] = getMessage ? await getMessage() : stateMessages.error(!!commandFromText);
    await api.sendMessage(message, undefined, options);
  },

  [States.ADD_ALIAS_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {
    const stateMessages = messages[ActiveState.state];
    const alias = text.trim();

    if (!isValidAlias(alias)) {
      const message = stateMessages.invalidAlias(alias);
      await api.sendMessage(message);
      return;
    }

    const message = stateMessages.sendTarget(alias);
    await api.sendMessage(message);

    ActiveState.stateData = { alias };
    ActiveState.state = States.ADD_TARGET_TO_BE_RECEIVED;
  },

  [States.ADD_TARGET_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {
    const stateMessages = messages[ActiveState.state];
    const target = text.trim();

    if (!isValidUrl(target)) {
      const message = stateMessages.invalidTarget;
      await api.sendMessage(message);
      return;
    }

    const { alias } = ActiveState.stateData;
    db.set(alias, target);

    const message = stateMessages.targetSet(alias, target);
    await api.sendMessage(message, undefined, { disable_web_page_preview: true });

    ActiveState.stateData = undefined;
    ActiveState.state = States.DEFAULT;
  },

  [States.GET_ALIAS_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {},

  [States.UPDATE_ALIAS_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {},

  [States.UPDATE_TARGET_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {},

  [States.DELETE_ALIAS_TO_BE_RECEIVED]: async ({ text }: MessageInfo) => {},
};

export async function stateSwitcher(message: MessageInfo): Promise<void> {
  console.log(ActiveState.state);
  await stateHandlers[ActiveState.state](message);
}
