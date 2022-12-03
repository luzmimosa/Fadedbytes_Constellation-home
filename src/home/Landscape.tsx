import React from "react";
import {LandscapeController} from "./LandscapeController";


export class Landscape extends React.Component<{
    controller: LandscapeController;
}, {

}> {

    private canvas: HTMLCanvasElement | undefined;

    componentDidMount() {
        this.props.controller.canvas = this.canvas!!;
    }

    render() {
        return (
            <canvas
                ref={ canvas => this.canvas = canvas!! }
                id={"landscape"}
                width={this.props.controller.width}
                height={this.props.controller.height}
            ></canvas>
        );
    }
}