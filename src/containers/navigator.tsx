import * as React from "react";
import { connect } from "react-redux";
import { Navigator, ZoomDirection, PanDirection } from "../components/navigator";
import { QueryMapFeaturesResponse } from "../api/contracts/query";
import { RuntimeMap } from "../api/contracts/runtime-map";
import { getViewer, getCurrentScale } from "../api/runtime";
import { invokeCommand, setScale } from "../actions/map";
import { getCommand, DefaultCommands } from "../api/registry/command";
import { IMapView } from "../components/context";
import { Bounds } from "../components/map-viewer-base";

interface INavigatorContainerProps {
    style?: React.CSSProperties;
}

interface INavigatorContainerState {
    viewer?: any;
    view?: IMapView|Bounds;
}

interface INavigatorContainerDispatch {
    invokeCommand?: (cmd) => void;
    setScale?: (scale) => void;
}

function mapStateToProps(state): INavigatorContainerState {
    return {
        viewer: state.map.viewer,
        view: state.view.current
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setScale: (scale) => dispatch(setScale(scale)),
        invokeCommand: (cmd) => dispatch(invokeCommand(cmd))
    };
}

@connect(mapStateToProps, mapDispatchToProps)
export class NavigatorContainer extends React.Component<INavigatorContainerProps & INavigatorContainerState & INavigatorContainerDispatch, any> {
    private fnZoom: (direction) => void;
    private fnPan: (direction) => void;
    private fnRequestZoomToScale: (scale) => void;
    constructor(props) {
        super(props);
        this.fnZoom = this.onZoom.bind(this);
        this.fnPan = this.onPan.bind(this);
        this.fnRequestZoomToScale = this.onRequestZoomToScale.bind(this);
    }
    private onZoom(direction) {
        let cmd;
        switch (direction) {
            case ZoomDirection.In:
                cmd = getCommand(DefaultCommands.ZoomIn);
                break;
            case ZoomDirection.Out:
                cmd = getCommand(DefaultCommands.ZoomOut);
                break;
        }
        if (cmd != null)
            this.props.invokeCommand(cmd);
    }
    private onPan(direction) {
        let cmd;
        switch (direction) {
            case PanDirection.East:
                cmd = getCommand(DefaultCommands.PanRight);
                break;
            case PanDirection.West:
                cmd = getCommand(DefaultCommands.PanLeft);
                break;
            case PanDirection.North:
                cmd = getCommand(DefaultCommands.PanUp);
                break;
            case PanDirection.South:
                cmd = getCommand(DefaultCommands.PanDown);
                break;
        }
        if (cmd != null)
            this.props.invokeCommand(cmd);
    }
    private onRequestZoomToScale(scale: number) {
        this.props.setScale(scale);
    }
    render(): JSX.Element {
        const { style, viewer, view } = this.props;
        if (viewer != null && view != null) {
            const scale = getCurrentScale(view);
            return <Navigator style={style}
                              scale={scale}
                              busy={viewer.busyCount > 0}
                              onRequestZoomToScale={this.fnRequestZoomToScale}
                              onPan={this.fnPan}
                              onZoom={this.fnZoom} />;
        } else {
            return <div />;
        }
    }
}