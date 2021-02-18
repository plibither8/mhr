/* eslint-disable no-underscore-dangle */
import api from './api';
import * as messages from './messages';
import { getCommandFromText, MessageEntity } from './utils';

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

  private _stateData: unknown = undefined;

  get state(): States {
    return this._state;
  }

  set state(newState: States) {
    this._state = newState;
  }
}

export const ActiveState = new State();

const stateHandlers = {
  [States.DEFAULT]: async ({ text, entities }: MessageInfo) => {
    const commandFromText = getCommandFromText(text, entities);
    const getMessage = messages.defaultState[commandFromText];
    const [message, options] = getMessage ? await getMessage() : messages.defaultState.error(!!commandFromText);
    await api.sendMessage(message, undefined, options);
  },
  [States.ADD_ALIAS_TO_BE_RECEIVED]: ({ text, entities }: MessageInfo) => {
    const commandFromText = getCommandFromText(text, entities);
    if (commandFromText) {
    }
  },
  [States.ADD_TARGET_TO_BE_RECEIVED]: ({ text, entities }: MessageInfo) => {},
  [States.GET_ALIAS_TO_BE_RECEIVED]: ({ text, entities }: MessageInfo) => {},
  [States.UPDATE_ALIAS_TO_BE_RECEIVED]: ({ text, entities }: MessageInfo) => {},
  [States.UPDATE_TARGET_TO_BE_RECEIVED]: ({ text, entities }: MessageInfo) => {},
  [States.DELETE_ALIAS_TO_BE_RECEIVED]: ({ text, entities }: MessageInfo) => {},
};

export async function stateSwitcher(message: MessageInfo): Promise<void> {
  console.log(ActiveState.state);
  await stateHandlers[ActiveState.state](message);
}
