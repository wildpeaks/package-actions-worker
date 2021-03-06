import {IStore} from "../../../..";
import {Message as LogMessage} from "../messages/log";

export type PartialState = {
	messages: string[];
};

export function action<State extends PartialState>(message: LogMessage, store: IStore<State, never>): void {
	const oldState = store.state;
	const newMessages = oldState.messages.concat([message.text]);
	const newState = Object.assign({}, oldState, {messages: newMessages});
	Object.freeze(newState);
	store.state = newState;
}
