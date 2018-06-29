/* eslint-env node, jasmine */
import {Store, IStore} from '..';

type Props = Readonly<{
	readonly value: string;
}>;

type State = Readonly<{
	count: number;
}>;

type AddMessage = {
	action: 'add';
	delta: number;
};

type PartialState = {
	count: number;
};

function actionAdd<State extends PartialState>(message: AddMessage, store: IStore<State, never>): void {
	const oldState = store.state;
	const newState = Object.assign({}, oldState, {count: oldState.count + message.delta});
	Object.freeze(newState);
	store.state = newState;
}

function sleep(delay: number = 1): Promise<void> {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, delay);
	});
}


it('State as Class', async() => {
	const store = new Store<State, Props, AddMessage>();
	store.register('add', actionAdd);
	store.serialize = state => {
		const props: Props = {
			value: `Count is ${state.count}`
		};
		Object.freeze(props);
		return props;
	};
	expect(typeof store.props).toBe('undefined', 'props initially');
	expect(typeof store.state).toBe('undefined', 'state initially');

	const spyOnProps = jasmine.createSpy();
	store.onprops = spyOnProps;
	expect(spyOnProps.calls.count()).toEqual(0, 'onprops initially');

	const spySchedule = spyOn(store, 'schedule').and.callThrough();
	expect(spySchedule.calls.count()).toEqual(0, 'schedule initially');

	store.state = {
		count: 0
	};
	await sleep();
	expect(spyOnProps.calls.count()).toEqual(1, 'onprops after initial state');
	expect(spySchedule.calls.count()).toEqual(0, 'schedule after initial state');
	expect(store.props).toEqual({value: 'Count is 0'});
	expect(typeof store.state).toBe('object', 'state is an Object after initial state');
	expect(store.state.count).toBe(0);

	store.schedule({
		action: 'add',
		delta: 1
	});
	await sleep();
	expect(spyOnProps.calls.count()).toEqual(2, 'onprops after @add');
	expect(spySchedule.calls.count()).toEqual(1, 'schedule after @add');
	expect(store.props).toEqual({value: 'Count is 1'});
	expect(typeof store.state).toBe('object', 'state is an Object after @add');
	expect(store.state.count).toBe(1);

	const calls = spyOnProps.calls.all();
	expect(calls[0].args).toEqual([{value: 'Count is 0'}]);
	expect(calls[1].args).toEqual([{value: 'Count is 1'}]);
});