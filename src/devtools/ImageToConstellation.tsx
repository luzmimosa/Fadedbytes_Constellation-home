import React from "react";

enum TrackerMode {
    AddStar,
    AddLine
}

export class ImageToConstellation extends React.Component<
    {
        image: string;
    }, {
        mode: TrackerMode;
        stars: {x: number, y: number}[];
}> {

    constructor(props: any) {
        super(props);
        this.state = {
            mode: TrackerMode.AddStar,
            stars: []
        };

        window.addEventListener("click", (e) => {
            this.handleClick(e.clientX, e.clientY);
        });

        // event listener for keydown the key L
        window.addEventListener("keydown", (e) => {
            switch (e.key.toLowerCase()) {
                case " ":
                    this.switchMode();
                    break;
                case "s":
                    this.save();
                    break;
                default:
                    break;
            }
        })
    }

    switchMode() {
        this.setState({
            mode: this.state.mode === TrackerMode.AddStar ? TrackerMode.AddLine : TrackerMode.AddStar
        })
    }

    save() {
        let minX = this.state.stars.reduce((prev, curr) => Math.min(prev, curr.x), Number.MAX_VALUE);
        let maxX = this.state.stars.reduce((prev, curr) => Math.max(prev, curr.x), Number.MIN_VALUE);

        let minY = this.state.stars.reduce((prev, curr) => Math.min(prev, curr.y), Number.MAX_VALUE);
        let maxY = this.state.stars.reduce((prev, curr) => Math.max(prev, curr.y), Number.MIN_VALUE);

        let constellationMin = Math.min(minX, minY);
        let constellationMax = Math.max(maxX, maxY);

        // scale the stars to be between 0 and 1 with the min and max factor
        let scaledStars = this.state.stars.map((star) => {
            return {
                x: (star.x - constellationMin) / (constellationMax - constellationMin),
                y: (star.y - constellationMin) / (constellationMax - constellationMin)
            }
        });

        console.log(JSON.stringify(scaledStars));

    }

    contentFromMode(): JSX.Element[] {
        switch (this.state.mode) {
            case TrackerMode.AddStar:
                return this.addStarMode();
            case TrackerMode.AddLine:
                return this.addLineMode();
            default:
                return [];
        }
    }


    addStarMode(): JSX.Element[] {
        return [
            (
                <img
                    alt={"Constellation image"}
                    src={this.props.image}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "",
                    }}
                />
            )
        ]
    }

    addLineMode(): JSX.Element[] {

        let stars: JSX.Element[] = [];

        for (let i = 0; i < this.state.stars.length; i++) {
            stars.push(
                <div
                    style={{
                        position: "absolute",
                        top: this.state.stars[i].y - 10,
                        left: this.state.stars[i].x - 10,

                        height: 20,
                        width: 20,
                        backgroundColor: "black",
                        borderRadius: "50%",
                        color: "white",
                        textAlign: "center",
                    }}
                >{i}</div>
            )
        }

        return stars;
    }

    handleClick(x: number, y: number) {
        if (this.state.mode === TrackerMode.AddStar) {
            this.setState({
                stars: [...this.state.stars, {x, y}]
            })
        } else {

        }
    }

    render() {
        return (
            <div className={"constellation-tracker"}>
                {this.contentFromMode()}
            </div>
        );
    }
}