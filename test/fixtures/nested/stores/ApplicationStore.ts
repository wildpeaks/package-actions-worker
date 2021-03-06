import {Store} from "../../../..";
import {ViewpointsStore, Props as ViewpointsProps} from "../stores/ViewpointsStore";
import {action as selectAction, actionId as selectActionId, Message as SelectMessage} from "../actions/selectViewpoint";
import {action as forwardAction, actionId as forwardActionId, Message as ForwardMessage} from "../actions/forwardViewpoints";


export type State = {
	selected: string;
	viewpoints: ViewpointsProps;
};

export type Props = {
	ids: string[];
	selected: string;
	viewpoint?: {
		position: string;
	};
};


function serialize(state: State): Props {
	const props: Props = {
		ids: Object.keys(state.viewpoints).sort(),
		selected: state.selected
	};
	if (state.selected in state.viewpoints) {
		const viewpoint = state.viewpoints[state.selected];
		props.viewpoint = {
			position: viewpoint.position
		};
	}
	return props;
}


export class ApplicationStore extends Store<State, Props, SelectMessage | ForwardMessage> {
	public viewpointsStore: ViewpointsStore;

	public constructor() {
		super();
		this.register(selectActionId, selectAction);
		this.register(forwardActionId, forwardAction);
		this.serialize = serialize;
	}

	public initialize(): void {
		const viewpointsStore = new ViewpointsStore();
		viewpointsStore.initialize();
		viewpointsStore.onprops = this.onViewpointsProps.bind(this);
		this.viewpointsStore = viewpointsStore;
		this.state = {
			selected: "",
			viewpoints: this.viewpointsStore.props
		};
	}

	public onViewpointsProps(props: ViewpointsProps): void {
		this.schedule({
			action: forwardActionId,
			viewpoints: props
		});
	}
}
